import React from 'react';
import { Card, Row, Col, Statistic, Progress, Space, Typography } from 'antd';
import { CodeOutlined, FileTextOutlined, BugOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { DotNetProjectAnalysis } from '../../../services/DotNetProjectAnalyzer';

const { Text } = Typography;

interface MetricsPanelProps {
  analysis: DotNetProjectAnalysis;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ analysis }) => {
  const getComplexityColor = (complexity: number) => {
    if (complexity <= 2) return '#52c41a';
    if (complexity <= 4) return '#faad14';
    return '#ff4d4f';
  };

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 80) return '#52c41a';
    if (coverage >= 60) return '#faad14';
    return '#ff4d4f';
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Row gutter={[24, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Linhas de Código"
              value={analysis.metrics.linesOfCode}
              prefix={<CodeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total de Arquivos"
              value={analysis.metrics.totalFiles}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Complexidade"
              value={analysis.metrics.codeComplexity}
              precision={1}
              prefix={<BugOutlined />}
              valueStyle={{ color: getComplexityColor(analysis.metrics.codeComplexity) }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Cobertura de Testes"
              value={analysis.metrics.testCoverage}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: getCoverageColor(analysis.metrics.testCoverage) }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title="📊 Qualidade do Código">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>Complexidade Ciclomática</Text>
                <Progress 
                  percent={(analysis.metrics.codeComplexity / 10) * 100} 
                  strokeColor={getComplexityColor(analysis.metrics.codeComplexity)}
                  format={() => `${analysis.metrics.codeComplexity}/10`}
                />
              </div>
              <div>
                <Text>Cobertura de Testes</Text>
                <Progress 
                  percent={analysis.metrics.testCoverage} 
                  strokeColor={getCoverageColor(analysis.metrics.testCoverage)}
                />
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="📈 Estatísticas do Projeto">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Última Modificação:</Text>
                <br />
                <Text>{analysis.metrics.lastModified.toLocaleDateString('pt-BR')}</Text>
              </div>
              <div>
                <Text strong>Média de Linhas por Arquivo:</Text>
                <br />
                <Text>{Math.round(analysis.metrics.linesOfCode / analysis.metrics.totalFiles)}</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default MetricsPanel;
