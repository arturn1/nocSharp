import React from 'react';
import { Card, Row, Col, Space, Typography, Tag, List, Alert } from 'antd';
import { SettingOutlined, EyeInvisibleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import type { DotNetProjectAnalysis } from '../../../services/DotNetProjectAnalyzer';

const { Title, Text } = Typography;

interface ConfigurationManagerProps {
  analysis: DotNetProjectAnalysis;
}

const ConfigurationManager: React.FC<ConfigurationManagerProps> = ({ analysis }) => {
  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title={<><EnvironmentOutlined /> Ambientes</>}>
            <Space wrap>
              {analysis.appSettings.environments.map(env => (
                <Tag key={env} color={env === 'Production' ? 'red' : env === 'Staging' ? 'orange' : 'green'}>
                  {env}
                </Tag>
              ))}
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title={<><EyeInvisibleOutlined /> Secrets</>}>
            <List
              size="small"
              dataSource={analysis.appSettings.secrets}
              renderItem={(secret) => (
                <List.Item>
                  <Text code>{secret}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card title={<><SettingOutlined /> Configurações</>}>
        <List
          dataSource={Object.entries(analysis.appSettings.configurations)}
          renderItem={([key, value]) => (
            <List.Item>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Text strong>{key}</Text>
                <Text code>{String(value)}</Text>
              </Space>
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );
};

export default ConfigurationManager;
