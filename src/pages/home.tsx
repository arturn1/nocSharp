import React, { useState } from 'react';
import { Typography, message, Button, Form, Modal, Input, Select } from 'antd';
import { useEntities } from '../hooks/useEntities';
import { useProjectName } from '../hooks/useProjectName';
import EntityForm from '../components/EntityForm';
import FileUpload from '../components/FileUpload';
import ProjectForm from '../components/ProjectForm';
import { createProject } from '../services/ProjectService';
import { readFile } from '../services/FileService';
import { RcFile } from 'antd/es/upload';

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

  const handleCreateProject = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (!directoryPath) {
      message.error('Please select a directory first.');
      return;
    }
    const projectData = { projectName, entities };
    const result = await createProject(projectData, directoryPath, executeCommands, isExistingProject);
    setLogs(result.logs);
    setErrors(result.errors);

    if (result.success) {
      message.success(isExistingProject ? 'Entities added successfully' : 'Project created successfully');
      setIsModalVisible(false);
    } else {
      message.error('Failed to process request');
    }
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
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={{ disabled: !directoryPath }}
      >
        <Form.Item label="Directory Path">
          <Input value={directoryPath} readOnly />
        </Form.Item>
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
