import React from 'react';
import { Card, Row, Col, Space, Typography, Tag, List, Badge, Alert, Timeline } from 'antd';
import { 
  DatabaseOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
  TableOutlined
} from '@ant-design/icons';
import type { DotNetProjectAnalysis } from '../../../services/DotNetProjectAnalyzer';

const { Title, Text } = Typography;

interface DatabaseSchemaProps {
  analysis: DotNetProjectAnalysis;
}

const DatabaseSchema: React.FC<DatabaseSchemaProps> = ({ analysis }) => {
  const appliedMigrations = analysis.database.migrations.filter(m => m.isApplied);
  const pendingMigrations = analysis.database.migrations.filter(m => !m.isApplied);

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {/* Informações do Banco */}
      <Row gutter={[24, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Space direction="vertical" style={{ textAlign: 'center', width: '100%' }}>
              <DatabaseOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
              <Title level={3} style={{ margin: 0 }}>{analysis.database.provider}</Title>
              <Text>Provider do Banco</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Space direction="vertical" style={{ textAlign: 'center', width: '100%' }}>
              <TableOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
              <Title level={3} style={{ margin: 0 }}>{analysis.database.entities.length}</Title>
              <Text>Entidades</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Space direction="vertical" style={{ textAlign: 'center', width: '100%' }}>
              <CheckCircleOutlined style={{ fontSize: '32px', color: '#722ed1' }} />
              <Title level={3} style={{ margin: 0 }}>{appliedMigrations.length}</Title>
              <Text>Migrations Aplicadas</Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Connection Strings */}
      <Card title={<><LinkOutlined /> Connection Strings</>}>
        <List
          dataSource={analysis.database.connectionStrings}
          renderItem={(connectionString) => (
            <List.Item>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <Text strong>{connectionString.name}</Text>
                  <Tag color="blue">{connectionString.environment}</Tag>
                </Space>
                <Text code style={{ fontSize: '12px' }}>
                  {connectionString.value.replace(/Password=[^;]*/gi, 'Password=***')}
                </Text>
              </Space>
            </List.Item>
          )}
        />
      </Card>

      {/* Entidades do Banco */}
      <Card title={<><TableOutlined /> Entidades do Modelo</>}>
        <Row gutter={[16, 16]}>
          {analysis.database.entities.slice(0, 12).map((entity, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <Card size="small" title={entity.name}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Badge count={entity.properties?.length || 0}>
                    <Text>Propriedades</Text>
                  </Badge>
                  {entity.properties?.slice(0, 3).map((property, propIndex) => (
                    <div key={propIndex}>
                      <Text strong style={{ fontSize: '12px' }}>{property.name}</Text>
                      <Text type="secondary" style={{ fontSize: '11px', marginLeft: '8px' }}>
                        {property.type}
                      </Text>
                    </div>
                  ))}
                  {(entity.properties?.length || 0) > 3 && (
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      ... +{(entity.properties?.length || 0) - 3} mais
                    </Text>
                  )}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
        {analysis.database.entities.length > 12 && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Text type="secondary">
              ... e mais {analysis.database.entities.length - 12} entidades
            </Text>
          </div>
        )}
      </Card>

      {/* Timeline de Migrations */}
      <Card title={<><ClockCircleOutlined /> Histórico de Migrations</>}>
        <Timeline mode="left">
          {analysis.database.migrations.map((migration) => (
            <Timeline.Item
              key={migration.name}
              color={migration.isApplied ? 'green' : 'blue'}
              dot={migration.isApplied ? 
                <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
                <ClockCircleOutlined style={{ color: '#1890ff' }} />
              }
            >
              <Space direction="vertical">
                <Space>
                  <Text strong>{migration.name}</Text>
                  <Tag color={migration.isApplied ? 'success' : 'processing'}>
                    {migration.isApplied ? 'Aplicada' : 'Pendente'}
                  </Tag>
                </Space>
                <Text type="secondary">
                  {new Date(migration.timestamp).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </Space>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>

      {/* Alertas */}
      <Space direction="vertical" style={{ width: '100%' }}>
        {pendingMigrations.length > 0 && (
          <Alert
            type="warning"
            message="Migrations Pendentes"
            description={`Existem ${pendingMigrations.length} migrations que ainda não foram aplicadas ao banco de dados.`}
            showIcon
            action={
              <Text code>dotnet ef database update</Text>
            }
          />
        )}

        {analysis.database.hasSeedData && (
          <Alert
            type="info"
            message="Seed Data Configurado"
            description="O projeto possui dados iniciais configurados para popular o banco de dados."
            showIcon
          />
        )}

        {analysis.database.entities.length === 0 && (
          <Alert
            type="error"
            message="Nenhuma Entidade Encontrada"
            description="Não foram encontradas entidades no modelo de dados. Verifique a configuração do Entity Framework."
            showIcon
          />
        )}
      </Space>
    </Space>
  );
};

export default DatabaseSchema;
