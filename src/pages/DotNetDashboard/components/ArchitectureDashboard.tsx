import React from 'react';
import { Card, Row, Col, Space, Typography, Tag, List, Badge } from 'antd';
import { 
  CodeOutlined, 
  ApiOutlined, 
  DatabaseOutlined, 
  SettingOutlined,
  CloudOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import type { DotNetProjectAnalysis } from '../../../services/DotNetProjectAnalyzer';

const { Title, Text } = Typography;

interface ArchitectureDashboardProps {
  analysis: DotNetProjectAnalysis;
}

const ArchitectureDashboard: React.FC<ArchitectureDashboardProps> = ({ analysis }) => {
  const layerIcons = {
    'API': <ApiOutlined style={{ color: '#1890ff' }} />,
    'Domain': <CodeOutlined style={{ color: '#52c41a' }} />,
    'Application': <SettingOutlined style={{ color: '#faad14' }} />,
    'Infrastructure': <DatabaseOutlined style={{ color: '#722ed1' }} />,
    'IoC': <CloudOutlined style={{ color: '#fa8c16' }} />,
    'Tests': <SafetyOutlined style={{ color: '#eb2f96' }} />
  };

  const layerDescriptions = {
    'API': 'Camada de apresentação - Controllers, middlewares, configuração de rotas',
    'Domain': 'Regras de negócio - Entidades, comandos, validações de domínio',
    'Application': 'Serviços de aplicação - DTOs, interfaces, orquestração',
    'Infrastructure': 'Acesso a dados - Repositories, contexto do EF Core, migrations',
    'IoC': 'Injeção de dependência - Configuração de containers DI',
    'Tests': 'Testes automatizados - Testes unitários e de integração'
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {/* Visão da Arquitetura em Camadas */}
      <Card title={<><CodeOutlined /> Arquitetura em Camadas</>}>
        <Row gutter={[16, 16]}>
          {analysis.projects.map((project) => (
            <Col xs={24} sm={12} md={8} lg={6} key={project.name}>
              <Card 
                style={{ 
                  textAlign: 'center',
                  border: `2px solid ${project.type === 'API' ? '#1890ff' : 
                                      project.type === 'Domain' ? '#52c41a' :
                                      project.type === 'Application' ? '#faad14' :
                                      project.type === 'Infrastructure' ? '#722ed1' :
                                      project.type === 'IoC' ? '#fa8c16' : '#eb2f96'}`
                }}
              >
                <Space direction="vertical" size="middle">
                  <div style={{ fontSize: '32px' }}>
                    {layerIcons[project.type]}
                  </div>
                  <Title level={4} style={{ margin: 0 }}>
                    {project.name}
                  </Title>
                  <Tag color="blue">{project.type}</Tag>
                  <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center' }}>
                    {layerDescriptions[project.type]}
                  </Text>
                  <Badge count={project.dependencies.length} showZero>
                    <Text strong>Dependências</Text>
                  </Badge>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Dependências por Projeto */}
      <Row gutter={[24, 24]}>
        {analysis.projects.map((project) => (
          <Col xs={24} lg={12} key={project.name}>
            <Card 
              title={
                <Space>
                  {layerIcons[project.type]}
                  {project.name} - Dependências
                  <Badge count={project.dependencies.length} />
                </Space>
              }
              size="small"
            >
              <List
                size="small"
                dataSource={project.dependencies}
                renderItem={(dependency) => (
                  <List.Item>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <div>
                        <Text strong>{dependency.name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          v{dependency.version}
                        </Text>
                      </div>
                      {dependency.isOutdated ? (
                        <Tag color="warning">Desatualizado</Tag>
                      ) : (
                        <Tag color="success">Atualizado</Tag>
                      )}
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Resumo da Arquitetura */}
      <Card title={<><SettingOutlined /> Resumo da Arquitetura</>}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Padrão Arquitetural:</Text>
              <Tag color="blue">Clean Architecture</Tag>
              <Text type="secondary">
                Separação clara de responsabilidades com inversão de dependências
              </Text>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Framework Principal:</Text>
              <Tag color="green">{analysis.solution.framework}</Tag>
              <Text type="secondary">
                Framework .NET moderno com suporte a APIs RESTful
              </Text>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Total de Projetos:</Text>
              <Tag color="purple">{analysis.projects.length}</Tag>
              <Text type="secondary">
                Estrutura modular bem organizada
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>
    </Space>
  );
};

export default ArchitectureDashboard;
