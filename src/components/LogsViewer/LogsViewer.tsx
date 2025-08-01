import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Empty,
  Tabs,
  Input,
  Tooltip,
  Badge,
  Switch,
  Row,
  Col,
  Divider
} from 'antd';
import {
  DeleteOutlined,
  CopyOutlined,
  DownloadOutlined,
  ReloadOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useAppContext } from '../../contexts/AppContext';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

interface LogsViewerProps {
  height?: string | number;
  showHeader?: boolean;
  maxItems?: number;
  compact?: boolean;
}

const LogsViewer: React.FC<LogsViewerProps> = ({
  height = '400px',
  showHeader = true,
  maxItems = 1000,
  compact = false
}) => {
  const { state, dispatch } = useAppContext();
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll para o final quando novos logs chegam
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [state.logs, state.errors, autoScroll]);

  // Combinar logs e erros com tipo
  const allLogs = [
    ...state.logs.map(log => ({ type: 'log', message: log, timestamp: extractTimestamp(log) })),
    ...state.errors.map(error => ({ type: 'error', message: error, timestamp: extractTimestamp(error) }))
  ].sort((a, b) => {
    // Ordenar por timestamp se disponível
    if (a.timestamp && b.timestamp) {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    }
    return 0;
  });

  // Extrair timestamp da mensagem
  function extractTimestamp(message: string): string | null {
    const timestampMatch = message.match(/^\[([^\]]+)\]/);
    return timestampMatch ? timestampMatch[1] : null;
  }

  // Remover timestamp da mensagem para exibição
  function cleanMessage(message: string): string {
    return showTimestamps ? message : message.replace(/^\[[^\]]+\]\s*/, '');
  }

  // Filtrar logs baseado no termo de busca e aba ativa
  const filteredLogs = allLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'logs' && log.type === 'log') ||
      (activeTab === 'errors' && log.type === 'error');
    
    return matchesSearch && matchesTab;
  }).slice(-maxItems);

  // Ícone baseado no tipo de log
  const getLogIcon = (type: string, message: string) => {
    if (type === 'error') {
      return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
    }
    
    // Detectar tipo baseado na mensagem
    if (message.includes('✅') || message.toLowerCase().includes('sucesso')) {
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    }
    if (message.includes('⚠️') || message.toLowerCase().includes('aviso')) {
      return <WarningOutlined style={{ color: '#faad14' }} />;
    }
    
    return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
  };

  // Cor do tag baseado no tipo
  const getTagColor = (type: string, message: string) => {
    if (type === 'error') return 'error';
    if (message.includes('✅') || message.toLowerCase().includes('sucesso')) return 'success';
    if (message.includes('⚠️') || message.toLowerCase().includes('aviso')) return 'warning';
    return 'processing';
  };

  // Limpar logs
  const handleClearLogs = () => {
    dispatch({ type: 'CLEAR_LOGS' });
  };

  // Limpar erros
  const handleClearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  // Limpar tudo
  const handleClearAll = () => {
    dispatch({ type: 'CLEAR_LOGS' });
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  // Copiar logs para clipboard
  const handleCopyLogs = async () => {
    const logText = filteredLogs.map(log => log.message).join('\n');
    try {
      await navigator.clipboard.writeText(logText);
      dispatch({ type: 'ADD_LOG', payload: 'Logs copiados para a área de transferência' });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: 'Erro ao copiar logs para a área de transferência' });
    }
  };

  // Exportar logs
  const handleExportLogs = () => {
    const logText = filteredLogs.map(log => log.message).join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nocsharp-logs-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    dispatch({ type: 'ADD_LOG', payload: 'Logs exportados com sucesso' });
  };

  // Contadores
  const totalLogs = state.logs.length;
  const totalErrors = state.errors.length;
  const filteredCount = filteredLogs.length;

  return (
    <Card
      size={compact ? 'small' : 'default'}
      style={{
        height: '100%',
        backgroundColor: isDarkMode ? '#141414' : '#ffffff',
        border: isDarkMode ? '1px solid #303030' : '1px solid #d9d9d9'
      }}
      bodyStyle={{ padding: compact ? '12px' : '16px', height: '100%' }}
    >
      {showHeader && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={4} style={{ margin: 0, color: isDarkMode ? '#ffffff' : '#000000' }}>
              <InfoCircleOutlined style={{ marginRight: '8px' }} />
              Sistema de Logs
            </Title>
            
            <Space>
              <Badge count={totalErrors} style={{ backgroundColor: '#ff4d4f' }}>
                <Badge count={totalLogs} style={{ backgroundColor: '#1890ff' }}>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => window.location.reload()}
                    size="small"
                    type="text"
                  />
                </Badge>
              </Badge>
            </Space>
          </div>

          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col flex="auto">
              <Search
                placeholder="Buscar nos logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
                size={compact ? 'small' : 'middle'}
              />
            </Col>
            <Col>
              <Space size="small">
                <Tooltip title="Auto-scroll">
                  <Switch
                    checked={autoScroll}
                    onChange={setAutoScroll}
                    size="small"
                    checkedChildren="Auto"
                    unCheckedChildren="Manual"
                  />
                </Tooltip>
                <Tooltip title="Mostrar timestamps">
                  <Switch
                    checked={showTimestamps}
                    onChange={setShowTimestamps}
                    size="small"
                    checkedChildren="🕐"
                    unCheckedChildren="📝"
                  />
                </Tooltip>
              </Space>
            </Col>
          </Row>

          <Space style={{ marginBottom: '16px' }}>
            <Button
              icon={<CopyOutlined />}
              onClick={handleCopyLogs}
              size={compact ? 'small' : 'middle'}
              disabled={filteredCount === 0}
            >
              Copiar
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportLogs}
              size={compact ? 'small' : 'middle'}
              disabled={filteredCount === 0}
            >
              Exportar
            </Button>
            <Button
              icon={<DeleteOutlined />}
              onClick={handleClearAll}
              danger
              size={compact ? 'small' : 'middle'}
              disabled={totalLogs === 0 && totalErrors === 0}
            >
              Limpar Tudo
            </Button>
          </Space>

          <Divider style={{ margin: '8px 0' }} />
        </>
      )}

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="small"
        style={{ height: showHeader ? 'calc(100% - 140px)' : '100%' }}
      >
        <TabPane 
          tab={
            <Badge count={totalLogs + totalErrors} size="small" offset={[10, -2]}>
              <span><FilterOutlined /> Todos ({totalLogs + totalErrors})</span>
            </Badge>
          } 
          key="all"
        >
          <div
            ref={logContainerRef}
            style={{
              height: height,
              overflowY: 'auto',
              backgroundColor: isDarkMode ? '#1f1f1f' : '#fafafa',
              border: `1px solid ${isDarkMode ? '#303030' : '#d9d9d9'}`,
              borderRadius: '6px',
              padding: '8px'
            }}
          >
            {filteredLogs.length === 0 ? (
              <Empty
                description={searchTerm ? 'Nenhum log encontrado para a busca' : 'Nenhum log disponível'}
                style={{ marginTop: '60px' }}
              />
            ) : (
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                {filteredLogs.map((log, index) => (
                  <div
                    key={`${log.type}-${index}`}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: isDarkMode ? '#262626' : '#ffffff',
                      border: `1px solid ${isDarkMode ? '#404040' : '#e8e8e8'}`,
                      borderRadius: '4px',
                      fontSize: compact ? '12px' : '13px',
                      fontFamily: 'Monaco, Consolas, "Courier New", monospace'
                    }}
                  >
                    <Space align="start" size="small">
                      {getLogIcon(log.type, log.message)}
                      <Tag color={getTagColor(log.type, log.message)}>
                        {log.type === 'error' ? 'ERRO' : 'LOG'}
                      </Tag>
                      <Text
                        style={{
                          color: log.type === 'error' 
                            ? '#ff4d4f' 
                            : isDarkMode ? '#ffffff' : '#000000',
                          wordBreak: 'break-word',
                          flex: 1
                        }}
                      >
                        {cleanMessage(log.message)}
                      </Text>
                    </Space>
                  </div>
                ))}
              </Space>
            )}
          </div>
        </TabPane>

        <TabPane 
          tab={
            <Badge count={totalLogs} size="small" offset={[10, -2]}>
              <span><InfoCircleOutlined /> Logs ({totalLogs})</span>
            </Badge>
          } 
          key="logs"
        />

        <TabPane 
          tab={
            <Badge count={totalErrors} size="small" offset={[10, -2]}>
              <span><ExclamationCircleOutlined /> Erros ({totalErrors})</span>
            </Badge>
          } 
          key="errors"
        />
      </Tabs>

      {showHeader && (
        <div style={{ marginTop: '8px', textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Exibindo {filteredCount} de {totalLogs + totalErrors} entradas
            {searchTerm && ` • Filtro: "${searchTerm}"`}
          </Text>
        </div>
      )}
    </Card>
  );
};

export default LogsViewer;
