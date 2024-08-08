import React from 'react';
import { Typography, message, Button, Form } from 'antd';
import { useEntities } from '../hooks/useEntities';
import { useProjectName } from '../hooks/useProjectName';
import EntityForm from '../components/EntityForm';
import FileUpload from '../components/FileUpload';
import ProjectForm from '../components/ProjectForm';
import { createProject } from '../services/ProjectService';
import { readFile } from '../services/FileService';
import { RcFile } from 'antd/es/upload';

const { Title } = Typography;

const Home: React.FC = () => {
  const { projectName, setProjectName } = useProjectName();
  const { entities, setEntities, addEntity, updateEntityName, addProperty, updateProperty, removeProperty } = useEntities();

  const handleCreateProject = async () => {
    const projectData = { projectName, entities };
    try {
      await createProject(projectData);
      message.success('Project created successfully');
    } catch (error) {
      message.error(`Failed to create project: ${error.message}`);
    }
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
    </div>
  );
};

export default Home;
