import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Button, 
  Typography, 
  Space, 
  Spin, 
  Alert,
  Tag,
  Badge,
  Popover,
  Tooltip
} from 'antd';
import {
  ProjectOutlined,
  DatabaseOutlined,
  ApiOutlined,
  InfoCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { DotNetProjectAnalyzer, type DotNetProjectAnalysis } from '../../services/DotNetProjectAnalyzer';
import { useAppContext } from '../../contexts/AppContext';
import { useTheme } from '../../contexts/ThemeContext';
import APIEndpoints from './components/APIEndpoints';

const { Title, Text } = Typography;

interface DotNetDashboardProps {
  projectPath?: string;
}

const DotNetDashboard: React.FC<DotNetDashboardProps> = ({ projectPath }) => {
  const { state } = useAppContext();
  const { isDarkMode } = useTheme();
  const [analysis, setAnalysis] = useState<DotNetProjectAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const currentPath = projectPath || state.directoryPath;

  useEffect(() => {
    if (currentPath) {
      handleAnalysis();
    }
  }, [currentPath]);

  const handleAnalysis = async () => {
    if (!currentPath) return;

    setLoading(true);
    setError(null);

    try {
      const result = await DotNetProjectAnalyzer.analyzeProject(currentPath);
      setAnalysis(result);
    } catch (err) {
      console.error('Erro ao analisar projeto:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    handleAnalysis();
  };

  if (!currentPath) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <ProjectOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
        <Title level={3} type="secondary">
          Nenhum Projeto Selecionado
        </Title>
        <Text type="secondary">
          Selecione um diretório com projeto .NET para ver o dashboard completo
        </Text>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text>Analisando projeto .NET...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Erro ao Carregar Dashboard"
          description={error}
          type="error"
          showIcon
          style={{
            backgroundColor: isDarkMode ? '#2a1f1f' : '#fff2f0',
            borderColor: isDarkMode ? '#5c3d3d' : '#ffccc7',
            color: isDarkMode ? '#ff7875' : '#cf1322'
          }}
          action={
            <Button size="small" onClick={handleRefresh}>
              Tentar Novamente
            </Button>
          }
        />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Nenhum Projeto Analisado"
          description="Não foi possível analisar o projeto .NET selecionado"
          type="warning"
          showIcon
          style={{
            backgroundColor: isDarkMode ? '#2d2a1f' : '#fffbe6',
            borderColor: isDarkMode ? '#594214' : '#ffe58f',
            color: isDarkMode ? '#d4b106' : '#d48806'
          }}
        />
      </div>
    );
  }

  // Componente para estatísticas com Popover informativo
  const StatisticWithInfo = ({ 
    title, 
    value, 
    prefix, 
    suffix,
    info,
    color 
  }: {
    title: string;
    value: number | string;
    prefix?: React.ReactNode;
    suffix?: string;
    info: string;
    color?: string;
  }) => (
    <Popover 
      content={
        <div style={{
          backgroundColor: isDarkMode ? '#141414' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#000000',
          padding: '8px',
          borderRadius: '6px',
          maxWidth: '250px'
        }}>
          {info}
        </div>
      }
      title={
        <span style={{ 
          color: isDarkMode ? '#ffffff' : '#000000',
          fontWeight: 'bold'
        }}>
          Informação
        </span>
      }
      trigger="hover"
      overlayStyle={{
        backgroundColor: isDarkMode ? '#141414' : '#ffffff'
      }}
    >
      <Statistic
        title={
          <Space>
            {title}
            <Tooltip title="Clique para mais informações">
              <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
            </Tooltip>
          </Space>
        }
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={{ color }}
      />
    </Popover>
  );

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '32px' }}>
        <Col>
          <Space align="center" size="large">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
            }}>
              <ProjectOutlined style={{ fontSize: '32px', color: 'white' }} />
            </div>
            <div>
              <Title level={2} style={{ margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Dashboard .NET
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Análise completa do projeto
              </Text>
            </div>
          </Space>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            size="large"
            style={{
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
          >
            Atualizar
          </Button>
        </Col>
      </Row>

      {/* Métricas Principais */}
      <Card 
        title={
          <Space>
            <DatabaseOutlined style={{ color: '#1890ff' }} />
            Métricas do Projeto
          </Space>
        }
        extra={
          <Popover 
            content={
              <div style={{
                backgroundColor: isDarkMode ? '#141414' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#000000',
                padding: '8px',
                borderRadius: '6px'
              }}>
                Informações sobre a estrutura e organização do projeto
              </div>
            }
            title={
              <span style={{ 
                color: isDarkMode ? '#ffffff' : '#000000',
                fontWeight: 'bold'
              }}>
                Informação
              </span>
            }
            overlayStyle={{
              backgroundColor: isDarkMode ? '#141414' : '#ffffff'
            }}
          >
            <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
          </Popover>
        }
        style={{ 
          marginBottom: '32px',
          borderRadius: '12px',
          boxShadow: isDarkMode ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Row gutter={[32, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <StatisticWithInfo
              title="Entidades"
              value={analysis.database.entities.length}
              prefix={<DatabaseOutlined style={{ color: '#52c41a' }} />}
              info={`Total de entidades (modelos de dados) encontradas no projeto. Estas representam as tabelas do banco de dados e são a base da aplicação.`}
              color="#52c41a"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatisticWithInfo
              title="API Controllers"
              value={analysis.controllers.length}
              prefix={<ApiOutlined style={{ color: '#1890ff' }} />}
              info={`Número de controllers de API gerados ou detectados baseados nas entidades. Cada controller fornece endpoints REST para uma entidade.`}
              color="#1890ff"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatisticWithInfo
              title="Endpoints"
              value={analysis.controllers.reduce((total, controller) => total + controller.endpoints.length, 0)}
              prefix={<ApiOutlined style={{ color: '#fa541c' }} />}
              info={`Total de endpoints de API disponíveis. Inclui operações GET, POST, PUT e DELETE para todas as entidades.`}
              color="#fa541c"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatisticWithInfo
              title="Configuração"
              value={analysis.appSettings.environments.length}
              prefix={<DatabaseOutlined style={{ color: '#722ed1' }} />}
              info={`Número de ambientes configurados no projeto (Development, Production, etc.). Configurações são essenciais para deploy e manutenção.`}
              color="#722ed1"
            />
          </Col>
        </Row>
      </Card>

      {/* Entidades do Projeto */}
      {analysis.database.entities.length > 0 && (
        <Card 
          title={
            <Space>
              <DatabaseOutlined style={{ color: '#52c41a' }} />
              Entidades do Projeto
              <Badge count={analysis.database.entities.length} style={{ backgroundColor: '#52c41a' }} />
            </Space>
          }
          style={{ 
            marginBottom: '32px',
            borderRadius: '12px',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
          extra={
            <Popover 
              content={
                <div style={{
                  backgroundColor: isDarkMode ? '#141414' : '#ffffff',
                  color: isDarkMode ? '#ffffff' : '#000000',
                  padding: '8px',
                  borderRadius: '6px'
                }}>
                  Lista de todas as entidades (modelos de dados) encontradas no projeto
                </div>
              }
              title={
                <span style={{ 
                  color: isDarkMode ? '#ffffff' : '#000000',
                  fontWeight: 'bold'
                }}>
                  Informação
                </span>
              }
              overlayStyle={{
                backgroundColor: isDarkMode ? '#141414' : '#ffffff'
              }}
            >
              <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
            </Popover>
          }
        >
          <Row gutter={[12, 12]}>
            {analysis.database.entities.map((entity: any, index: number) => (
              <Col key={index}>
                <Popover 
                  content={
                    <div style={{ 
                      maxWidth: '280px',
                      backgroundColor: isDarkMode ? '#141414' : '#ffffff',
                      color: isDarkMode ? '#ffffff' : '#000000',
                      padding: '12px',
                      borderRadius: '8px'
                    }}>
                      <p style={{ margin: '8px 0', color: isDarkMode ? '#ffffff' : '#000000' }}>
                        <strong>Nome:</strong> {entity.name}
                      </p>
                      <p style={{ margin: '8px 0', color: isDarkMode ? '#ffffff' : '#000000' }}>
                        <strong>Propriedades:</strong> {entity.properties?.length || 0}
                      </p>
                      <p style={{ margin: '8px 0', color: isDarkMode ? '#ffffff' : '#000000' }}>
                        <strong>Tipo:</strong> Entidade de Dados
                      </p>
                      {entity.properties && entity.properties.length > 0 && (
                        <>
                          <p style={{ margin: '8px 0', color: isDarkMode ? '#ffffff' : '#000000' }}>
                            <strong>Principais Propriedades:</strong>
                          </p>
                          <ul style={{ 
                            marginLeft: '16px', 
                            paddingLeft: 0,
                            color: isDarkMode ? '#d9d9d9' : '#666666'
                          }}>
                            {entity.properties.slice(0, 3).map((prop: any, i: number) => (
                              <li key={i} style={{ marginBottom: '4px' }}>
                                <code style={{ 
                                  backgroundColor: isDarkMode ? '#262626' : '#f5f5f5',
                                  color: isDarkMode ? '#ffffff' : '#000000',
                                  padding: '2px 4px',
                                  borderRadius: '3px'
                                }}>
                                  {prop.name}
                                </code> 
                                <Text type="secondary" style={{ 
                                  color: isDarkMode ? '#8c8c8c' : '#666666' 
                                }}>
                                  ({prop.type})
                                </Text>
                              </li>
                            ))}
                            {entity.properties.length > 3 && (
                              <li style={{ color: isDarkMode ? '#8c8c8c' : '#666666' }}>
                                ... e mais {entity.properties.length - 3} propriedades
                              </li>
                            )}
                          </ul>
                        </>
                      )}
                    </div>
                  }
                  title={
                    <span style={{ 
                      color: isDarkMode ? '#ffffff' : '#000000',
                      fontWeight: 'bold'
                    }}>
                      Entidade: {entity.name}
                    </span>
                  }
                  overlayStyle={{
                    backgroundColor: isDarkMode ? '#141414' : '#ffffff'
                  }}
                >
                  <Tag 
                    color="purple" 
                    style={{ 
                      cursor: 'pointer',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      margin: '4px',
                      fontSize: '13px',
                      border: '1px solid #d3adf7'
                    }}
                  >
                    {entity.name}
                  </Tag>
                </Popover>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Informações de Configuração */}
      {analysis.appSettings.environments.length > 0 && (
        <Card 
          title="Configurações" 
          extra={
            <Popover 
              content={
                <div style={{
                  backgroundColor: isDarkMode ? '#141414' : '#ffffff',
                  color: isDarkMode ? '#ffffff' : '#000000',
                  padding: '8px',
                  borderRadius: '6px'
                }}>
                  Ambientes e configurações detectadas no projeto
                </div>
              }
              title={
                <span style={{ 
                  color: isDarkMode ? '#ffffff' : '#000000',
                  fontWeight: 'bold'
                }}>
                  Informação
                </span>
              }
              overlayStyle={{
                backgroundColor: isDarkMode ? '#141414' : '#ffffff'
              }}
            >
              <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
            </Popover>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Space direction="vertical">
                <Text strong>Ambientes Configurados:</Text>
                <Space wrap>
                  {analysis.appSettings.environments.map((env, index) => (
                    <Tag key={index} color={env === 'Production' ? 'red' : 'green'}>
                      {env}
                    </Tag>
                  ))}
                </Space>
              </Space>
            </Col>
            {analysis.database.connectionStrings.length > 0 && (
              <Col xs={24} md={12}>
                <Space direction="vertical">
                  <Text strong>Connection Strings:</Text>
                  {analysis.database.connectionStrings.map((conn, index) => (
                    <Popover 
                      key={index}
                      content={
                        <div style={{
                          backgroundColor: isDarkMode ? '#141414' : '#ffffff',
                          color: isDarkMode ? '#ffffff' : '#000000',
                          padding: '8px',
                          borderRadius: '6px'
                        }}>
                          Ambiente: {conn.environment}
                        </div>
                      }
                      title={
                        <span style={{ 
                          color: isDarkMode ? '#ffffff' : '#000000',
                          fontWeight: 'bold'
                        }}>
                          Connection String
                        </span>
                      }
                      overlayStyle={{
                        backgroundColor: isDarkMode ? '#141414' : '#ffffff'
                      }}
                    >
                      <Tag color="blue" style={{ cursor: 'pointer' }}>
                        {conn.name}
                      </Tag>
                    </Popover>
                  ))}
                </Space>
              </Col>
            )}
          </Row>
        </Card>
      )}

      {/* Controllers e API Endpoints - Usando dados reais */}
      {analysis.controllers.length > 0 && (
        <APIEndpoints analysis={analysis} />
      )}
    </div>
  );
};

export default DotNetDashboard;
