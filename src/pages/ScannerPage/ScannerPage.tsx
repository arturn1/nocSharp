import React from 'react';
import { Space } from 'antd';
import { Entity } from '../../models/Entity';
import { Property } from '../../models/Property';
import EntityScanner from '../../components/EntityScanner';

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
  onUpdateModifiedEntities
}) => {
  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <EntityScanner 
        onEntitiesLoaded={onLoadScannedEntities}
        onDirectorySelected={onDirectorySelected}
        onUpdateProject={onUpdateProject}
        onLoadProject={onLoadProject}
        onEntityComparison={(newEntities, existingEntities) => {
          onEntityComparison(existingEntities, newEntities);
          return true;
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
      />
    </Space>
  );
};

export default ScannerPage;
