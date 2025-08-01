import React from 'react';
import { Typography, Card, Space, Row, Col, Statistic } from 'antd';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppContext } from '../../contexts/AppContext';
import { InfoCircleOutlined, ExclamationCircleOutlined, CheckCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import LogsViewer from '../../components/LogsViewer';

const { Title, Text } = Typography;

const LogsPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { state } = useAppContext();

  const totalLogs = state.logs.length;
  const totalErrors = state.errors.length;
  const totalEntries = totalLogs + totalErrors;

  return (
    <div style={{ 
      padding: '24px', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: isDarkMode ? '#0f172a' : '#f8fafc'
    }}>
      <Space direction="vertical" style={{ width: '100%', height: '100%' }} size="large">
        {/* Header Stats */}
        <Card
          style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
              : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            border: isDarkMode ? '1px solid #374151' : '1px solid #cbd5e1',
            borderRadius: '16px',
            boxShadow: isDarkMode 
              ? '0 10px 25px rgba(0, 0, 0, 0.3)'
              : '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4A90E2 0%, #52648B 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(74, 144, 226, 0.3)'
              }}>
                <FileTextOutlined style={{ fontSize: '24px', color: 'white' }} />
              </div>
              <div>
                <Title level={3} style={{ 
                  margin: 0, 
                  color: isDarkMode ? '#f1f5f9' : '#1e293b',
                  fontWeight: '700'
                }}>
                  Sistema de Logs
                </Title>
                <Text style={{ 
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  fontSize: '14px'
                }}>
                  Monitoramento em tempo real das operações do sistema
                </Text>
              </div>
            </div>

            <Row gutter={24} style={{ marginTop: '16px' }}>
              <Col span={8}>
                <Statistic
                  title={
                    <span style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                      <InfoCircleOutlined style={{ marginRight: '8px' }} />
                      Total de Logs
                    </span>
                  }
                  value={totalLogs}
                  valueStyle={{ 
                    color: '#1890ff',
                    fontWeight: '600'
                  }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={
                    <span style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                      <ExclamationCircleOutlined style={{ marginRight: '8px' }} />
                      Total de Erros
                    </span>
                  }
                  value={totalErrors}
                  valueStyle={{ 
                    color: '#ff4d4f',
                    fontWeight: '600'
                  }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={
                    <span style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                      <CheckCircleOutlined style={{ marginRight: '8px' }} />
                      Total de Entradas
                    </span>
                  }
                  value={totalEntries}
                  valueStyle={{ 
                    color: isDarkMode ? '#f1f5f9' : '#1e293b',
                    fontWeight: '600'
                  }}
                />
              </Col>
            </Row>
          </Space>
        </Card>

        {/* Logs Viewer */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <LogsViewer 
            height="calc(100vh - 280px)"
            showHeader={false}
            maxItems={2000}
          />
        </div>
      </Space>
    </div>
  );
};

export default LogsPage;
