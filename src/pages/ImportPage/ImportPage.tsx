import React, { useState } from 'react';
import { Space, Card, Typography, Input, Button, Alert, Row, Col, Divider } from 'antd';
import { DatabaseOutlined, UploadOutlined, FolderOpenOutlined, CodeOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
import { Entity } from '../../models/Entity';
import { Property } from '../../models/Property';
import { useAppContext } from '../../contexts/AppContext';
import { useFileManagement } from '../../hooks/useFileManagement';
import { FileOperationService } from '../../services/FileOperationService';
import { useTheme } from '../../contexts/ThemeContext';
import DBDiagramUpload from '../../components/DBDiagramUpload';
import EntityForm from '../../components/EntityForm';

interface ImportPageProps {
  entities: Entity[];
  onEntityComparison: (existing: Entity[], imported: Entity[]) => void;
  onMergeEntities: (entities: Entity[], replace: boolean) => void;
  onCreateProject: () => Promise<void>;
}

const ImportPage: React.FC<ImportPageProps> = ({
  entities,
  onEntityComparison,
  onMergeEntities,
  onCreateProject
}) => {
  const [importedEntities, setImportedEntities] = useState<Entity[]>([]);
  const [dbDiagramFileName, setDbDiagramFileName] = useState<string>('');
  
  const { state, dispatch } = useAppContext();
  const { openDirectorySelector } = useFileManagement();
  const { isDarkMode } = useTheme();

  // Cores frias e sobrias
  const colors = {
    primary: '#4A90E2',
    secondary: '#5D6D7E',
    accent: '#52648B',
    success: '#2E8B57',
    background: isDarkMode ? '#0F172A' : '#F8FAFC',
    surface: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F1F5F9' : '#1E293B',
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B'
  };

  const handleDBDiagramImport = () => {
    openDirectorySelector(false);
  };

  const handleDBDiagramEntitiesLoaded = (loadedEntities: Entity[], fileName: string) => {
    const importResult = FileOperationService.processDBDiagramImport(
      loadedEntities,
      fileName,
      entities
    );

    setImportedEntities(loadedEntities);
    setDbDiagramFileName(fileName);
    dispatch({ type: 'SET_PROJECT_NAME', payload: importResult.projectName });
    
    if (state.directoryPath && state.isExistingProject) {
      onMergeEntities(loadedEntities, false);
    }
  };

  const handleCreateProjectFromDBDiagram = async () => {
    if (importedEntities.length > 0 && state.directoryPath) {
      onMergeEntities(importedEntities, false);
      await onCreateProject();
      setImportedEntities([]);
      setDbDiagramFileName('');
    }
  };

  const handleUpdateProperty = (
    entityIndex: number,
    propertyIndex: number,
    field: keyof Property,
    value: any
  ) => {
    const updated = [...importedEntities];
    (updated[entityIndex].properties[propertyIndex] as any)[field] = value;
    setImportedEntities(updated);
  };

  return (
    <div style={{
      padding: '24px',
      background: colors.background,
      minHeight: '100vh'
    }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Header */}
        <Card
          className="animate-fade-in-scale shadow-soft"
          style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
              : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            border: isDarkMode ? '1px solid #374151' : '1px solid #cbd5e1',
            borderRadius: '16px'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <Row align="middle" justify="space-between">
            <Col>
              <Space align="center" size="large">
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 24px ${colors.primary}30`
                }}>
                  <DatabaseOutlined style={{ fontSize: '32px', color: 'white' }} />
                </div>
                <div>
                  <Title 
                    level={2} 
                    className="text-gradient"
                    style={{ margin: 0, fontSize: '28px' }}
                  >
                    Importar DBDiagram
                  </Title>
                  <Text style={{ 
                    fontSize: '16px',
                    color: colors.textSecondary,
                    fontWeight: '500'
                  }}>
                    Cole código do dbdiagram.io ou carregue arquivo .dbml
                  </Text>
                </div>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Processo de Importação */}
        <Row gutter={[24, 24]}>
          {/* Passo 1: Selecionar Diretório */}
          <Col xs={24} lg={12}>
            <Card
              className="animate-fade-in-up"
              title={
                <Space>
                  <FolderOpenOutlined style={{ color: colors.primary }} />
                  <Text strong style={{ color: colors.text }}>
                    1. Selecionar Diretório
                  </Text>
                </Space>
              }
              style={{
                borderRadius: '12px',
                backgroundColor: colors.surface,
                borderColor: isDarkMode ? '#374151' : '#e2e8f0',
                height: '100%'
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Text style={{ color: colors.textSecondary }}>
                  Escolha onde deseja criar o projeto nocSharp:
                </Text>
                <Input 
                  placeholder="Nenhum diretório selecionado" 
                  value={state.directoryPath || ''} 
                  readOnly 
                  style={{ 
                    backgroundColor: isDarkMode ? '#374151' : '#f8fafc',
                    borderColor: isDarkMode ? '#4b5563' : '#e2e8f0'
                  }}
                  suffix={
                    state.directoryPath ? (
                      <Text style={{ color: colors.primary, fontSize: '12px' }}>✓</Text>
                    ) : null
                  }
                />
                <Button 
                  type="primary"
                  icon={<FolderOpenOutlined />}
                  onClick={handleDBDiagramImport}
                  block
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                    border: 'none',
                    borderRadius: '8px',
                    height: '40px'
                  }}
                >
                  Selecionar Diretório
                </Button>
              </Space>
            </Card>
          </Col>

          {/* Passo 2: Upload DBDiagram */}
          <Col xs={24} lg={12}>
            <Card
              className="animate-fade-in-up"
              title={
                <Space>
                  <UploadOutlined style={{ color: state.directoryPath ? colors.primary : colors.textSecondary }} />
                  <Text strong style={{ 
                    color: state.directoryPath ? colors.text : colors.textSecondary
                  }}>
                    2. Carregar DBDiagram
                  </Text>
                </Space>
              }
              style={{
                borderRadius: '12px',
                backgroundColor: colors.surface,
                borderColor: isDarkMode ? '#374151' : '#e2e8f0',
                height: '100%',
                opacity: state.directoryPath ? 1 : 0.6
              }}
            >
              {state.directoryPath ? (
                <DBDiagramUpload 
                  onEntitiesLoaded={(loadedEntities, fileName) => {
                    handleDBDiagramEntitiesLoaded(loadedEntities, fileName || 'dbdiagram');
                  }}
                  title=""
                  description="Arraste e solte ou clique para carregar arquivo .dbml"
                  onEntityComparison={(newEntities, existingEntities) => {
                    onEntityComparison(existingEntities, newEntities);
                    return true;
                  }}
                  existingEntities={entities}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Text style={{ color: colors.textSecondary }}>
                    Primeiro, selecione um diretório para continuar
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Entidades Importadas */}
        {importedEntities.length > 0 && (
          <Card
            className="animate-fade-in-up"
            title={
              <Space>
                <CodeOutlined style={{ color: colors.success }} />
                <Text strong style={{ color: colors.text }}>
                  Entidades Importadas - {dbDiagramFileName}
                </Text>
                <Text style={{ 
                  color: colors.textSecondary,
                  fontSize: '14px',
                  fontWeight: 'normal'
                }}>
                  ({importedEntities.length} entidades)
                </Text>
              </Space>
            }
            style={{
              borderRadius: '12px',
              backgroundColor: colors.surface,
              borderColor: isDarkMode ? '#374151' : '#e2e8f0'
            }}
            extra={
              <Button
                type="primary"
                onClick={handleCreateProjectFromDBDiagram}
                disabled={!state.directoryPath || importedEntities.length === 0}
                style={{
                  background: `linear-gradient(135deg, ${colors.success} 0%, #228B22 100%)`,
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                Criar Projeto
              </Button>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="Entidades importadas com sucesso!"
                description={`${importedEntities.length} entidades foram carregadas do arquivo ${dbDiagramFileName}. Revise as propriedades se necessário e clique em "Criar Projeto" para continuar.`}
                type="success"
                showIcon
                style={{
                  backgroundColor: isDarkMode ? '#1a3a3a' : '#f0f9ff',
                  borderColor: colors.success
                }}
              />
              
              <EntityForm
                entities={importedEntities}
                addEntity={(entity) => setImportedEntities([...importedEntities, entity])}
                updateEntityName={(index, name) => {
                  const updated = [...importedEntities];
                  updated[index].name = name;
                  setImportedEntities(updated);
                }}
                updateEntityBaseSkip={(index, baseSkip) => {
                  const updated = [...importedEntities];
                  updated[index].baseSkip = baseSkip;
                  setImportedEntities(updated);
                }}
                addProperty={(entityIndex, property) => {
                  const updated = [...importedEntities];
                  updated[entityIndex].properties.push(property);
                  setImportedEntities(updated);
                }}
                updateProperty={handleUpdateProperty}
                removeProperty={(entityIndex, propertyIndex) => {
                  const updated = [...importedEntities];
                  updated[entityIndex].properties.splice(propertyIndex, 1);
                  setImportedEntities(updated);
                }}
                removeEntity={(index) => {
                  const updated = importedEntities.filter((_, i) => i !== index);
                  setImportedEntities(updated);
                }}
                hideAddButton={false}
                collapsible={true}
              />
            </Space>
          </Card>
        )}
      </Space>
    </div>
  );
};

export default ImportPage;
