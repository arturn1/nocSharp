import React from 'react';
import { Space, Card, Row, Col, Statistic, Typography, Button, Badge, Divider } from 'antd';
import { 
  DatabaseOutlined, 
  ScanOutlined, 
  CodeOutlined, 
  FileTextOutlined, 
  SettingOutlined, 
  BarChartOutlined,
  ThunderboltOutlined,
  ApiOutlined,
  FolderOpenOutlined,
  PlusCircleOutlined,
  RocketOutlined
} from '@ant-design/icons';
import { EntityChangeDetector } from '../../services/EntityChangeDetector';
import { Entity } from '../../models/Entity';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Text } = Typography;

interface HomePageProps {
  projectName?: string;
  entities: Entity[];
  onMenuChange: (key: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({
  projectName,
  entities,
  onMenuChange
}) => {
  const { isDarkMode } = useTheme();
  const entityStats = EntityChangeDetector.calculateEntityStats(entities);
  const filteredEntities = EntityChangeDetector.filterNonBaseEntities(entities);
  
  // Cores frias e sobrias
  const colors = {
    primary: '#4A90E2',      // Azul acinzentado
    secondary: '#5D6D7E',    // Cinza azulado
    accent: '#52648B',       // Azul escuro
    success: '#2E8B57',      // Verde mar
    warning: '#708090',      // Cinza ardósia
    info: '#36648B',         // Azul aço
    text: isDarkMode ? '#E8F4FD' : '#2C3E50',
    background: isDarkMode ? '#1A1A1A' : '#F8FAFC'
  };

  const quickActions = [
    {
      key: 'import',
      title: 'Importar DBDiagram',
      description: 'Cole código do dbdiagram.io ou carregue arquivo .dbml',
      icon: <DatabaseOutlined />,
      color: colors.primary,
      gradient: `linear-gradient(135deg, ${colors.primary} 0%, #3A7BD5 100%)`,
      tag: 'Rápido'
    },
    {
      key: 'scanner',
      title: 'Carregar Projeto',
      description: 'Escaneie projeto nocSharp existente para carregar entidades',
      icon: <ScanOutlined />,
      color: colors.success,
      gradient: `linear-gradient(135deg, ${colors.success} 0%, #228B22 100%)`,
      tag: 'Análise'
    },
    {
      key: 'templates',
      title: 'Templates',
      description: 'Use templates predefinidos para acelerar desenvolvimento',
      icon: <FileTextOutlined />,
      color: colors.accent,
      gradient: `linear-gradient(135deg, ${colors.accent} 0%, #4169E1 100%)`,
      tag: 'Produtividade'
    },
    {
      key: 'dashboard',
      title: 'Dashboard .NET',
      description: 'Monitore métricas do projeto e arquitetura em tempo real',
      icon: <BarChartOutlined />,
      color: colors.info,
      gradient: `linear-gradient(135deg, ${colors.info} 0%, #4682B4 100%)`,
      tag: 'Análise'
    }
  ];

  return (
    <div style={{
      padding: '24px',
      background: colors.background,
      minHeight: '100vh'
    }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Header Principal */}
        <Card 
          className="animate-fade-in-scale shadow-soft"
          style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
              : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            border: isDarkMode ? '1px solid #374151' : '1px solid #cbd5e1',
            borderRadius: '16px',
            boxShadow: isDarkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <Row align="middle" justify="space-between">
            <Col>
              <Space align="center" size="large">
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${colors.primary} 0%, #3A7BD5 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 24px ${colors.primary}30`
                }}>
                  <RocketOutlined style={{ fontSize: '32px', color: 'white' }} />
                </div>
                <div>
                  <Title 
                    level={2} 
                    className="text-gradient"
                    style={{ 
                      margin: 0,
                      fontSize: '28px'
                    }}
                  >
                    nocSharp Generator
                  </Title>
                  <Text 
                    style={{ 
                      fontSize: '16px',
                      color: isDarkMode ? '#94A3B8' : '#64748B',
                      fontWeight: '500'
                    }}
                  >
                    Plataforma de desenvolvimento .NET para desenvolvedores
                  </Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Space size="large">
                <Badge 
                  status={projectName ? 'processing' : 'default'} 
                  text={
                    <Text strong style={{ 
                      color: projectName 
                        ? (isDarkMode ? colors.primary : colors.accent)
                        : (isDarkMode ? '#6B7280' : '#9CA3AF'),
                      fontSize: '14px'
                    }}>
                      {projectName ? 'Projeto Ativo' : 'Nenhum Projeto'}
                    </Text>
                  }
                />
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Status do Projeto */}
        {projectName && (
          <Card
            className="animate-fade-in-up shadow-soft"
            title={
              <Space>
                <CodeOutlined style={{ color: colors.primary }} />
                <Text strong style={{ color: colors.text, fontSize: '16px' }}>
                  Status do Projeto: {projectName}
                </Text>
              </Space>
            }
            style={{
              borderRadius: '12px',
              backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
              borderColor: isDarkMode ? '#374151' : '#e2e8f0'
            }}
          >
            <Row gutter={[32, 16]}>
              <Col xs={24} sm={8}>
                <Statistic
                  title={
                    <Text style={{ 
                      color: isDarkMode ? '#94A3B8' : '#64748B',
                      fontSize: '13px'
                    }}>
                      Entidades
                    </Text>
                  }
                  value={filteredEntities.length}
                  valueStyle={{ 
                    color: colors.primary,
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}
                  prefix={<DatabaseOutlined />}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title={
                    <Text style={{ 
                      color: isDarkMode ? '#94A3B8' : '#64748B',
                      fontSize: '13px'
                    }}>
                      Propriedades
                    </Text>
                  }
                  value={entityStats.totalProperties}
                  valueStyle={{ 
                    color: colors.accent,
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}
                  prefix={<SettingOutlined />}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title={
                    <Text style={{ 
                      color: isDarkMode ? '#94A3B8' : '#64748B',
                      fontSize: '13px'
                    }}>
                      Complexidade
                    </Text>
                  }
                  value={entityStats.averagePropertiesPerEntity}
                  precision={1}
                  valueStyle={{ 
                    color: colors.success,
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}
                  prefix={<BarChartOutlined />}
                  suffix="avg"
                />
              </Col>
            </Row>
          </Card>
        )}

        {/* Ações Rápidas */}
        <div>
          <Title level={3} style={{ 
            color: colors.text,
            marginBottom: '24px',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            Ações Rápidas
          </Title>
          
          <Row gutter={[24, 24]}>
            {quickActions.map((action, index) => (
              <Col xs={24} sm={12} lg={6} key={action.key}>
                <Card
                  hoverable
                  onClick={() => onMenuChange(action.key)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '12px',
                    height: '220px',
                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    borderColor: isDarkMode ? '#374151' : '#e2e8f0',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  className="quick-action-card"
                >
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    width: '60px',
                    height: '60px',
                    background: action.gradient,
                    borderRadius: '0 12px 0 100%',
                    opacity: 0.1
                  }} />
                  
                  <div>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: action.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      boxShadow: `0 4px 16px ${action.color}30`
                    }}>
                      {React.cloneElement(action.icon, {
                        style: { fontSize: '24px', color: 'white' }
                      })}
                    </div>
                    
                    <Title level={5} style={{ 
                      margin: '0 0 8px 0',
                      color: colors.text,
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      {action.title}
                    </Title>
                    
                    <Text style={{ 
                      color: isDarkMode ? '#94A3B8' : '#64748B',
                      fontSize: '13px',
                      lineHeight: '1.5'
                    }}>
                      {action.description}
                    </Text>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: '16px',
                  }}>
                    <Badge 
                      color={action.color}
                      text={
                        <Text style={{ 
                          color: isDarkMode ? '#94A3B8' : '#64748B',
                          fontSize: '12px'
                        }}>
                          {action.tag}
                        </Text>
                      }
                    />
                    <ThunderboltOutlined style={{ 
                      color: action.color,
                      fontSize: '16px'
                    }} />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Space>
    </div>
  );
};

export default HomePage;
