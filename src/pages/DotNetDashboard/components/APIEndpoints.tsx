import React from 'react';
import { Card, Row, Col, Space, Typography, Tag, List, Badge, Table } from 'antd';
import { 
  ApiOutlined, 
  LockOutlined, 
  UnlockOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
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

  const endpointsData = analysis.controllers.flatMap(controller =>
    controller.endpoints.map(endpoint => ({
      key: `${controller.name}-${endpoint.actionName}`,
      controller: controller.name,
      method: endpoint.method,
      route: endpoint.route,
      action: endpoint.actionName,
      hasAuth: endpoint.hasAuth,
      parameters: endpoint.parameters.join(', '),
      returnType: endpoint.returnType
    }))
  );

  const columns = [
    {
      title: 'Método',
      dataIndex: 'method',
      key: 'method',
      render: (method: string) => (
        <Tag color={getMethodColor(method)}>{method}</Tag>
      ),
      width: 80,
    },
    {
      title: 'Rota',
      dataIndex: 'route',
      key: 'route',
      render: (route: string) => <Text code>{route}</Text>,
    },
    {
      title: 'Controller',
      dataIndex: 'controller',
      key: 'controller',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Auth',
      dataIndex: 'hasAuth',
      key: 'hasAuth',
      render: (hasAuth: boolean) => (
        hasAuth ? 
          <LockOutlined style={{ color: '#52c41a' }} title="Autenticado" /> :
          <UnlockOutlined style={{ color: '#faad14' }} title="Público" />
      ),
      width: 60,
    },
    {
      title: 'Retorno',
      dataIndex: 'returnType',
      key: 'returnType',
      render: (type: string) => <Text type="secondary">{type}</Text>,
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {/* Estatísticas dos Endpoints */}
      <Row gutter={[24, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Space direction="vertical" style={{ textAlign: 'center', width: '100%' }}>
              <ApiOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
              <Title level={3} style={{ margin: 0 }}>{totalEndpoints}</Title>
              <Text>Total de Endpoints</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Space direction="vertical" style={{ textAlign: 'center', width: '100%' }}>
              <LockOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
              <Title level={3} style={{ margin: 0 }}>{securedEndpoints}</Title>
              <Text>Endpoints Seguros</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Space direction="vertical" style={{ textAlign: 'center', width: '100%' }}>
              <CheckCircleOutlined style={{ fontSize: '32px', color: '#722ed1' }} />
              <Title level={3} style={{ margin: 0 }}>{analysis.controllers.length}</Title>
              <Text>Controllers</Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Controllers e seus Endpoints */}
      <Row gutter={[24, 24]}>
        {analysis.controllers.map((controller) => (
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
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space>
                        <Tag color={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Tag>
                        <Text code>{endpoint.route}</Text>
                        {endpoint.hasAuth ? (
                          <LockOutlined style={{ color: '#52c41a' }} />
                        ) : (
                          <UnlockOutlined style={{ color: '#faad14' }} />
                        )}
                      </Space>
                      
                      <Space wrap>
                        <Text strong>Action:</Text>
                        <Text>{endpoint.actionName}</Text>
                        <Text strong>Retorna:</Text>
                        <Text type="secondary">{endpoint.returnType}</Text>
                      </Space>

                      {endpoint.parameters.length > 0 && (
                        <div>
                          <Text strong>Parâmetros:</Text>
                          <Text type="secondary"> {endpoint.parameters.join(', ')}</Text>
                        </div>
                      )}
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Tabela Completa de Endpoints */}
      <Card title={<><ApiOutlined /> Todos os Endpoints</>}>
        <Table
          dataSource={endpointsData}
          columns={columns}
          size="small"
          scroll={{ x: 800 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      {/* Alertas de Segurança */}
      {totalEndpoints > securedEndpoints && (
        <Card title="🔒 Análise de Segurança">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: '8px' }} />
              <Text strong>
                {totalEndpoints - securedEndpoints} endpoints não requerem autenticação
              </Text>
            </div>
            <Text type="secondary">
              Certifique-se de que endpoints públicos são intencionais e não expõem dados sensíveis.
            </Text>
          </Space>
        </Card>
      )}
    </Space>
  );
};

export default APIEndpoints;
