import React from 'react';
import { Space, Card, Row, Col, Typography, Tag } from 'antd';
import { CodeOutlined, ThunderboltOutlined, BulbOutlined, RocketOutlined } from '@ant-design/icons';
import EntityTemplates from '../../components/EntityTemplates';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Text } = Typography;

interface TemplatesPageProps {
  onApplyTemplate: (templateEntities: any[]) => void;
}

const TemplatesPage: React.FC<TemplatesPageProps> = ({ onApplyTemplate }) => {
  const { isDarkMode } = useTheme();
  
  const colors = {
    background: isDarkMode 
      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    surface: isDarkMode ? '#1e293b' : '#ffffff',
    primary: '#4A90E2',
    secondary: '#5D6D7E',
    accent: '#52648B',
    text: isDarkMode ? '#f1f5f9' : '#1e293b',
    textSecondary: isDarkMode ? '#94a3b8' : '#64748b'
  };

  const templateFeatures = [
    {
      icon: <ThunderboltOutlined />,
      title: 'Templates Pré-configurados',
      description: 'Modelos otimizados para diferentes cenários',
      color: colors.primary
    },
    {
      icon: <BulbOutlined />,
      title: 'Padrões de Indústria',
      description: 'Baseados em melhores práticas do mercado',
      color: '#f59e0b'
    },
    {
      icon: <RocketOutlined />,
      title: 'Produtividade Aumentada',
      description: 'Acelere o desenvolvimento de projetos',
      color: '#22c55e'
    }
  ];

  return (
    <div style={{
      padding: '24px',
      background: colors.background,
      minHeight: '100vh'
    }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <EntityTemplates onApplyTemplate={onApplyTemplate} />
        </div>
      </Space>
    </div>
  );
};

export default TemplatesPage;
