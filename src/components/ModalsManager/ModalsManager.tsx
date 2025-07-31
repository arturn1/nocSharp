import React from 'react';
import { Modal, Button, Space, Card, Row, Col, Typography, Alert, Spin, Collapse, Tag, Progress, Statistic } from 'antd';
import { CheckCircleOutlined, EditOutlined, PlusOutlined, SyncOutlined, FileTextOutlined, DatabaseOutlined } from '@ant-design/icons';
import { Entity } from '../../models/Entity';
import { EntityComparisonModalData, ScannerModalData } from '../../services/UIStateManager';
import { useTheme } from '../../contexts/ThemeContext';

const { Text } = Typography;

interface ModalsManagerProps {
  // Entity comparison modal
  showEntitiesModal: boolean;
  entitiesComparison: EntityComparisonModalData;
  onCloseEntitiesModal: () => void;
  
  // Scanner modal
  showScannerModal: boolean;
  scannerModalData: ScannerModalData;
  isExecutingCommands: boolean;
  onExecuteScannerCommands: () => Promise<void>;
  onCloseScannerModal: () => void;
}

const ModalsManager: React.FC<ModalsManagerProps> = ({
  showEntitiesModal,
  entitiesComparison,
  onCloseEntitiesModal,
  showScannerModal,
  scannerModalData,
  isExecutingCommands,
  onExecuteScannerCommands,
  onCloseScannerModal
}) => {
  const { isDarkMode } = useTheme();
  return (
    <>
      {/* Modal para comparação de entidades */}
      <Modal
        title="📊 Comparação de Entidades"
        open={showEntitiesModal}
        onOk={onCloseEntitiesModal}
        onCancel={onCloseEntitiesModal}
        width={1000}
        footer={[
          <Button key="close" onClick={onCloseEntitiesModal}>
            Fechar
          </Button>
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="🏗️ Entidades Existentes no Projeto" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Total: {entitiesComparison.existing.length} entidades</Text>
                  {entitiesComparison.existing.map((entity, index) => (
                    <Card key={index} size="small" style={{ marginBottom: '8px' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong style={{ color: '#1890ff' }}>{entity.name}</Text>
                        <Text type="secondary">
                          {entity.properties.length} propriedades
                        </Text>
                        <div style={{ fontSize: '12px' }}>
                          {entity.properties.slice(0, 3).map((prop, i) => (
                            <Text key={i} code style={{ marginRight: '8px' }}>
                              {prop.name}: {prop.type}
                            </Text>
                          ))}
                          {entity.properties.length > 3 && (
                            <Text type="secondary">... +{entity.properties.length - 3} more</Text>
                          )}
                        </div>
                      </Space>
                    </Card>
                  ))}
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="✨ Novas Entidades a Serem Adicionadas" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Total: {entitiesComparison.new.length} entidades</Text>
                  {entitiesComparison.new.map((entity, index) => (
                    <Card key={index} size="small" style={{ marginBottom: '8px' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong style={{ color: '#52c41a' }}>{entity.name}</Text>
                        <Text type="secondary">
                          {entity.properties.length} propriedades
                        </Text>
                        <div style={{ fontSize: '12px' }}>
                          {entity.properties.slice(0, 3).map((prop, i) => (
                            <Text key={i} code style={{ marginRight: '8px' }}>
                              {prop.name}: {prop.type}
                            </Text>
                          ))}
                          {entity.properties.length > 3 && (
                            <Text type="secondary">... +{entity.properties.length - 3} more</Text>
                          )}
                        </div>
                      </Space>
                    </Card>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>
        </Space>
      </Modal>

      {/* Modal do Entity Scanner - Refatorado */}
      <Modal
        title={
          <Space align="center">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
            }}>
              <DatabaseOutlined style={{ fontSize: '20px', color: 'white' }} />
            </div>
            <div>
              <Text strong style={{ 
                fontSize: '18px',
                color: isDarkMode ? '#ffffff' : '#1f1f1f'
              }}>
                Atualizar Projeto
              </Text>
              <div style={{ marginTop: '2px' }}>
                <Text type="secondary" style={{ 
                  fontSize: '13px',
                  color: isDarkMode ? '#a0a0a0' : '#666666'
                }}>
                  {scannerModalData.existingEntities.length + scannerModalData.newEntities.length} alterações detectadas
                </Text>
              </div>
            </div>
          </Space>
        }
        open={showScannerModal}
        onOk={onExecuteScannerCommands}
        onCancel={onCloseScannerModal}
        width={1000}
        okText={
          isExecutingCommands ? (
            <Space>
              <SyncOutlined spin />
              Executando
            </Space>
          ) : (
            <Space>
              <CheckCircleOutlined />
              Executar Atualização
            </Space>
          )
        }
        cancelText="Cancelar"
        confirmLoading={isExecutingCommands}
        okButtonProps={{ 
          disabled: isExecutingCommands || scannerModalData.commands.length === 0,
          style: {
            background: isExecutingCommands 
              ? (isDarkMode ? '#434343' : '#d9d9d9')
              : 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
            borderColor: 'transparent',
            fontWeight: '600'
          }
        }}
        cancelButtonProps={{
          style: {
            color: isDarkMode ? '#d9d9d9' : '#595959',
            borderColor: isDarkMode ? '#434343' : '#d9d9d9'
          }
        }}
        styles={{
          mask: { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.45)' },
          content: { 
            backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#000000'
          },
          header: { 
            backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
            borderBottom: `1px solid ${isDarkMode ? '#434343' : '#f0f0f0'}`
          },
          footer: { 
            backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
            borderTop: `1px solid ${isDarkMode ? '#434343' : '#f0f0f0'}`
          }
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Resumo das Alterações */}
          <Card 
            style={{
              background: isDarkMode 
                ? 'linear-gradient(135deg, #262626 0%, #1f1f1f 100%)'
                : 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
              border: isDarkMode ? '1px solid #434343' : '1px solid #b7eb8f',
              borderRadius: '12px'
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <Row gutter={[32, 16]} align="middle">
              <Col span={8}>
                <Statistic
                  title={
                    <Text style={{ 
                      color: isDarkMode ? '#a0a0a0' : '#666666',
                      fontSize: '13px'
                    }}>
                      Modificadas
                    </Text>
                  }
                  value={scannerModalData.existingEntities.length}
                  valueStyle={{ 
                    color: '#fa8c16',
                    fontSize: '28px',
                    fontWeight: 'bold'
                  }}
                  prefix={<EditOutlined style={{ fontSize: '20px' }} />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={
                    <Text style={{ 
                      color: isDarkMode ? '#a0a0a0' : '#666666',
                      fontSize: '13px'
                    }}>
                      Novas
                    </Text>
                  }
                  value={scannerModalData.newEntities.length}
                  valueStyle={{ 
                    color: '#52c41a',
                    fontSize: '28px',
                    fontWeight: 'bold'
                  }}
                  prefix={<PlusOutlined style={{ fontSize: '20px' }} />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={
                    <Text style={{ 
                      color: isDarkMode ? '#a0a0a0' : '#666666',
                      fontSize: '13px'
                    }}>
                      Comandos
                    </Text>
                  }
                  value={scannerModalData.commands.length}
                  valueStyle={{ 
                    color: '#1890ff',
                    fontSize: '28px',
                    fontWeight: 'bold'
                  }}
                  prefix={<FileTextOutlined style={{ fontSize: '20px' }} />}
                />
              </Col>
            </Row>
          </Card>

          {/* Detalhes das Entidades */}
          <Row gutter={[24, 24]}>
            {/* Entidades Modificadas */}
            {scannerModalData.existingEntities.length > 0 && (
              <Col span={12}>
                <Card 
                  title={
                    <Space>
                      <EditOutlined style={{ color: '#fa8c16' }} />
                      <Text strong style={{ color: isDarkMode ? '#ffffff' : '#1f1f1f' }}>
                        Entidades Modificadas
                      </Text>
                      <Tag color="orange">{scannerModalData.existingEntities.length}</Tag>
                    </Space>
                  }
                  size="small"
                  style={{
                    backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
                    borderColor: isDarkMode ? '#434343' : '#f0f0f0'
                  }}
                  bodyStyle={{ maxHeight: '300px', overflow: 'auto' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    {scannerModalData.existingEntities.map((entity, index) => (
                      <div key={index} style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: isDarkMode ? '#262626' : '#fff7e6',
                        border: isDarkMode ? '1px solid #434343' : '1px solid #ffd591'
                      }}>
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text strong style={{ 
                              color: '#fa8c16',
                              fontSize: '14px'
                            }}>
                              {entity.name}
                            </Text>
                            <Tag color="orange">
                              {entity.properties.length} props
                            </Tag>
                          </div>
                          <div style={{ marginLeft: '8px' }}>
                            {entity.properties.slice(0, 3).map((prop, i) => (
                              <Tag key={i} style={{ 
                                margin: '2px',
                                fontSize: '11px',
                                backgroundColor: isDarkMode ? '#434343' : '#f5f5f5',
                                color: isDarkMode ? '#d9d9d9' : '#595959',
                                border: 'none'
                              }}>
                                {prop.name}: {prop.type}
                              </Tag>
                            ))}
                            {entity.properties.length > 3 && (
                              <Text type="secondary" style={{ 
                                fontSize: '11px',
                                color: isDarkMode ? '#8c8c8c' : '#bfbfbf'
                              }}>
                                ... +{entity.properties.length - 3}
                              </Text>
                            )}
                          </div>
                        </Space>
                      </div>
                    ))}
                  </Space>
                </Card>
              </Col>
            )}

            {/* Entidades Novas */}
            {scannerModalData.newEntities.length > 0 && (
              <Col span={scannerModalData.existingEntities.length > 0 ? 12 : 24}>
                <Card 
                  title={
                    <Space>
                      <PlusOutlined style={{ color: '#52c41a' }} />
                      <Text strong style={{ color: isDarkMode ? '#ffffff' : '#1f1f1f' }}>
                        Novas Entidades
                      </Text>
                      <Tag color="green">{scannerModalData.newEntities.length}</Tag>
                    </Space>
                  }
                  size="small"
                  style={{
                    backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
                    borderColor: isDarkMode ? '#434343' : '#f0f0f0'
                  }}
                  bodyStyle={{ maxHeight: '300px', overflow: 'auto' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    {scannerModalData.newEntities.map((entity, index) => (
                      <div key={index} style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: isDarkMode ? '#262626' : '#f6ffed',
                        border: isDarkMode ? '1px solid #434343' : '1px solid #b7eb8f'
                      }}>
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text strong style={{ 
                              color: '#52c41a',
                              fontSize: '14px'
                            }}>
                              {entity.name}
                            </Text>
                            <Tag color="green">
                              {entity.properties.length} props
                            </Tag>
                          </div>
                          <div style={{ marginLeft: '8px' }}>
                            {entity.properties.slice(0, 3).map((prop, i) => (
                              <Tag key={i} style={{ 
                                margin: '2px',
                                fontSize: '11px',
                                backgroundColor: isDarkMode ? '#434343' : '#f5f5f5',
                                color: isDarkMode ? '#d9d9d9' : '#595959',
                                border: 'none'
                              }}>
                                {prop.name}: {prop.type}
                              </Tag>
                            ))}
                            {entity.properties.length > 3 && (
                              <Text type="secondary" style={{ 
                                fontSize: '11px',
                                color: isDarkMode ? '#8c8c8c' : '#bfbfbf'
                              }}>
                                ... +{entity.properties.length - 3}
                              </Text>
                            )}
                          </div>
                        </Space>
                      </div>
                    ))}
                  </Space>
                </Card>
              </Col>
            )}
          </Row>

          {/* Lista de Comandos - Refatorada */}
          <Card
            style={{
              backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
              borderColor: isDarkMode ? '#434343' : '#f0f0f0',
              borderRadius: '12px'
            }}
          >
            <Collapse
              ghost
              size="small"
              items={[{
                key: 'commands',
                label: (
                  <Space align="center">
                    <FileTextOutlined style={{ color: '#1890ff' }} />
                    <Text strong style={{ 
                      color: isDarkMode ? '#ffffff' : '#1f1f1f',
                      fontSize: '15px'
                    }}>
                      Comandos que serão executados
                    </Text>
                    <Tag color="blue">{scannerModalData.commands.length}</Tag>
                  </Space>
                ),
                children: (
                  <div style={{
                    padding: '16px',
                    borderRadius: '8px',
                    background: isDarkMode ? '#262626' : '#fafafa',
                    border: isDarkMode ? '1px solid #434343' : '1px solid #f0f0f0',
                    fontFamily: 'JetBrains Mono, Consolas, "Courier New", monospace',
                    maxHeight: '300px',
                    overflow: 'auto'
                  }}>
                    {scannerModalData.commands.length > 0 ? (
                      <Space direction="vertical" style={{ width: '100%' }} size="small">
                        {scannerModalData.commands.map((command, index) => (
                          <div key={index} style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            background: isDarkMode ? '#1f1f1f' : '#ffffff',
                            border: isDarkMode ? '1px solid #434343' : '1px solid #e6f7ff',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px'
                          }}>
                            <Tag color="blue" style={{ 
                              minWidth: '32px',
                              textAlign: 'center',
                              margin: 0,
                              fontSize: '11px'
                            }}>
                              {index + 1}
                            </Tag>
                            <Text 
                              code 
                              style={{ 
                                fontSize: '12px',
                                backgroundColor: 'transparent',
                                color: isDarkMode ? '#d9d9d9' : '#595959',
                                flex: 1,
                                wordBreak: 'break-all'
                              }}
                            >
                              {command}
                            </Text>
                          </div>
                        ))}
                      </Space>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Text type="secondary" style={{ 
                          fontSize: '14px',
                          color: isDarkMode ? '#8c8c8c' : '#bfbfbf'
                        }}>
                          Nenhum comando será executado
                        </Text>
                      </div>
                    )}
                  </div>
                )
              }]}
            />
          </Card>

          {/* Progress Bar quando executando */}
          {isExecutingCommands && (
            <Card
              style={{
                background: isDarkMode ? '#262626' : '#f0f9ff',
                border: isDarkMode ? '1px solid #434343' : '1px solid #91d5ff',
                borderRadius: '8px'
              }}
              bodyStyle={{ padding: '16px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Text strong style={{ 
                    color: isDarkMode ? '#1890ff' : '#1890ff',
                    fontSize: '15px'
                  }}>
                    Executando comandos...
                  </Text>
                  <SyncOutlined spin style={{ 
                    color: '#1890ff',
                    fontSize: '18px'
                  }} />
                </div>
                <Progress 
                  percent={75} 
                  size="small" 
                  status="active"
                  strokeColor="#1890ff"
                  trailColor={isDarkMode ? '#434343' : '#f0f0f0'}
                  showInfo={false}
                />
                <Text type="secondary" style={{ 
                  fontSize: '12px',
                  color: isDarkMode ? '#a0a0a0' : '#666666'
                }}>
                  Por favor, aguarde. Este processo pode levar alguns momentos.
                </Text>
              </Space>
            </Card>
          )}
        </Space>
      </Modal>
    </>
  );
};

export default ModalsManager;
