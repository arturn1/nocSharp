import React, { useState } from 'react';
import { Typography, message, Button, Form, Modal, Input } from 'antd';
import { useEntities } from '../hooks/useEntities';
import { useProjectName } from '../hooks/useProjectName';
import EntityForm from '../components/EntityForm';
import FileUpload from '../components/FileUpload';
import ProjectForm from '../components/ProjectForm';
import { createProject } from '../services/ProjectService';
import { readFile } from '../services/FileService';
import { RcFile } from 'antd/es/upload';

const { Title, Text } = Typography;

const Home: React.FC = () => {
  const { projectName, setProjectName } = useProjectName();
  const { entities, setEntities, addEntity, updateEntityName, addProperty, updateProperty, removeProperty } = useEntities();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [directoryPath, setDirectoryPath] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleCreateProject = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (!directoryPath) {
      message.error('Please select a directory first.');
      return;
    }
    const projectData = { projectName, entities };
    const result = await createProject(projectData, directoryPath);
    setLogs(result.logs);
    setErrors(result.errors);

    if (result.success) {
      message.success('Project created successfully');
      setIsModalVisible(false);
    } else {
      message.error('Failed to create project');
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

  const openDirectorySelector = async () => {
    try {
      const result = await window.electron.dialog.showOpenDialog({
        properties: ['openDirectory'],
      });
      if (!result.canceled && result.filePaths.length > 0) {
        setDirectoryPath(result.filePaths[0]);
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
      <Title level={2}>Create Project</Title>
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
          />
        </div>
        {projectName && entities.length > 0 && (
          <Button type="primary" onClick={handleCreateProject} style={{ marginTop: '20px' }}>
            Create Project
          </Button>
        )}
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
          <Button onClick={openDirectorySelector} style={{ marginTop: '10px' }}>
            Select Directory
          </Button>
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
