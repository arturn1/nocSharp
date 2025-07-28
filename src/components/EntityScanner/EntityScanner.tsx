import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Spin, Alert, Statistic, Row, Col } from 'antd';
import { SearchOutlined, FolderOpenOutlined, DatabaseOutlined } from '@ant-design/icons';
import { Entity } from '../../models/Entity';
import { scanExistingEntities, getProjectMetadata } from '../../services/EntityScanService';
import DBDiagramUpload from '../DBDiagramUpload';

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
  onShowEntitiesComparison
}) => {
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [scannedEntities, setScannedEntities] = useState<Entity[]>([]);
  const [showProjectEntities, setShowProjectEntities] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

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
        <Button 
          icon={<FolderOpenOutlined />}
          onClick={handleScanDirectory}
          loading={isScanning}
          size="small"
        >
          Scan Project
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {isScanning && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">Scanning project directory...</Text>
            </div>
          </div>
        )}

        {projectInfo && (
          <Alert
            type={projectInfo.isValid ? 'success' : 'warning'}
            message={`Project: ${projectInfo.projectName}`}
            description={
              projectInfo.isValid 
                ? `Found ${projectInfo.entityCount} entities in ${projectInfo.path}`
                : 'Project structure may not be valid for nocsharp'
            }
            showIcon
          />
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

        {/* Project Statistics */}
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
                  value={scannedEntities.length}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="New Entities"
                  value={existingEntities.length - scannedEntities.length}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Total Entities"
                  value={existingEntities.length}
                  valueStyle={{ color: '#52c41a' }}
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

        {/* Import Options */}
        {projectInfo && projectInfo.isValid && (
          <Card title="📥 Import Additional Entities" size="small" style={{ marginBottom: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">
                Use the Entity Management section or import from DBDiagram to add new entities to this project.
              </Text>
              
              <DBDiagramUpload 
                onEntitiesLoaded={handleDBDiagramEntitiesLoaded}
                title="Import from DBDiagram"
                description="Upload a .dbml or .txt file to import entities"
                onEntityComparison={onEntityComparison}
                existingEntities={existingEntities}
              />
            </Space>
          </Card>
        )}

        {/* Update Project Button */}
        {projectInfo && projectInfo.isValid && existingEntities.length > scannedEntities.length && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Alert
              message={`${existingEntities.length - scannedEntities.length} new entities ready to be added to the project`}
              type="info"
              style={{ marginBottom: '12px' }}
            />
            <Button 
              type="primary" 
              size="large"
              onClick={handleUpdateProject}
              style={{ minWidth: '200px' }}
              icon={<DatabaseOutlined />}
            >
              🔄 Update Project
            </Button>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default EntityScanner;
