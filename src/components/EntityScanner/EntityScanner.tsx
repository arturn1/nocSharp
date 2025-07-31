import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Spin, Alert, Statistic, Row, Col } from 'antd';
import { SearchOutlined, FolderOpenOutlined, DatabaseOutlined, SettingOutlined } from '@ant-design/icons';
import { Entity } from '../../models/Entity';
import { Property } from '../../models/Property';
import { scanExistingEntities, getProjectMetadata } from '../../services/EntityScanService';
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
  isVisible = false
}) => {
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [scannedEntities, setScannedEntities] = useState<Entity[]>([]);
  const [showProjectEntities, setShowProjectEntities] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isAutoLoading, setIsAutoLoading] = useState<boolean>(false);

  // Auto-load project quando a tela estiver visível e houver um caminho
  useEffect(() => {
    const autoLoadProject = async () => {
      if (isVisible && currentProjectPath && isExistingProject && !projectInfo) {
        setIsAutoLoading(true);
        setErrors([]);

        try {
          // Get project metadata first
          const metadata = await getProjectMetadata(currentProjectPath);
          setProjectInfo({
            ...metadata,
            path: currentProjectPath
          });

          // Scan for existing entities
          const scanResult = await scanExistingEntities(currentProjectPath);

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
          setErrors([`Failed to auto-load project: ${error.message}`]);
          setScannedEntities([]);
        } finally {
          setIsAutoLoading(false);
        }
      }
    };

    autoLoadProject();
  }, [isVisible, currentProjectPath, isExistingProject]); // Trigger quando a tela fica visível

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
    // Filtrar entidades existentes (que já estão no projeto escaneado)
    const existingEntitiesInProject = existingEntities.filter(entity => 
      scannedEntities.some(scanned => scanned.name === entity.name)
    );
    
    // Filtrar novas entidades (que não existem no projeto escaneado)
    const newEntitiesForProject = existingEntities.filter(entity => 
      !scannedEntities.some(scanned => scanned.name === entity.name)
    );
    
    // Usar a mesma função que o botão "View Entities Comparison"
    if (onShowEntitiesComparison) {
      onShowEntitiesComparison(existingEntitiesInProject, newEntitiesForProject);
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

  return (
    <Card
      title={
        <Space>
          <SearchOutlined />
          Entity Scanner
        </Space>
      }
      size="small"
      extra={
        projectInfo ? (
          <Button 
            icon={<FolderOpenOutlined />}
            onClick={handleScanDirectory}
            loading={isScanning}
            size="small"
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

        {/* 📊 Project Information */}
        {projectInfo && projectInfo.isValid && (
          <Card title="📊 Project Information" size="small" style={{ marginBottom: '16px' }}>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Statistic
                  title="Project Name"
                  value={projectInfo.projectName}
                  valueStyle={{ color: '#3f8600', fontSize: '14px' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Existing Entities"
                  value={existingEntities.filter(entity => entity.name !== 'BaseEntity').length}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Entidades Modificadas"
                  value={getModifiedEntitiesCount()}
                  valueStyle={{ color: hasEntityChanges ? '#faad14' : '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Status"
                  value={hasEntityChanges ? 'Pendente' : 'Sincronizado'}
                  valueStyle={{ color: hasEntityChanges ? '#faad14' : '#52c41a' }}
                />
              </Col>
            </Row>
            
            {/* Show entities comparison button */}
            {scannedEntities.length > 0 && existingEntities.length > scannedEntities.length && onShowEntitiesComparison && (
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <Button 
                  onClick={() => onShowEntitiesComparison(scannedEntities, existingEntities.filter(entity => 
                    !scannedEntities.some(scanned => scanned.name === entity.name)
                  ))}
                  size="small"
                >
                  📋 View Entities Comparison
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Import from DBDiagram */}
        {projectInfo && projectInfo.isValid && (
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
                    collapsible
                  />
                )}
            </Space>
          </Card>
        )}

        {/* Unified Update Project Section */}
        {projectInfo && projectInfo.isValid && (
          <>
            {/* Exibir informações sobre novas entidades se houver */}
            {existingEntities.length > scannedEntities.length && (
              <Alert
                message={`${existingEntities.length - scannedEntities.length} new entities ready to be added to the project`}
                type="info"
                style={{ marginTop: '16px' }}
              />
            )}
            
            {/* Exibir informações sobre entidades modificadas se houver */}
            {onUpdateModifiedEntities && hasEntityChanges && getModifiedEntitiesCount() > 0 && (
              <Alert
                message={`⚠️ ${getModifiedEntitiesCount()} ${getModifiedEntitiesCount() === 1 ? 'entidade modificada' : 'entidades modificadas'}`}
                description="As entidades modificadas serão incluídas na atualização do projeto"
                type="warning"
                style={{ marginTop: '16px' }}
              />
            )}

            {/* Botão para atualizar projeto */}
            {(existingEntities.length > scannedEntities.length) && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={handleUpdateProject}
                  loading={isExecutingCommands}
                  disabled={isExecutingCommands}
                  style={{ minWidth: '250px' }}
                  icon={<DatabaseOutlined />}
                >
                  {isExecutingCommands 
                    ? '🔄 Atualizando...' 
                    : `🔄 Update Project (${existingEntities.length - scannedEntities.length} novas)`
                  }
                </Button>
              </div>
            )}
          </>
        )}
      </Space>
    </Card>
  );
};

export default EntityScanner;
