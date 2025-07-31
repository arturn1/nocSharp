import React from 'react';
import { Space, Card, Row, Col, Statistic, Typography } from 'antd';
import { DatabaseOutlined, ScanOutlined } from '@ant-design/icons';
import { EntityChangeDetector } from '../../services/EntityChangeDetector';
import { Entity } from '../../models/Entity';

const { Text } = Typography;

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
  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Card title="🚀 nocSharp Project Generator" size="small">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Statistic
              title="Nome do Projeto"
              value={projectName || 'Nenhum projeto carregado'}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Total de Entidades"
              value={EntityChangeDetector.filterNonBaseEntities(entities).length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Total de Propriedades"
              value={EntityChangeDetector.calculateEntityStats(entities).totalProperties}
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card size="small" hoverable onClick={() => onMenuChange('import')} style={{ cursor: 'pointer' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <DatabaseOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
                <Typography.Title level={5} style={{ margin: 0 }}>Importar do DBDiagram</Typography.Title>
              </Space>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Cole código do dbdiagram.io ou carregue arquivo .dbml
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card size="small" hoverable onClick={() => onMenuChange('scanner')} style={{ cursor: 'pointer' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <ScanOutlined style={{ fontSize: '18px', color: '#52c41a' }} />
                <Typography.Title level={5} style={{ margin: 0 }}>Carregar Projeto Existente</Typography.Title>
              </Space>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Selecione projeto nocSharp para carregar entidades
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default HomePage;
