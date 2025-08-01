import React from 'react';
import { Card, Row, Col, Space, Typography, Tag, List, Badge, Collapse } from 'antd';
import { 
  ApiOutlined, 
  LockOutlined, 
  UnlockOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import type { DotNetProjectAnalysis } from '../../../services/DotNetProjectAnalyzer';

const { Title, Text } = Typography;

interface APIEndpointsProps {
  analysis: DotNetProjectAnalysis;
}

const APIEndpoints: React.FC<APIEndpointsProps> = ({ analysis }) => {
  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'blue';
      case 'POST': return 'green';
      case 'PUT': return 'orange';
      case 'DELETE': return 'red';
      case 'PATCH': return 'purple';
      default: return 'default';
    }
  };

  const totalEndpoints = analysis.controllers.reduce((total, controller) => 
    total + controller.endpoints.length, 0
  );

  const securedEndpoints = analysis.controllers.reduce((total, controller) => 
    total + controller.endpoints.filter(ep => ep.hasAuth).length, 0
  );

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {/* Estatísticas dos Endpoints */}

      {/* Controllers e seus Endpoints */}
      <Card
        type="inner"
        title={<Title level={5} style={{ margin: 0 }}>Endpoints da API</Title>}
        style={{ marginBottom: 16 }}
      >
        <Collapse>
          <Collapse.Panel header={`Exibir todos os endpoints (${totalEndpoints})`} key="1">
        <Row gutter={[24, 24]}>
          {analysis.controllers
            .filter(controller => controller.name !== 'BaseController')
            .map((controller) => (
          <Col xs={24} lg={12} key={controller.name}>
            <Card 
              title={
            <Space>
              <ApiOutlined />
              {controller.name}
              <Badge count={controller.endpoints.length} />
              {controller.hasAuthentication && (
                <LockOutlined style={{ color: '#52c41a' }} title="Tem autenticação" />
              )}
            </Space>
              }
              size="small"
            >
              <List
            size="small"
            dataSource={controller.endpoints}
            renderItem={(endpoint) => (
              <List.Item>
                <Space>
              <Tag color={getMethodColor(endpoint.method)}>
                {endpoint.method}
              </Tag>
              <Text code>{endpoint.route}</Text>
              {endpoint.hasAuth ? (
                <LockOutlined style={{ color: '#52c41a' }} title="Autenticado" />
              ) : (
                <UnlockOutlined style={{ color: '#faad14' }} title="Público" />
              )}
              <Text type="secondary">{endpoint.actionName}</Text>
                </Space>
              </List.Item>
            )}
              />
            </Card>
          </Col>
            ))}
        </Row>
          </Collapse.Panel>
        </Collapse>
      </Card>
    </Space>
  );
};

export default APIEndpoints;
