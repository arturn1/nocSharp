import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Spin, Alert, Statistic, Row, Col, message, Collapse, Tag, Badge, Divider, Popover, Progress, Avatar, Affix } from 'antd';
import { SearchOutlined, FolderOpenOutlined, DatabaseOutlined, SettingOutlined, InfoCircleOutlined, EditOutlined, PlusOutlined, CheckCircleOutlined, SyncOutlined, ArrowUpOutlined, MinusOutlined, SwapOutlined } from '@ant-design/icons';
import { Entity } from '../../models/Entity';
import { Property } from '../../models/Property';
import { scanExistingEntities, getProjectMetadata } from '../../services/EntityScanService';
import { EntityCleanService } from '../../services/EntityCleanService';
import { ProjectContext } from '../../services/ProjectManager';
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
  isVisible?: boolean; // Para detectar quando a tela está ativa
  refreshTrigger?: number; // Para forçar reload após execução de comandos
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
  // Props para gerenciamento de entidades
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
  // Props para auto-reload
  currentProjectPath,
  isExistingProject = false,
  isVisible = false,
  refreshTrigger
}) => {
  const { isDarkMode } = useTheme();
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [scannedEntities, setScannedEntities] = useState<Entity[]>([]);
  const [showProjectEntities, setShowProjectEntities] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isAutoLoading, setIsAutoLoading] = useState<boolean>(false);
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);

  // Função centralizada para recarregar o projeto
  const reloadProject = async (showLoadingMessage = true, successMessage?: string) => {
    if (!projectInfo?.path) {
      console.warn('Não é possível recarregar: caminho do projeto não encontrado');
      return { success: false, error: 'Caminho do projeto não encontrado' };
    }

    let hideReloadMessage: (() => void) | null = null;
    
    try {
      if (showLoadingMessage) {
        hideReloadMessage = message.loading('Recarregando projeto...', 2);
      }

      const scanResult = await scanExistingEntities(projectInfo.path);
      
      if (scanResult.success) {
        setScannedEntities(scanResult.entities);
        
        // Atualizar metadados do projeto para refletir as mudanças
        const metadata = await getProjectMetadata(projectInfo.path);
        setProjectInfo({
          ...metadata,
          path: projectInfo.path
        });
        
        // Propagar as entidades atualizadas
        if (onEntitiesLoaded) {
          onEntitiesLoaded(scanResult.entities);
        }
        
        // Se existe função de carregamento de projeto, usar também
        if (onLoadProject && metadata.projectName) {
          onLoadProject(scanResult.entities, metadata.projectName);
        }
        
        if (hideReloadMessage) {
          hideReloadMessage();
        }
        
        const finalMessage = successMessage || `Projeto recarregado: ${scanResult.entities.length} entidades encontradas`;
        message.success(finalMessage);
        
        console.log(`Projeto recarregado com sucesso: ${scanResult.entities.length} entidades encontradas`);
        return { success: true, entities: scanResult.entities };
        
      } else {
        if (hideReloadMessage) {
          hideReloadMessage();
        }
        message.warning('Projeto recarregado, mas podem haver inconsistências');
        console.error('Erro ao reescanear projeto:', scanResult.errors);
        return { success: false, error: 'Erro ao reescanear projeto', details: scanResult.errors };
      }
      
    } catch (error) {
      if (hideReloadMessage) {
        hideReloadMessage();
      }
      message.error('Erro ao recarregar projeto');
      console.error('Erro ao recarregar projeto:', error);
      return { success: false, error: 'Erro inesperado ao recarregar projeto', details: error };
    }
  };

  // Auto-load project quando a tela estiver visível e houver um caminho
  useEffect(() => {
    const autoLoadProject = async () => {
      if (isVisible && currentProjectPath && isExistingProject) {
        setIsAutoLoading(true);
        setErrors([]);

        try {
          console.log('EntityScanner: Auto-loading project from', currentProjectPath, 'refreshTrigger:', refreshTrigger);
          
          // Get project metadata first
          const metadata = await getProjectMetadata(currentProjectPath);
          setProjectInfo({
            ...metadata,
            path: currentProjectPath
          });

          // Scan for existing entities
          const scanResult = await scanExistingEntities(currentProjectPath);

          if (scanResult.success) {
            console.log('EntityScanner: Loaded', scanResult.entities.length, 'entities');
            setScannedEntities(scanResult.entities);
            
            if (onLoadProject && metadata.projectName) {
              onLoadProject(scanResult.entities, metadata.projectName);
            }
            // Carregar entidades existentes no gerenciador global
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
          console.error('EntityScanner: Failed to auto-load project:', error);
          setErrors([`Failed to auto-load project: ${error.message}`]);
          setScannedEntities([]);
        } finally {
          setIsAutoLoading(false);
        }
      }
    };

    autoLoadProject();
  }, [isVisible, currentProjectPath, isExistingProject, refreshTrigger]); // Trigger quando a tela fica visível ou refreshTrigger muda

  // Efeito adicional para forçar reload quando refreshTrigger mudar (mesmo com projeto já carregado)
  useEffect(() => {
    const forceReload = async () => {
      if (refreshTrigger > 0 && projectInfo?.path && isVisible) {
        console.log('EntityScanner: Force reload triggered, refreshTrigger:', refreshTrigger);
        setIsAutoLoading(true);
        setErrors([]);

        try {
          // Get project metadata first
          const metadata = await getProjectMetadata(projectInfo.path);
          setProjectInfo({
            ...metadata,
            path: projectInfo.path
          });

          // Scan for existing entities
          const scanResult = await scanExistingEntities(projectInfo.path);

          if (scanResult.success) {
            console.log('EntityScanner: Force reload completed, loaded', scanResult.entities.length, 'entities');
            setScannedEntities(scanResult.entities);
            
            if (onLoadProject && metadata.projectName) {
              onLoadProject(scanResult.entities, metadata.projectName);
            }
            // Carregar entidades existentes no gerenciador global
            if (onEntitiesLoaded) {
              onEntitiesLoaded(scanResult.entities);
            }
          } else {
            setErrors(scanResult.errors);
            setScannedEntities([]);
          }
        } catch (error) {
          console.error('EntityScanner: Failed to force reload project:', error);
          setErrors([`Failed to reload project: ${error.message}`]);
        } finally {
          setIsAutoLoading(false);
        }
      }
    };

    forceReload();
  }, [refreshTrigger]); // Só responder ao refreshTrigger

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

      // Get project metadata first
      const metadata = await getProjectMetadata(selectedPath);
      setProjectInfo({
        ...metadata,
        path: selectedPath
      });

      if (onDirectorySelected) {
        onDirectorySelected(selectedPath);
      }

      // Scan for existing entities
      const scanResult = await scanExistingEntities(selectedPath);

      if (scanResult.success) {
        setScannedEntities(scanResult.entities);
        if (onLoadProject && metadata.projectName) {
          onLoadProject(scanResult.entities, metadata.projectName);
        }
        // Carregar entidades existentes no gerenciador global
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
    // Detectar entidades modificadas comparando com as originais
    const modifiedEntities = existingEntities.filter(currentEntity => {
      const originalEntity = originalEntities.find(orig => orig.name === currentEntity.name);
      return originalEntity && JSON.stringify(currentEntity) !== JSON.stringify(originalEntity);
    });
    
    // Detectar novas entidades (que não existem no projeto escaneado)
    const newEntitiesForProject = existingEntities.filter(entity => 
      !scannedEntities.some(scanned => scanned.name === entity.name)
    );
    
    // Combinar entidades modificadas e novas para o modal
    const allChangedEntities = [...modifiedEntities, ...newEntitiesForProject];
    
    // Usar a função de comparação, passando as entidades modificadas como "existing"
    // e as novas como "new" para manter a estrutura do modal
    if (onShowEntitiesComparison) {
      onShowEntitiesComparison(modifiedEntities, newEntitiesForProject);
    }
  };

  // Função para calcular entidades modificadas
  const getModifiedEntitiesCount = () => {
    if (originalEntities.length === 0) return 0;
    
    const nonBaseEntities = existingEntities.filter(entity => entity.name !== 'BaseEntity');
    let modifiedCount = 0;
    
    nonBaseEntities.forEach(currentEntity => {
      const originalEntity = originalEntities.find(orig => orig.name === currentEntity.name);
      if (!originalEntity || JSON.stringify(currentEntity) !== JSON.stringify(originalEntity)) {
        modifiedCount++;
      }
    });
    
    return modifiedCount;
  };

  // Função para limpeza de entidades
  const handleCleanEntities = async (entityNames: string[]) => {
    if (!projectInfo?.path) {
      message.error('Caminho do projeto não encontrado');
      return;
    }

    try {
      // Adicionar entidades às exclusões pendentes
      setPendingDeletions(prev => [...new Set([...prev, ...entityNames])]);
      
      message.loading('Removendo entidades...', 0);

      const projectContext: ProjectContext = {
        projectName: projectInfo.projectName || 'Projeto',
        directoryPath: projectInfo.path,
        isExistingProject: true,
        executeCommands: true
      };

      const result = await EntityCleanService.cleanEntities(
        entityNames, 
        projectContext, 
        { force: true }
      );

      message.destroy();

      if (result.success) {
        message.success(`${entityNames.length} entidades removidas com sucesso!`);
        
        // Remover das exclusões pendentes após sucesso
        setPendingDeletions(prev => prev.filter(name => !entityNames.includes(name)));
        
        // Usar a função centralizada de recarregamento
        await reloadProject(true, `Entidades removidas e projeto atualizado: ${entityNames.join(', ')}`);
      } else {
        // Remover das exclusões pendentes em caso de erro
        setPendingDeletions(prev => prev.filter(name => !entityNames.includes(name)));
        message.error(`Erro ao remover entidades: ${result.error}`);
      }
    } catch (error) {
      message.destroy();
      // Remover das exclusões pendentes em caso de erro
      setPendingDeletions(prev => prev.filter(name => !entityNames.includes(name)));
      message.error(`Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // Funções auxiliares para análise de mudanças
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
        // Entidade existe no projeto mas foi modificada localmente
        return JSON.stringify(currentEntity) !== JSON.stringify(scannedEntity);
      }
      
      if (originalEntity) {
        // Entidade foi modificada comparando com a versão original
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
    
    // Comparar propriedades
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
    <div>
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

        {/* 📊 Project Information - Status Bar Fixo */}
        {projectInfo && projectInfo.isValid && (
          <>
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
                    <Statistic
                      title={<Text style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '12px' }}>Total</Text>}
                      value={existingEntities.filter(entity => entity.name !== 'BaseEntity').length}
                      valueStyle={{ 
                        color: '#4A90E2', 
                        fontSize: '28px',
                        fontWeight: 'bold'
                      }}
                      prefix={<DatabaseOutlined style={{ color: '#4A90E2' }} />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small" style={{ 
                    background: isDarkMode ? '#1f2937' : '#f0fdf4',
                    border: isDarkMode ? '1px solid #16a34a' : '1px solid #22c55e',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <Statistic
                      title={<Text style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '12px' }}>Novas</Text>}
                      value={getNewEntities().length}
                      valueStyle={{ 
                        color: '#22c55e', 
                        fontSize: '28px',
                        fontWeight: 'bold'
                      }}
                      prefix={<PlusOutlined style={{ color: '#22c55e' }} />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small" style={{ 
                    background: isDarkMode ? '#2d1b20' : '#fefdf0',
                    border: isDarkMode ? '1px solid #f59e0b' : '1px solid #f59e0b',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <Statistic
                      title={<Text style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '12px' }}>Modificadas</Text>}
                      value={getModifiedEntities().length}
                      valueStyle={{ 
                        color: '#f59e0b', 
                        fontSize: '28px',
                        fontWeight: 'bold'
                      }}
                      prefix={<EditOutlined style={{ color: '#f59e0b' }} />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small" style={{ 
                    background: isDarkMode ? '#261d30' : '#faf7ff',
                    border: isDarkMode ? '1px solid #8b5cf6' : '1px solid #8b5cf6',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <Statistic
                      title={<Text style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '12px' }}>No Projeto</Text>}
                      value={scannedEntities.length}
                      valueStyle={{ 
                        color: '#8b5cf6', 
                        fontSize: '28px',
                        fontWeight: 'bold'
                      }}
                      prefix={<CheckCircleOutlined style={{ color: '#8b5cf6' }} />}
                    />
                  </Card>
                </Col>
              </Row>
            </Card>

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
                                      </div>
                                      
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
              <Space>
                <SettingOutlined />
                Configuração de Entidades
              </Space>
            } 
            size="small" 
            style={{ marginTop: '16px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
                {/* Componente de formulário de entidades */}
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
                    onCleanEntities={handleCleanEntities}
                    projectPath={projectInfo?.path}
                    pendingDeletions={pendingDeletions}
                    scannedEntities={scannedEntities}
                    collapsible
                  />
                )}
            </Space>
          </Card>
        )}

        {/* Atualizar Projeto - Seção Dinâmica */}
        {projectInfo && projectInfo.isValid && (existingEntities.length > scannedEntities.length || hasEntityChanges) && (
          <Card 
            style={{ 
              marginTop: '16px',
              backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
              borderColor: isDarkMode ? '#434343' : '#f0f0f0',
              borderRadius: '12px'
            }}
          >
            <Collapse
              ghost
              items={[{
                key: 'update',
                label: (
                  <Space align="center" style={{ width: '100%' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)'
                    }}>
                      <ArrowUpOutlined style={{ fontSize: '16px', color: 'white' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ 
                        color: isDarkMode ? '#ffffff' : '#1f1f1f',
                        fontSize: '16px'
                      }}>
                        Atualizar Projeto
                      </Text>
                      <div style={{ marginTop: '2px' }}>
                        <Text type="secondary" style={{ 
                          fontSize: '12px',
                          color: isDarkMode ? '#a0a0a0' : '#666666'
                        }}>
                          {getNewEntities().length + getModifiedEntities().length} alterações pendentes
                        </Text>
                      </div>
                    </div>
                    <Badge 
                      count={getNewEntities().length + getModifiedEntities().length} 
                      style={{ 
                        backgroundColor: '#52c41a',
                        boxShadow: '0 0 0 1px #52c41a inset'
                      }} 
                    />
                  </Space>
                ),
                children: (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {/* Resumo das Alterações */}
                    <div style={{
                      padding: '16px',
                      borderRadius: '8px',
                      background: isDarkMode 
                        ? 'linear-gradient(135deg, #262626 0%, #1f1f1f 100%)'
                        : 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
                      border: isDarkMode ? '1px solid #434343' : '1px solid #b7eb8f'
                    }}>
                      <Text strong style={{ 
                        color: isDarkMode ? '#52c41a' : '#389e0d',
                        fontSize: '14px',
                        display: 'block',
                        marginBottom: '12px'
                      }}>
                        Resumo das Alterações
                      </Text>
                      
                      <Row gutter={16}>
                        <Col span={12}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                              fontSize: '20px', 
                              fontWeight: 'bold',
                              color: '#52c41a',
                              marginBottom: '4px'
                            }}>
                              {getNewEntities().length}
                            </div>
                            <Text type="secondary" style={{ 
                              fontSize: '12px',
                              color: isDarkMode ? '#a0a0a0' : '#666666'
                            }}>
                              Novas Entidades
                            </Text>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                              fontSize: '20px', 
                              fontWeight: 'bold',
                              color: '#fa8c16',
                              marginBottom: '4px'
                            }}>
                              {getModifiedEntities().length}
                            </div>
                            <Text type="secondary" style={{ 
                              fontSize: '12px',
                              color: isDarkMode ? '#a0a0a0' : '#666666'
                            }}>
                              Modificadas
                            </Text>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    {/* Lista de Comandos */}
                    <div style={{
                      padding: '16px',
                      borderRadius: '8px',
                      background: isDarkMode ? '#262626' : '#fafafa',
                      border: isDarkMode ? '1px solid #434343' : '1px solid #f0f0f0'
                    }}>
                      <Text strong style={{ 
                        color: isDarkMode ? '#ffffff' : '#1f1f1f',
                        fontSize: '14px',
                        display: 'block',
                        marginBottom: '12px'
                      }}>
                        Comandos a serem executados
                      </Text>
                      
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        {getNewEntities().map((entity, index) => (
                          <div key={`new-${index}`} style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            background: isDarkMode ? '#1f1f1f' : '#ffffff',
                            border: isDarkMode ? '1px solid #434343' : '1px solid #e6f7ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <div>
                              <Tag color="green">CRIAR</Tag>
                              <Text style={{ 
                                color: isDarkMode ? '#d9d9d9' : '#595959',
                                fontSize: '13px'
                              }}>
                                Entidade {entity.name}
                              </Text>
                            </div>
                            <Popover
                              title={
                                <Text style={{ 
                                  color: isDarkMode ? '#ffffff' : '#1f1f1f'
                                }}>
                                  Detalhes: {entity.name}
                                </Text>
                              }
                              content={
                                <div style={{
                                  backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff'
                                }}>
                                  <Space direction="vertical" size="small">
                                    <Text style={{ 
                                      color: isDarkMode ? '#d9d9d9' : '#595959',
                                      fontSize: '12px'
                                    }}>
                                      Propriedades: {entity.properties?.length || 0}
                                    </Text>
                                    {entity.properties?.slice(0, 3).map((prop, propIndex) => (
                                      <Text key={propIndex} style={{ 
                                        color: isDarkMode ? '#a0a0a0' : '#8c8c8c',
                                        fontSize: '11px',
                                        display: 'block'
                                      }}>
                                        • {prop.name}: {prop.type}
                                      </Text>
                                    ))}
                                    {entity.properties && entity.properties.length > 3 && (
                                      <Text style={{ 
                                        color: isDarkMode ? '#8c8c8c' : '#bfbfbf',
                                        fontSize: '11px'
                                      }}>
                                        ... e mais {entity.properties.length - 3}
                                      </Text>
                                    )}
                                  </Space>
                                </div>
                              }
                              overlayStyle={{
                                backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff'
                              }}
                            >
                              <Button 
                                size="small" 
                                type="text"
                                style={{
                                  color: isDarkMode ? '#1890ff' : '#1890ff',
                                  fontSize: '11px',
                                  padding: '0 4px'
                                }}
                              >
                                Detalhes
                              </Button>
                            </Popover>
                          </div>
                        ))}
                        
                        {getModifiedEntities().map((entity, index) => (
                          <div key={`mod-${index}`} style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            background: isDarkMode ? '#1f1f1f' : '#ffffff',
                            border: isDarkMode ? '1px solid #434343' : '1px solid #fff7e6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <div>
                              <Tag color="orange">MODIFICAR</Tag>
                              <Text style={{ 
                                color: isDarkMode ? '#d9d9d9' : '#595959',
                                fontSize: '13px'
                              }}>
                                Entidade {entity.name}
                              </Text>
                            </div>
                            <Popover
                              title={
                                <Text style={{ 
                                  color: isDarkMode ? '#ffffff' : '#1f1f1f'
                                }}>
                                  Alterações: {entity.name}
                                </Text>
                              }
                              content={
                                <div style={{
                                  backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff'
                                }}>
                                  <Space direction="vertical" size="small">
                                    {getEntityChangeDetails(entity).slice(0, 4).map((change, changeIndex) => (
                                      <div key={changeIndex}>
                                        <Tag 
                                          color={
                                            change.type === 'added' ? 'green' :
                                            change.type === 'modified' ? 'orange' : 'red'
                                          }
                                        >
                                          {change.type === 'added' ? '+' :
                                           change.type === 'modified' ? '~' : '-'}
                                        </Tag>
                                        <Text style={{ 
                                          color: isDarkMode ? '#d9d9d9' : '#595959',
                                          fontSize: '11px'
                                        }}>
                                          {change.property}: {change.detail}
                                        </Text>
                                      </div>
                                    ))}
                                    {getEntityChangeDetails(entity).length > 4 && (
                                      <Text style={{ 
                                        color: isDarkMode ? '#8c8c8c' : '#bfbfbf',
                                        fontSize: '11px'
                                      }}>
                                        ... e mais {getEntityChangeDetails(entity).length - 4} alterações
                                      </Text>
                                    )}
                                  </Space>
                                </div>
                              }
                              overlayStyle={{
                                backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff'
                              }}
                            >
                              <Button 
                                size="small" 
                                type="text"
                                style={{
                                  color: isDarkMode ? '#1890ff' : '#1890ff',
                                  fontSize: '11px',
                                  padding: '0 4px'
                                }}
                              >
                                Detalhes
                              </Button>
                            </Popover>
                          </div>
                        ))}
                      </Space>
                    </div>

                    {/* Progress Bar quando executando */}
                    {isExecutingCommands && (
                      <div style={{
                        padding: '16px',
                        borderRadius: '8px',
                        background: isDarkMode ? '#262626' : '#f0f9ff',
                        border: isDarkMode ? '1px solid #434343' : '1px solid #91d5ff'
                      }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <Text strong style={{ 
                              color: isDarkMode ? '#1890ff' : '#1890ff',
                              fontSize: '14px'
                            }}>
                              Executando comandos...
                            </Text>
                            <SyncOutlined spin style={{ color: '#1890ff' }} />
                          </div>
                          <Progress 
                            percent={75} 
                            size="small" 
                            status="active"
                            strokeColor="#1890ff"
                            trailColor={isDarkMode ? '#434343' : '#f0f0f0'}
                          />
                        </Space>
                      </div>
                    )}

                    {/* Botão de Ação */}
                    <div style={{ 
                      textAlign: 'center', 
                      paddingTop: '8px'
                    }}>
                      <Button 
                        type="primary"
                        size="large"
                        onClick={handleUpdateProject}
                        loading={isExecutingCommands}
                        disabled={isExecutingCommands}
                        style={{ 
                          height: '48px',
                          fontSize: '16px',
                          fontWeight: '600',
                          borderRadius: '8px',
                          minWidth: '200px',
                          background: isExecutingCommands 
                            ? (isDarkMode ? '#434343' : '#d9d9d9')
                            : 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                          border: 'none',
                          boxShadow: isExecutingCommands 
                            ? 'none' 
                            : '0 4px 12px rgba(82, 196, 26, 0.3)'
                        }}
                      >
                        {isExecutingCommands ? (
                          <Space>
                            <SyncOutlined spin />
                            Atualizando Projeto
                          </Space>
                        ) : (
                          <Space>
                            <CheckCircleOutlined />
                            Executar Atualização
                          </Space>
                        )}
                      </Button>
                    </div>
                  </Space>
                )
              }]}
            />
          </Card>
        )}
      </Space>
    </div>
  );
};

export default EntityScanner;
