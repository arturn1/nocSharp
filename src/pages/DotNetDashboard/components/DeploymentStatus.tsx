import React from 'react';
import { Card, Row, Col, Space, Typography, Tag, Alert } from 'antd';
import { 
  DeploymentUnitOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  CloudOutlined,
  ContainerOutlined
} from '@ant-design/icons';
import type { DotNetProjectAnalysis } from '../../../services/DotNetProjectAnalyzer';

const { Title, Text } = Typography;

interface DeploymentStatusProps {
  analysis: DotNetProjectAnalysis;
}

const DeploymentStatus: React.FC<DeploymentStatusProps> = ({ analysis }) => {
  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Row gutter={[24, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Space direction="vertical" style={{ textAlign: 'center', width: '100%' }}>
              {analysis.deployment.hasDockerfile ? (
                <CheckCircleOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
              ) : (
                <CloseCircleOutlined style={{ fontSize: '32px', color: '#ff4d4f' }} />
              )}
              <Text strong>Dockerfile</Text>
              <Tag color={analysis.deployment.hasDockerfile ? 'success' : 'error'}>
                {analysis.deployment.hasDockerfile ? 'Configurado' : 'Não Configurado'}
              </Tag>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Space direction="vertical" style={{ textAlign: 'center', width: '100%' }}>
              {analysis.deployment.hasDockerCompose ? (
                <CheckCircleOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
              ) : (
                <CloseCircleOutlined style={{ fontSize: '32px', color: '#ff4d4f' }} />
              )}
              <Text strong>Docker Compose</Text>
              <Tag color={analysis.deployment.hasDockerCompose ? 'success' : 'error'}>
                {analysis.deployment.hasDockerCompose ? 'Configurado' : 'Não Configurado'}
              </Tag>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Space direction="vertical" style={{ textAlign: 'center', width: '100%' }}>
              {analysis.deployment.hasCI ? (
                <CheckCircleOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
              ) : (
                <CloseCircleOutlined style={{ fontSize: '32px', color: '#ff4d4f' }} />
              )}
              <Text strong>CI/CD</Text>
              <Tag color={analysis.deployment.hasCI ? 'success' : 'error'}>
                {analysis.deployment.hasCI ? 'Configurado' : 'Não Configurado'}
              </Tag>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Space direction="vertical" style={{ textAlign: 'center', width: '100%' }}>
              <CloudOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
              <Text strong>Ambientes</Text>
              <Tag color="blue">{analysis.deployment.environments.length}</Tag>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title={<><DeploymentUnitOutlined /> Status de Deployment</>}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {analysis.deployment.hasDockerfile && (
            <Alert
              type="success"
              message="Docker Configurado"
              description="O projeto possui Dockerfile configurado para containerização."
              showIcon
            />
          )}
          
          {analysis.deployment.hasDockerCompose && (
            <Alert
              type="success"
              message="Docker Compose Disponível"
              description="O projeto pode ser executado com docker-compose para desenvolvimento."
              showIcon
            />
          )}

          {!analysis.deployment.hasCI && (
            <Alert
              type="warning"
              message="CI/CD Não Configurado"
              description="Considere configurar pipelines de CI/CD para automatizar builds e deploys."
              showIcon
            />
          )}

          {analysis.deployment.environments.length > 0 && (
            <div>
              <Text strong>Ambientes Configurados:</Text>
              <Space wrap style={{ marginTop: '8px' }}>
                {analysis.deployment.environments.map(env => (
                  <Tag key={env} color="blue">{env}</Tag>
                ))}
              </Space>
            </div>
          )}
        </Space>
      </Card>
    </Space>
  );
};

export default DeploymentStatus;
