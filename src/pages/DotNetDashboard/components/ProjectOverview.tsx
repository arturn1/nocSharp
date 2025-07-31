import React from 'react';
import { Card, Row, Col, Space, Typography, Tag, Progress, List, Alert } from 'antd';
import { 
  ProjectOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  CodeOutlined,
  TeamOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import type { DotNetProjectAnalysis } from '../../../services/DotNetProjectAnalyzer';

const { Title, Text, Paragraph } = Typography;

interface ProjectOverviewProps {
  analysis: DotNetProjectAnalysis;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ analysis }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'in-progress': return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'planned': return <ExclamationCircleOutlined style={{ color: '#1890ff' }} />;
      default: return <ClockCircleOutlined />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'success';
      case 'in-progress': return 'warning';
      case 'planned': return 'processing';
      default: return 'default';
    }
  };

  const featuresByModule = analysis.features.reduce((acc, feature) => {
    if (!acc[feature.module]) acc[feature.module] = [];
    acc[feature.module].push(feature);
    return acc;
  }, {} as Record<string, typeof analysis.features>);

  const completedFeatures = analysis.features.filter(f => f.status === 'complete').length;
  const totalFeatures = analysis.features.length;
  const progressPercent = totalFeatures > 0 ? Math.round((completedFeatures / totalFeatures) * 100) : 0;

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {/* Resumo do Projeto */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title={<><ProjectOutlined /> Informações do Projeto</>}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text strong>Nome: </Text>
                <Text>{analysis.solution.name}</Text>
              </div>
              <div>
                <Text strong>Framework: </Text>
                <Tag color="blue">{analysis.solution.framework}</Tag>
              </div>
              <div>
                <Text strong>Configuração: </Text>
                <Tag color="green">{analysis.solution.configuration}</Tag>
              </div>
              <div>
                <Text strong>Caminho: </Text>
                <Text code style={{ fontSize: '12px' }}>{analysis.solution.path}</Text>
              </div>
              <div>
                <Text strong>Última Modificação: </Text>
                <Text>
                  <CalendarOutlined /> {analysis.metrics.lastModified.toLocaleDateString('pt-BR')}
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={<><CodeOutlined /> Progresso do Desenvolvimento</>}>
            <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }} size="middle">
              <Progress
                type="circle"
                percent={progressPercent}
                size={120}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                format={() => `${completedFeatures}/${totalFeatures}`}
              />
              <div>
                <Text strong style={{ fontSize: '16px' }}>Features Implementadas</Text>
                <br />
                <Text type="secondary">{progressPercent}% Completo</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Estrutura da Arquitetura */}
      <Card title={<><TeamOutlined /> Estrutura da Arquitetura</>}>
        <Row gutter={[16, 16]}>
          {analysis.projects.map((project) => (
            <Col xs={24} sm={12} md={8} lg={6} key={project.name}>
              <Card 
                size="small" 
                title={project.name}
                extra={<Tag color="blue">{project.type}</Tag>}
                style={{ height: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <Text strong>Framework:</Text>
                  <Text code>{project.framework}</Text>
                  
                  <Text strong>Dependências:</Text>
                  <Text>{project.dependencies.length} pacotes</Text>
                  
                  {project.dependencies.some(dep => dep.isOutdated) && (
                    <Alert
                      message="Pacotes desatualizados"
                      type="warning"
                      showIcon
                    />
                  )}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Features por Módulo */}
      <Card title={<><CheckCircleOutlined /> Features por Módulo</>}>
        <Row gutter={[24, 24]}>
          {Object.entries(featuresByModule).map(([module, features]) => (
            <Col xs={24} md={12} lg={8} key={module}>
              <Card 
                size="small" 
                title={module}
                extra={
                  <Tag color="purple">
                    {features.filter(f => f.status === 'complete').length}/{features.length}
                  </Tag>
                }
              >
                <List
                  size="small"
                  dataSource={features}
                  renderItem={(feature) => (
                    <List.Item>
                      <Space>
                        {getStatusIcon(feature.status)}
                        <div style={{ flex: 1 }}>
                          <div>
                            <Text strong>{feature.name}</Text>
                            <Tag 
                              color={getStatusColor(feature.status)}
                              style={{ marginLeft: '8px' }}
                            >
                              {feature.status}
                            </Tag>
                          </div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {feature.description}
                          </Text>
                        </div>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Alertas e Avisos */}
      {(analysis.database.migrations.some(m => !m.isApplied) || 
        analysis.projects.some(p => p.dependencies.some(d => d.isOutdated))) && (
        <Card title="⚠️ Atenção Requerida">
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {analysis.database.migrations.some(m => !m.isApplied) && (
              <Alert
                message="Migrations Pendentes"
                description={`Existem ${analysis.database.migrations.filter(m => !m.isApplied).length} migrations que não foram aplicadas ao banco de dados.`}
                type="warning"
                showIcon
              />
            )}
            
            {analysis.projects.some(p => p.dependencies.some(d => d.isOutdated)) && (
              <Alert
                message="Pacotes Desatualizados"
                description="Alguns pacotes NuGet estão desatualizados. Considere atualizar para as versões mais recentes."
                type="info"
                showIcon
              />
            )}
          </Space>
        </Card>
      )}
    </Space>
  );
};

export default ProjectOverview;
