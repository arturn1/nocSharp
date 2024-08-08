import React from 'react';
import { Form, Input } from 'antd';

interface ProjectFormProps {
  projectName: string;
  setProjectName: (name: string) => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ projectName, setProjectName }) => {
  return (
    <Form.Item label="Project Name">
      <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
    </Form.Item>
  );
};

export default ProjectForm;
