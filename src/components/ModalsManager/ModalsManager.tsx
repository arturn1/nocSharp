import React from 'react';
import { Modal, Button, Space, Card, Row, Col, Typography, Alert, Spin } from 'antd';
import { Entity } from '../../models/Entity';
import { EntityComparisonModalData, ScannerModalData } from '../../services/UIStateManager';

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

      {/* Modal do Entity Scanner */}
      <Modal
        title="🔍 Entity Scanner - Atualizar Projeto"
        open={showScannerModal}
        onOk={onExecuteScannerCommands}
        onCancel={onCloseScannerModal}
        width={1200}
        okText={isExecutingCommands ? "Executando..." : "🚀 Executar Comandos"}
        cancelText="Cancelar"
        confirmLoading={isExecutingCommands}
        okButtonProps={{ 
          disabled: isExecutingCommands || scannerModalData.commands.length === 0 
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Alert
            message={`Atualizando projeto: ${scannerModalData.projectName}`}
            description={
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>{`${scannerModalData.newEntities.length} novas entidades serão adicionadas ao projeto`}</Text>
                <Text code style={{ fontSize: '11px' }}>
                  📂 Diretório: {scannerModalData.projectPath}
                </Text>
              </Space>
            }
            type="info"
            showIcon
          />

          {/* Entidades Existentes e Novas */}
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="🏗️ Entidades Existentes no Projeto" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Total: {scannerModalData.existingEntities.length} entidades</Text>
                  <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                    {scannerModalData.existingEntities.map((entity, index) => (
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
                  </div>
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="✨ Novas Entidades a Serem Adicionadas" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Total: {scannerModalData.newEntities.length} entidades</Text>
                  <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                    {scannerModalData.newEntities.map((entity, index) => (
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
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Comandos a serem executados */}
          <Card title="📜 Comandos que serão executados:" size="small">
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              maxHeight: '250px',
              overflow: 'auto'
            }}>
              {scannerModalData.commands.length > 0 ? (
                scannerModalData.commands.map((command, index) => (
                  <div key={index} style={{ marginBottom: '8px' }}>
                    <Text style={{ color: '#666', fontSize: '11px' }}>#{index + 1}</Text><br />
                    <Text code>{command}</Text>
                  </div>
                ))
              ) : (
                <Text type="secondary">Nenhum comando será executado</Text>
              )}
            </div>

            {scannerModalData.commands.length > 0 && (
              <Alert
                message={`Total: ${scannerModalData.commands.length} comando(s) serão executados`}
                type="success"
                style={{ marginTop: '8px' }}
              />
            )}
          </Card>

          {isExecutingCommands && (
            <Card size="small">
              <Space>
                <Spin />
                <Text>Executando comandos... Por favor, aguarde.</Text>
              </Space>
            </Card>
          )}
        </Space>
      </Modal>
    </>
  );
};

export default ModalsManager;
