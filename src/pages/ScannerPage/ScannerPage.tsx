import React from 'react';
import { Space, Card, Row, Col, Typography, Divider } from 'antd';
import { SearchOutlined, FileSearchOutlined, DatabaseOutlined } from '@ant-design/icons';
import { Entity } from '../../models/Entity';
import { Property } from '../../models/Property';
import EntityScanner from '../../components/EntityScanner';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Text } = Typography;

interface ScannerPageProps {
  entities: Entity[];
  originalEntities: Entity[];
  hasEntityChanges: boolean;
  isExecutingCommands: boolean;
  currentProjectPath?: string;
  isExistingProject: boolean;
  
  // Entity management handlers
  onLoadScannedEntities: (entities: Entity[]) => void;
  onDirectorySelected: (path: string) => void;
  onUpdateProject: (entities: Entity[]) => Promise<void>;
  onLoadProject: (entities: Entity[], projectName: string) => void;
  onEntityComparison: (existing: Entity[], imported: Entity[]) => void;
  onMergeEntities: (entities: Entity[], replace: boolean) => void;
  onShowEntitiesComparison: (existing: Entity[], newEntities: Entity[]) => void;
  
  // Entity CRUD operations
  addEntity: (entity: Entity) => void;
  updateEntityName: (index: number, name: string) => void;
  updateEntityBaseSkip: (index: number, baseSkip: boolean) => void;
  addProperty: (entityIndex: number, property: Property) => void;
  updateProperty: (entityIndex: number, propertyIndex: number, field: keyof Property, value: string) => void;
  removeProperty: (entityIndex: number, propertyIndex: number) => void;
  removeEntity: (index: number) => void;
  onUpdateModifiedEntities: () => Promise<void>;
  refreshTrigger?: number; // Para forçar reload do EntityScanner
}

const ScannerPage: React.FC<ScannerPageProps> = ({
  entities,
  originalEntities,
  hasEntityChanges,
  isExecutingCommands,
  currentProjectPath,
  isExistingProject,
  onLoadScannedEntities,
  onDirectorySelected,
  onUpdateProject,
  onLoadProject,
  onEntityComparison,
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
  refreshTrigger
}) => {
  const { isDarkMode } = useTheme();
  
  const colors = {
    background: isDarkMode 
      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    surface: isDarkMode ? '#1e293b' : '#ffffff',
    primary: '#4A90E2',
    secondary: '#5D6D7E',
    accent: '#52648B',
    text: isDarkMode ? '#f1f5f9' : '#1e293b',
    textSecondary: isDarkMode ? '#94a3b8' : '#64748b'
  };

  return (
    <div style={{
      padding: '24px',
      background: colors.background,
      minHeight: '100vh'
    }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Entity Scanner Component */}
        <Card
          className="animate-fade-in-up"
          style={{
            borderRadius: '12px',
            backgroundColor: colors.surface,
            borderColor: isDarkMode ? '#374151' : '#e2e8f0',
            animationDelay: '0.3s'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <EntityScanner 
            onEntitiesLoaded={onLoadScannedEntities}
            onDirectorySelected={onDirectorySelected}
            onUpdateProject={onUpdateProject}
            onLoadProject={onLoadProject}
            onEntityComparison={(newEntities, existingEntities) => {
              // Chama a função de comparação do parent e sempre retorna false para não bloquear
              // pois a função original não retorna boolean
              onEntityComparison(newEntities, existingEntities);
              return false; // Não bloquear a importação aqui, deixar a lógica do parent decidir
            }}
            existingEntities={entities}
            onMergeEntities={(newEntities) => onMergeEntities(newEntities, false)}
            onShowEntitiesComparison={(existingEntities, newEntities) => onShowEntitiesComparison(existingEntities, newEntities)}
            addEntity={addEntity}
            updateEntityName={updateEntityName}
            updateEntityBaseSkip={updateEntityBaseSkip}
            addProperty={addProperty}
            updateProperty={updateProperty}
            removeProperty={removeProperty}
            removeEntity={removeEntity}
            onUpdateModifiedEntities={onUpdateModifiedEntities}
            isExecutingCommands={isExecutingCommands}
            hasEntityChanges={hasEntityChanges}
            originalEntities={originalEntities}
            currentProjectPath={currentProjectPath}
            isExistingProject={isExistingProject}
            isVisible={true}
            refreshTrigger={refreshTrigger}
          />
        </Card>
      </Space>
    </div>
  );
};

export default ScannerPage;
