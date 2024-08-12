import React, { useState } from 'react';
import { Typography, message, Button, Form, Modal, Input, Select } from 'antd';
import { useEntities } from '../hooks/useEntities';
import { useProjectName } from '../hooks/useProjectName';
import EntityForm from '../components/EntityForm';
import FileUpload from '../components/FileUpload';
import ProjectForm from '../components/ProjectForm';
import { checkEntityExists, createProject } from '../services/ProjectService';
import { readFile } from '../services/FileService';
import { RcFile } from 'antd/es/upload';
import { Entity } from '../models/Entity';

const { Title, Text } = Typography;
const { Option } = Select;

const Home: React.FC = () => {
  const { projectName, setProjectName } = useProjectName();
  const { entities, setEntities, addEntity, updateEntityName, addProperty, updateProperty, removeProperty, removeEntity } = useEntities();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [directoryPath, setDirectoryPath] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [executeCommands, setExecuteCommands] = useState(true);
  const [isExistingProject, setIsExistingProject] = useState(false);
  const [existingEntities, setExistingEntities] = useState<Entity[]>([]);
  const [overwriteChoices, setOverwriteChoices] = useState<Record<string, boolean>>({});

  const handleCreateProject = () => {
    // Abre o modal para confirmação de criação do projeto
    setIsModalVisible(true);
  };

  const handleConfirmOverwrite = () => {
    // Filtra as entidades, mantendo apenas as que devem ser sobrescritas ou que não existiam anteriormente
    const filteredEntities = entities.filter(entity =>
      !existingEntities.includes(entity) || overwriteChoices[entity.name]
    );

    // Atualiza a lista de entidades a serem criadas ou sobrescritas
    const projectData = { projectName, entities: filteredEntities };

    // Continua com a criação ou atualização do projeto
    proceedWithProjectCreation();
  };

  const handleOk = async () => {
    // Verifica se um diretório foi selecionado
    if (!directoryPath) {
      message.error('Please select a directory first.');
      return;
    }

    // Se for um projeto existente, verifica as entidades
    if (isExistingProject) {
      const existingEntitiesList: Entity[] = [];

      for (const entity of entities) {
        const exists = await checkEntityExists(directoryPath, entity.name);
        if (exists) {
          existingEntitiesList.push(entity);
        }
      }

      if (existingEntitiesList.length > 0) {
        // Se entidades existentes forem encontradas, exibe o modal para sobrescrita
        setExistingEntities(existingEntitiesList);
        const initialChoices: Record<string, boolean> = {};
        entities.forEach(entity => {
          if (existingEntitiesList.includes(entity)) {
            initialChoices[entity.name] = false; // Default to not overwrite
          } else {
            initialChoices[entity.name] = true; // New entities default to create
          }
        });
        setOverwriteChoices(initialChoices);
        return; // Pausar para exibir o modal de confirmação
      }
    }


    // Se for um novo projeto ou nenhuma entidade existente for encontrada, prossegue com a criação
    proceedWithProjectCreation();
  };

  const proceedWithProjectCreation = async () => {
    // eslint-disable-next-line no-debugger
    let filteredEntities: Entity[] = [];
    if (isExistingProject) {
      filteredEntities = entities.filter(entity =>
        overwriteChoices[entity.name]
      );
    } else {
      filteredEntities = entities;
    }

    const projectData = { projectName, entities: filteredEntities };
    const result = await createProject(projectData, directoryPath, executeCommands, isExistingProject);
    setLogs(result.logs);
    setErrors(result.errors);

    if (result.success) {
      message.success(isExistingProject ? 'Entities added successfully' : 'Project created successfully');
      setIsModalVisible(false);
      setExistingEntities([]);
      setOverwriteChoices({});
    } else {
      message.error('Failed to process request');
    }
  };

  const handleCancelOverwrite = () => {
    setExistingEntities([]);
    setOverwriteChoices({});
  };

  const handleOverwriteChoiceChange = (entityName: string, value: boolean) => {
    setOverwriteChoices(prevChoices => ({
      ...prevChoices,
      [entityName]: value,
    }));
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleFileUpload = async (file: RcFile) => {
    try {
      const projectData = await readFile(file);
      const fileNameWithoutExtension = file.name.split('.').slice(0, -1).join('.');
      setEntities(projectData.entities);
      setProjectName(fileNameWithoutExtension);
    } catch (error) {
      message.error(`Failed to read file: ${error.message}`);
    }
  };

  const openDirectorySelector = async (existingProject: boolean) => {
    try {
      const result = await window.electron.dialog.showOpenDialog({
        properties: ['openDirectory'],
      });
      if (!result.canceled && result.filePaths.length > 0) {
        setDirectoryPath(result.filePaths[0]);
        setIsExistingProject(existingProject);
        message.success('Directory selected successfully');
      } else {
        message.error('No directory selected');
      }
    } catch (err) {
      message.error(`Failed to select directory: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Create or Update Project</Title>
      <Form layout="vertical">
        <div style={{ marginBottom: '20px' }}>
          <ProjectForm projectName={projectName} setProjectName={setProjectName} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <FileUpload onFileUpload={handleFileUpload} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <EntityForm
            entities={entities}
            addEntity={addEntity}
            updateEntityName={updateEntityName}
            addProperty={addProperty}
            updateProperty={updateProperty}
            removeProperty={removeProperty}
            removeEntity={removeEntity}
          />
        </div>
        <Form.Item label="Execute Commands">
          <Select value={executeCommands ? 'yes' : 'no'} onChange={(value) => setExecuteCommands(value === 'yes')}>
            <Option value="yes">Yes</Option>
            <Option value="no">No</Option>
          </Select>
        </Form.Item>
        {projectName && entities.length > 0 && (
          <Button type="primary" onClick={handleCreateProject} style={{ marginTop: '20px', marginRight: '10px' }}>
            {isExistingProject ? 'Add Entities to Project' : 'Create Project'}
          </Button>
        )}
        <Button onClick={() => openDirectorySelector(false)} style={{ marginRight: '10px' }}>
          Select Directory for New Project
        </Button>
        <Button onClick={() => openDirectorySelector(true)}>
          Select Directory for Existing Project
        </Button>
      </Form>
      <Modal
        title="Select Directory"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={{ disabled: !directoryPath }}
      >
        <Form.Item label="Directory Path">
          <Input value={directoryPath} readOnly />
        </Form.Item>
      </Modal>

      <Modal
        title="Entities Exist"
        open={existingEntities.length > 0}
        onOk={handleConfirmOverwrite}
        onCancel={handleCancelOverwrite}
      >
        <Text>The following entities already exist:</Text>
        <Form layout="vertical">
          {existingEntities.map((entity, index) => (
            <Form.Item key={index} label={entity.name}>
              <Select
                value={overwriteChoices[entity.name]}
                onChange={(value) => handleOverwriteChoiceChange(entity.name, value)}
              >
                <Option value={false}>Keep Existing</Option>
                <Option value={true}>Overwrite</Option>
              </Select>
            </Form.Item>
          ))}
          <Text>The following entities will be created:</Text>
          {entities.filter(entity => !existingEntities.includes(entity)).map((entity, index) => (
            <Form.Item key={index} label={entity.name}>
              <Select value={true} disabled>
                <Option value={true}>Create</Option>
              </Select>
            </Form.Item>
          ))}
        </Form>
        <Text>Do you want to overwrite the selected entities?</Text>
      </Modal>

      <div style={{ marginTop: '20px' }}>
        <Title level={4}>Execution Logs</Title>
        {logs.map((log, index) => (
          <Text key={index} style={{ display: 'block' }}>{log}</Text>
        ))}
        {errors.length > 0 && (
          <>
            <Title level={4} type="danger">Errors</Title>
            {errors.map((error, index) => (
              <Text key={index} type="danger" style={{ display: 'block' }}>{error}</Text>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
