import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Spin, Alert, Row, Col, message, Collapse, Tag, Badge, Avatar, Affix } from 'antd';
import { SearchOutlined, FolderOpenOutlined, DatabaseOutlined, SettingOutlined, EditOutlined, PlusOutlined, CheckCircleOutlined, SwapOutlined, MinusOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { Entity } from '../../models/Entity';
import { Property } from '../../models/Property';
import { scanExistingEntities, getProjectMetadata } from '../../services/EntityScanService';
import { useTheme } from '../../contexts/ThemeContext';
import DBDiagramUpload from '../DBDiagramUpload';
import EntityForm from '../EntityForm';

const { Title, Text } = Typography;

interface EntityScannerProps {
  onEntitiesLoaded: (entities: Entity[]) => void;
  onDirectorySelected?: (path: string) => void;
  onUpdateProject?: (entities: Entity[]) => void;
  onLoadProject?: (entities: Entity[], projectName: string) => void;
  onEntityComparison?: (newEntities: Entity[], existingEntities: Entity[]) => boolean;
  existingEntities?: Entity[];
  onMergeEntities?: (newEntities: Entity[]) => void;
  onShowEntitiesComparison?: (existingEntities: Entity[], newEntities: Entity[]) => void;
  // Novas props para gerenciamento de entidades
  addEntity?: (entity: Entity) => void;
  updateEntityName?: (index: number, newName: string) => void;
  updateEntityBaseSkip?: (index: number, baseSkip: boolean) => void;
  addProperty?: (entityIndex: number, property: any) => void;
  updateProperty?: (entityIndex: number, propertyIndex: number, field: keyof Property, value: string) => void;
  removeProperty?: (entityIndex: number, propertyIndex: number) => void;
  removeEntity?: (index: number) => void;
  onUpdateModifiedEntities?: () => void;
  isExecutingCommands?: boolean;
  hasEntityChanges?: boolean;
  originalEntities?: Entity[];
  // Props para auto-reload do projeto
  currentProjectPath?: string;
  isExistingProject?: boolean;
  isVisible?: boolean;
  refreshTrigger?: number;
}

interface ProjectInfo {
  isValid: boolean;
  entityCount: number;
  projectName: string;
  path: string;
}

const EntityScanner: React.FC<EntityScannerProps> = ({ 
  onEntitiesLoaded, 
  onDirectorySelected, 
  onUpdateProject,
  onLoadProject,
  onEntityComparison,
  existingEntities = [],
  onMergeEntities,
  onShowEntitiesComparison,
  addEntity,
  updateEntityName,
  updateEntityBaseSkip,
  addProperty,
  updateProperty,
  removeProperty,
  removeEntity,
  onUpdateModifiedEntities,
  isExecutingCommands = false,
  hasEntityChanges = false,
  originalEntities = [],
  currentProjectPath,
  isExistingProject = false,
  isVisible = false,
  refreshTrigger
}) => {
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [scannedEntities, setScannedEntities] = useState<Entity[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isAutoLoading, setIsAutoLoading] = useState<boolean>(false);
  
  const { isDarkMode } = useTheme();

  // Auto-load project quando a tela estiver visível e houver um caminho
  useEffect(() => {
    const autoLoadProject = async () => {
      if (isVisible && currentProjectPath && isExistingProject && !projectInfo) {
        setIsAutoLoading(true);
        setErrors([]);

        try {
          const metadata = await getProjectMetadata(currentProjectPath);
          setProjectInfo({
            ...metadata,
            path: currentProjectPath
          });

          const scanResult = await scanExistingEntities(currentProjectPath);

          if (scanResult.success) {
            setScannedEntities(scanResult.entities);
            if (onLoadProject && metadata.projectName) {
              onLoadProject(scanResult.entities, metadata.projectName);
            }
            if (onEntitiesLoaded) {
              onEntitiesLoaded(scanResult.entities);
            }
            
            if (scanResult.entities.length === 0) {
              setErrors(['No entities found in the selected project. Make sure you selected a valid nocsharp project directory.']);
            }
          } else {
            setErrors(scanResult.errors);
            setScannedEntities([]);
          }
        } catch (error) {
          setErrors([`Failed to auto-load project: ${error.message}`]);
          setScannedEntities([]);
        } finally {
          setIsAutoLoading(false);
        }
      }
    };

    autoLoadProject();
  }, [isVisible, currentProjectPath, isExistingProject, refreshTrigger]);

  const handleScanDirectory = async () => {
    try {
      const result = await window.electron.dialog.showOpenDialog({
        properties: ['openDirectory'],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return;
      }

      const selectedPath = result.filePaths[0];
      setIsScanning(true);
      setErrors([]);

      const metadata = await getProjectMetadata(selectedPath);
      setProjectInfo({
        ...metadata,
        path: selectedPath
      });

      if (onDirectorySelected) {
        onDirectorySelected(selectedPath);
      }

      const scanResult = await scanExistingEntities(selectedPath);

      if (scanResult.success) {
        setScannedEntities(scanResult.entities);
        if (onLoadProject && metadata.projectName) {
          onLoadProject(scanResult.entities, metadata.projectName);
        }
        if (onEntitiesLoaded) {
          onEntitiesLoaded(scanResult.entities);
        }
        
        if (scanResult.entities.length === 0) {
          setErrors(['No entities found in the selected project. Make sure you selected a valid nocsharp project directory.']);
        }
      } else {
        setErrors(scanResult.errors);
        setScannedEntities([]);
      }
    } catch (error) {
      setErrors([`Failed to scan directory: ${error.message}`]);
      setScannedEntities([]);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDBDiagramEntitiesLoaded = (entities: Entity[], fileName?: string) => {
    if (onMergeEntities) {
      onMergeEntities(entities);
    }
  };

  const handleUpdateProject = () => {
    const existingEntitiesInProject = existingEntities.filter(entity => 
      scannedEntities.some(scanned => scanned.name === entity.name)
    );
    
    const newEntitiesForProject = existingEntities.filter(entity => 
      !scannedEntities.some(scanned => scanned.name === entity.name)
    );
    
    if (onShowEntitiesComparison) {
      onShowEntitiesComparison(existingEntitiesInProject, newEntitiesForProject);
    }
  };

  // Funções para análise de entidades
  const getNewEntities = () => {
    return existingEntities.filter(entity => 
      entity.name !== 'BaseEntity' && 
      !scannedEntities.some(scanned => scanned.name === entity.name)
    );
  };

  const getModifiedEntities = () => {
    return existingEntities.filter(currentEntity => {
      if (currentEntity.name === 'BaseEntity') return false;
      
      const originalEntity = originalEntities.find(orig => orig.name === currentEntity.name);
      const scannedEntity = scannedEntities.find(scanned => scanned.name === currentEntity.name);
      
      if (!originalEntity && scannedEntity) {
        return JSON.stringify(currentEntity) !== JSON.stringify(scannedEntity);
      }
      
      if (originalEntity) {
        return JSON.stringify(currentEntity) !== JSON.stringify(originalEntity);
      }
      
      return false;
    });
  };

  const getEntityChangeDetails = (entity: Entity) => {
    const originalEntity = originalEntities.find(orig => orig.name === entity.name);
    const scannedEntity = scannedEntities.find(scanned => scanned.name === entity.name);
    const referenceEntity = originalEntity || scannedEntity;
    
    if (!referenceEntity) return [];
    
    const changes: Array<{type: 'added' | 'modified' | 'removed', property: string, detail: string}> = [];
    
    const currentProps = entity.properties || [];
    const referenceProps = referenceEntity.properties || [];
    
    // Propriedades adicionadas
    currentProps.forEach(prop => {
      const refProp = referenceProps.find(p => p.name === prop.name);
      if (!refProp) {
        changes.push({ type: 'added', property: prop.name, detail: `Tipo: ${prop.type}` });
      } else if (JSON.stringify(prop) !== JSON.stringify(refProp)) {
        changes.push({ type: 'modified', property: prop.name, detail: `${refProp.type} → ${prop.type}` });
      }
    });
    
    // Propriedades removidas
    referenceProps.forEach(prop => {
      const currentProp = currentProps.find(p => p.name === prop.name);
      if (!currentProp) {
        changes.push({ type: 'removed', property: prop.name, detail: `Tipo: ${prop.type}` });
      }
    });
    
    return changes;
  };

  return (
    <div style={{ background: isDarkMode ? '#0f1419' : '#f8fafc', minHeight: '100vh' }}>
      <Card
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            background: isDarkMode 
              ? 'linear-gradient(135deg, #4A90E2 0%, #5D6D7E 100%)' 
              : 'linear-gradient(135deg, #4A90E2 0%, #74B4E8 100%)',
            margin: '-16px -16px 0 -16px',
            padding: '20px',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)'
          }}>
            <Avatar 
              icon={<SearchOutlined />} 
              size="large"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }} 
            />
            <div>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 600,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                marginBottom: '2px'
              }}>
                Entity Scanner
              </div>
              <div style={{ 
                fontSize: '12px', 
                opacity: 0.9,
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                Análise e configuração de entidades em tempo real
              </div>
            </div>
          </div>
        }
        size="small"
        style={{
          background: isDarkMode ? '#1a1a1a' : '#ffffff',
          border: isDarkMode ? '1px solid #333' : '1px solid #e8e8e8',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: isDarkMode 
            ? '0 8px 24px rgba(0, 0, 0, 0.4)' 
            : '0 8px 24px rgba(0, 0, 0, 0.1)'
        }}
        extra={
          projectInfo ? (
            <Button 
              icon={<FolderOpenOutlined />}
              onClick={handleScanDirectory}
              loading={isScanning}
              size="small"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                borderRadius: '6px'
              }}
            >
              Rescan Project
            </Button>
          ) : null
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {/* Auto-loading indicator */}
          {isAutoLoading && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin size="large" />
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary">Loading project from {currentProjectPath}...</Text>
              </div>
            </div>
          )}

          {/* Scan Project Button */}
          {!projectInfo && !isAutoLoading && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Button 
                icon={<FolderOpenOutlined />}
                onClick={handleScanDirectory}
                loading={isScanning}
                size="large"
                type="primary"
              >
                {isScanning ? 'Scanning...' : 'Scan Project'}
              </Button>
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary">Click to scan an existing nocSharp project</Text>
              </div>
            </div>
          )}

          {isScanning && !isAutoLoading && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin />
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary">Scanning project directory...</Text>
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <Alert
              type="error"
              message="Scan Errors"
              description={
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              }
              showIcon
            />
          )}

          {/* Project Information - Status Bar Fixo */}
          {projectInfo && projectInfo.isValid && (
            <>
              <Affix offsetTop={0}>
                <Card 
                  style={{ 
                    marginBottom: '16px',
                    background: isDarkMode 
                      ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
                      : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: isDarkMode 
                      ? '1px solid #4A90E2'
                      : '1px solid #4A90E2',
                    borderRadius: '12px',
                    boxShadow: isDarkMode 
                      ? '0 8px 32px rgba(74, 144, 226, 0.2)'
                      : '0 8px 32px rgba(74, 144, 226, 0.1)',
                    zIndex: 100,
                    backdropFilter: 'blur(10px)'
                  }}
                  bodyStyle={{ padding: '20px 24px' }}
                >
                  {/* Header do Projeto */}
                  <Row align="middle" justify="space-between" style={{ marginBottom: '20px' }}>
                    <Col>
                      <Space align="center" size="large">
                        <div style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, #4A90E2 0%, #5D6D7E 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 8px 24px rgba(74, 144, 226, 0.4)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '-50%',
                            left: '-50%',
                            width: '200%',
                            height: '200%',
                            background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
                            animation: 'shimmer 2s infinite linear'
                          }} />
                          <DatabaseOutlined style={{ fontSize: '28px', color: 'white', zIndex: 1 }} />
                        </div>
                        <div>
                          <Title level={3} style={{ 
                            margin: 0, 
                            color: isDarkMode ? '#ffffff' : '#1f1f1f',
                            fontSize: '22px',
                            fontWeight: 700
                          }}>
                            {projectInfo.projectName}
                          </Title>
                          <Space size="small" style={{ marginTop: '4px' }}>
                            <Badge 
                              status={hasEntityChanges ? 'processing' : 'success'} 
                            />
                            <Text style={{ 
                              fontSize: '14px',
                              color: isDarkMode ? '#94a3b8' : '#64748b',
                              fontWeight: 500
                            }}>
                              Projeto .NET • {hasEntityChanges ? 'Modificações Pendentes' : 'Sincronizado'}
                            </Text>
                          </Space>
                        </div>
                      </Space>
                    </Col>
                    <Col>
                      <Space size="large">
                        {hasEntityChanges && (
                          <Button 
                            type="primary"
                            size="large"
                            icon={<ArrowUpOutlined />}
                            style={{
                              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: 600,
                              boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
                            }}
                            onClick={handleUpdateProject}
                            loading={isExecutingCommands}
                          >
                            Atualizar Projeto
                          </Button>
                        )}
                      </Space>
                    </Col>
                  </Row>

                  {/* Métricas em Cards Modernos */}
                  <Row gutter={[20, 16]} align="middle">
                    <Col span={6}>
                      <Card size="small" style={{ 
                        background: isDarkMode ? '#262626' : '#f8fafc',
                        border: isDarkMode ? '1px solid #404040' : '1px solid #e2e8f0',
                        borderRadius: '12px',
                        textAlign: 'center'
                      }}>
                        <div style={{ 
                          fontSize: '28px',
                          fontWeight: 'bold',
                          color: '#4A90E2',
                          marginBottom: '4px'
                        }}>
                          {existingEntities.filter(entity => entity.name !== 'BaseEntity').length}
                        </div>
                        <Text style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '12px' }}>
                          Total
                        </Text>
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small" style={{ 
                        background: isDarkMode ? '#1f2937' : '#f0fdf4',
                        border: isDarkMode ? '1px solid #16a34a' : '1px solid #22c55e',
                        borderRadius: '12px',
                        textAlign: 'center'
                      }}>
                        <div style={{ 
                          fontSize: '28px',
                          fontWeight: 'bold',
                          color: '#22c55e',
                          marginBottom: '4px'
                        }}>
                          {getNewEntities().length}
                        </div>
                        <Text style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '12px' }}>
                          Novas
                        </Text>
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small" style={{ 
                        background: isDarkMode ? '#2d1b20' : '#fefdf0',
                        border: isDarkMode ? '1px solid #f59e0b' : '1px solid #f59e0b',
                        borderRadius: '12px',
                        textAlign: 'center'
                      }}>
                        <div style={{ 
                          fontSize: '28px',
                          fontWeight: 'bold',
                          color: '#f59e0b',
                          marginBottom: '4px'
                        }}>
                          {getModifiedEntities().length}
                        </div>
                        <Text style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '12px' }}>
                          Modificadas
                        </Text>
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small" style={{ 
                        background: isDarkMode ? '#261d30' : '#faf7ff',
                        border: isDarkMode ? '1px solid #8b5cf6' : '1px solid #8b5cf6',
                        borderRadius: '12px',
                        textAlign: 'center'
                      }}>
                        <div style={{ 
                          fontSize: '28px',
                          fontWeight: 'bold',
                          color: '#8b5cf6',
                          marginBottom: '4px'
                        }}>
                          {scannedEntities.length}
                        </div>
                        <Text style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '12px' }}>
                          No Projeto
                        </Text>
                      </Card>
                    </Col>
                  </Row>
                </Card>
              </Affix>

              {/* Detalhes das Alterações - Collapsible Moderno */}
              {(getNewEntities().length > 0 || getModifiedEntities().length > 0) && (
                <Card 
                  style={{ 
                    marginBottom: '16px',
                    background: isDarkMode 
                      ? 'linear-gradient(135deg, #1a1a1a 0%, #252525 100%)' 
                      : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: isDarkMode ? '1px solid #333' : '1px solid #e8e8e8',
                    borderRadius: '12px',
                    boxShadow: isDarkMode 
                      ? '0 4px 16px rgba(0, 0, 0, 0.3)' 
                      : '0 4px 16px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  <Collapse
                    ghost
                    expandIconPosition="end"
                    items={[{
                      key: 'changes',
                      label: (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          padding: '8px 0'
                        }}>
                          <Avatar 
                            icon={<SwapOutlined />} 
                            size="small"
                            style={{ 
                              backgroundColor: '#4A90E2',
                              border: 'none'
                            }} 
                          />
                          <div>
                            <Text strong style={{ 
                              color: isDarkMode ? '#ffffff' : '#1f1f1f',
                              fontSize: '16px'
                            }}>
                              Alterações Detectadas
                            </Text>
                            <div style={{ marginTop: '2px' }}>
                              <Text style={{ 
                                fontSize: '12px',
                                color: isDarkMode ? '#94a3b8' : '#64748b'
                              }}>
                                {getNewEntities().length} novas • {getModifiedEntities().length} modificadas
                              </Text>
                            </div>
                          </div>
                          <Badge 
                            count={getNewEntities().length + getModifiedEntities().length} 
                            style={{ 
                              backgroundColor: '#4A90E2',
                              marginLeft: 'auto'
                            }} 
                          />
                        </div>
                      ),
                      children: (
                        <div style={{ padding: '16px 0' }}>
                          <Space direction="vertical" style={{ width: '100%' }} size="large">
                            {/* Entidades Novas */}
                            {getNewEntities().length > 0 && (
                              <Card 
                                size="small" 
                                style={{ 
                                  background: isDarkMode ? '#0f2027' : '#f0fdf4',
                                  border: isDarkMode ? '1px solid #16a34a' : '1px solid #22c55e',
                                  borderRadius: '8px'
                                }}
                              >
                                <Space align="center" style={{ marginBottom: '16px' }}>
                                  <Avatar 
                                    icon={<PlusOutlined />} 
                                    size="small"
                                    style={{ 
                                      backgroundColor: '#22c55e',
                                      border: 'none'
                                    }} 
                                  />
                                  <Text strong style={{ 
                                    color: '#22c55e',
                                    fontSize: '14px'
                                  }}>
                                    Entidades Novas ({getNewEntities().length})
                                  </Text>
                                </Space>
                                <Row gutter={[8, 8]}>
                                  {getNewEntities().map((entity, index) => (
                                    <Col key={index}>
                                      <Card 
                                        size="small" 
                                        style={{ 
                                          background: isDarkMode ? '#1a1a1a' : '#ffffff',
                                          border: isDarkMode ? '1px solid #333' : '1px solid #e8e8e8',
                                          borderRadius: '6px',
                                          minWidth: '160px'
                                        }}
                                      >
                                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                          <Space align="center">
                                            <DatabaseOutlined style={{ color: '#22c55e' }} />
                                            <Text strong style={{ 
                                              color: isDarkMode ? '#ffffff' : '#1f1f1f',
                                              fontSize: '13px'
                                            }}>
                                              {entity.name}
                                            </Text>
                                            <Badge 
                                              count="NEW" 
                                              style={{ 
                                                backgroundColor: '#22c55e',
                                                fontSize: '10px'
                                              }} 
                                            />
                                          </Space>
                                          <Text style={{ 
                                            fontSize: '11px',
                                            color: isDarkMode ? '#94a3b8' : '#64748b'
                                          }}>
                                            {entity.properties?.length || 0} propriedades
                                          </Text>
                                        </Space>
                                      </Card>
                                    </Col>
                                  ))}
                                </Row>
                              </Card>
                            )}

                            {/* Entidades Modificadas */}
                            {getModifiedEntities().length > 0 && (
                              <Card 
                                size="small" 
                                style={{ 
                                  background: isDarkMode ? '#2d1f0f' : '#fffbeb',
                                  border: isDarkMode ? '1px solid #f59e0b' : '1px solid #f59e0b',
                                  borderRadius: '8px'
                                }}
                              >
                                <Space align="center" style={{ marginBottom: '16px' }}>
                                  <Avatar 
                                    icon={<EditOutlined />} 
                                    size="small"
                                    style={{ 
                                      backgroundColor: '#f59e0b',
                                      border: 'none'
                                    }} 
                                  />
                                  <Text strong style={{ 
                                    color: '#f59e0b',
                                    fontSize: '14px'
                                  }}>
                                    Entidades Modificadas ({getModifiedEntities().length})
                                  </Text>
                                </Space>
                                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                  {getModifiedEntities().map((entity, index) => {
                                    const changes = getEntityChangeDetails(entity);
                                    return (
                                      <Card 
                                        key={index} 
                                        size="small" 
                                        style={{ 
                                          background: isDarkMode ? '#1a1a1a' : '#ffffff',
                                          border: isDarkMode ? '1px solid #333' : '1px solid #e8e8e8',
                                          borderRadius: '6px'
                                        }}
                                      >
                                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                            <Space align="center">
                                              <DatabaseOutlined style={{ color: '#f59e0b' }} />
                                              <Text strong style={{ 
                                                color: isDarkMode ? '#ffffff' : '#1f1f1f',
                                                fontSize: '13px'
                                              }}>
                                                {entity.name}
                                              </Text>
                                            </Space>
                                            <Text style={{ 
                                              fontSize: '11px',
                                              color: isDarkMode ? '#94a3b8' : '#64748b'
                                            }}>
                                              {changes.length} alteração{changes.length !== 1 ? 'ões' : ''}
                                            </Text>
                                          </Space>
                                          
                                          {/* Lista de Mudanças */}
                                          <div style={{ marginTop: '8px' }}>
                                            <Space wrap size="small">
                                              {changes.map((change, changeIndex) => (
                                                <Tag 
                                                  key={changeIndex}
                                                  color={
                                                    change.type === 'added' ? 'green' :
                                                    change.type === 'modified' ? 'orange' : 'red'
                                                  }
                                                  style={{ margin: '1px' }}
                                                >
                                                  <Space size="small">
                                                    {change.type === 'added' ? <PlusOutlined /> :
                                                     change.type === 'modified' ? <SwapOutlined /> : <MinusOutlined />}
                                                    <Text code style={{ fontSize: '11px' }}>
                                                      {change.property}
                                                    </Text>
                                                  </Space>
                                                </Tag>
                                              ))}
                                            </Space>
                                          </div>
                                        </Space>
                                      </Card>
                                    );
                                  })}
                                </Space>
                              </Card>
                            )}
                          </Space>
                        </div>
                      )
                    }]}
                  />
                </Card>
              )}
            </>
          )}

          {/* Import from DBDiagram */}
          {((projectInfo && projectInfo.isValid) || (currentProjectPath && isExistingProject)) && (
            <DBDiagramUpload 
              onEntitiesLoaded={handleDBDiagramEntitiesLoaded}
              title="Import from DBDiagram"
              description="Upload a .dbml or .txt file to import entities"
              onEntityComparison={onEntityComparison}
              existingEntities={existingEntities}
            />
          )}

          {/* Configuração de Entidades */}
          {projectInfo && projectInfo.isValid && scannedEntities.length > 0 && (
            <Card 
              title={
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '8px 0'
                }}>
                  <Avatar 
                    icon={<SettingOutlined />} 
                    size="small"
                    style={{ 
                      backgroundColor: '#4A90E2',
                      border: 'none'
                    }} 
                  />
                  <div>
                    <Text strong style={{ 
                      color: isDarkMode ? '#ffffff' : '#1f1f1f',
                      fontSize: '16px'
                    }}>
                      Configuração de Entidades
                    </Text>
                    <div style={{ marginTop: '2px' }}>
                      <Text style={{ 
                        fontSize: '12px',
                        color: isDarkMode ? '#94a3b8' : '#64748b'
                      }}>
                        Gerencie suas entidades e propriedades
                      </Text>
                    </div>
                  </div>
                  <Badge 
                    count={existingEntities.filter(entity => entity.name !== 'BaseEntity').length} 
                    style={{ 
                      backgroundColor: '#4A90E2',
                      marginLeft: 'auto'
                    }} 
                  />
                </div>
              } 
              style={{ 
                marginTop: '16px',
                background: isDarkMode 
                  ? 'linear-gradient(135deg, #1a1a1a 0%, #252525 100%)' 
                  : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: isDarkMode ? '1px solid #333' : '1px solid #e8e8e8',
                borderRadius: '12px',
                boxShadow: isDarkMode 
                  ? '0 4px 16px rgba(0, 0, 0, 0.3)' 
                  : '0 4px 16px rgba(0, 0, 0, 0.08)'
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {addEntity && (
                  <EntityForm
                    entities={existingEntities.filter(entity => entity.name !== 'BaseEntity')}
                    addEntity={addEntity}
                    updateEntityName={updateEntityName}
                    updateEntityBaseSkip={updateEntityBaseSkip}
                    addProperty={addProperty}
                    updateProperty={updateProperty}
                    removeProperty={removeProperty}
                    removeEntity={removeEntity}
                    projectPath={projectInfo?.path}
                    scannedEntities={scannedEntities}
                    collapsible
                  />
                )}
              </Space>
            </Card>
          )}

          {/* Botão de Atualização */}
          {projectInfo && projectInfo.isValid && (existingEntities.length > scannedEntities.length || hasEntityChanges) && (
            <Card 
              style={{ 
                marginTop: '16px',
                background: isDarkMode 
                  ? 'linear-gradient(135deg, #1a1a1a 0%, #252525 100%)' 
                  : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: isDarkMode ? '1px solid #333' : '1px solid #e8e8e8',
                borderRadius: '12px',
                textAlign: 'center'
              }}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Title level={4} style={{ 
                    color: isDarkMode ? '#ffffff' : '#1f1f1f',
                    margin: 0
                  }}>
                    Projeto Pronto para Atualização
                  </Title>
                  <Text style={{ 
                    color: isDarkMode ? '#94a3b8' : '#64748b',
                    fontSize: '14px'
                  }}>
                    {getNewEntities().length} novas entidades e {getModifiedEntities().length} modificadas serão aplicadas
                  </Text>
                </div>
                
                <Button 
                  type="primary"
                  size="large"
                  onClick={handleUpdateProject}
                  loading={isExecutingCommands}
                  disabled={isExecutingCommands}
                  style={{ 
                    height: '56px',
                    fontSize: '16px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    minWidth: '280px',
                    background: isExecutingCommands 
                      ? (isDarkMode ? '#434343' : '#d9d9d9')
                      : 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                    border: 'none',
                    boxShadow: isExecutingCommands 
                      ? 'none' 
                      : '0 8px 24px rgba(82, 196, 26, 0.3)'
                  }}
                >
                  {isExecutingCommands ? (
                    <Space>
                      <Spin />
                      Executando Atualização...
                    </Space>
                  ) : (
                    <Space>
                      <CheckCircleOutlined />
                      Executar Atualização do Projeto
                    </Space>
                  )}
                </Button>
              </Space>
            </Card>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default EntityScanner;
