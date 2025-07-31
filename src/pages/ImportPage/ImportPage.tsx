import React, { useState } from 'react';
import { Space, Card, Typography, Input, Button, Alert } from 'antd';

const { Text } = Typography;
import { Entity } from '../../models/Entity';
import { useAppContext } from '../../contexts/AppContext';
import { useFileManagement } from '../../hooks/useFileManagement';
import { FileOperationService } from '../../services/FileOperationService';
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
    field: keyof import('../../models/Property').Property,
    value: string
  ) => {
    const updated = [...importedEntities];
    updated[entityIndex].properties[propertyIndex][field] = value;
    setImportedEntities(updated);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Card title="📊 Importar do DBDiagram" size="small">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>Primeiro, selecione o diretório onde deseja criar o projeto:</Text>
          <Space>
            <Input 
              placeholder="Diretório selecionado aparecerá aqui" 
              value={state.directoryPath} 
              readOnly 
              style={{ width: '300px' }}
            />
            <Button onClick={handleDBDiagramImport}>Selecionar Diretório</Button>
          </Space>
          
          {state.directoryPath && (
            <>
              <Text>Agora, faça upload do arquivo DBDiagram:</Text>
              <DBDiagramUpload 
                onEntitiesLoaded={(loadedEntities, fileName) => {
                  handleDBDiagramEntitiesLoaded(loadedEntities, fileName || 'dbdiagram');
                }}
                title="📊 Carregar Arquivo DBDiagram"
                description="Faça upload de um arquivo .dbml para carregar entidades automaticamente"
                onEntityComparison={(newEntities, existingEntities) => {
                  onEntityComparison(existingEntities, newEntities);
                  return true;
                }}
                existingEntities={entities}
              />
            </>
          )}
          
          {importedEntities.length > 0 && (
            <Card title={`⚙️ Entidades Importadas - ${dbDiagramFileName}`} size="small" style={{ marginTop: '16px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                  message={`${importedEntities.length} entidades foram importadas com sucesso!`}
                  description="Revise as entidades abaixo e clique em 'Criar Projeto' para gerar o projeto completo."
                  type="success"
                  showIcon
                  style={{ marginBottom: '16px' }}
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
                
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={handleCreateProjectFromDBDiagram}
                    disabled={!state.directoryPath || importedEntities.length === 0}
                    style={{ minWidth: '200px' }}
                  >
                    🚀 Criar Projeto Completo
                  </Button>
                </div>
              </Space>
            </Card>
          )}
        </Space>
      </Card>
    </Space>
  );
};

export default ImportPage;
