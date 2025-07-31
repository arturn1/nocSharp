import React from 'react';
import { Space } from 'antd';
import EntityTemplates from '../../components/EntityTemplates';

interface TemplatesPageProps {
  onApplyTemplate: (templateEntities: any[]) => void;
}

const TemplatesPage: React.FC<TemplatesPageProps> = ({ onApplyTemplate }) => {
  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <EntityTemplates onApplyTemplate={onApplyTemplate} />
    </Space>
  );
};

export default TemplatesPage;
