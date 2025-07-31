import { Entity } from '../models/Entity';
import { ProjectManager } from '../services/ProjectManager';
import { EntityChangeDetector } from '../services/EntityChangeDetector';

export class HomePageService {
  
  static handleLoadScannedEntities(
    entities: Entity[], 
    scannedEntities: Entity[], 
    originalEntities: Entity[], 
    mergeEntities: (entities: Entity[], replace: boolean) => void,
    setOriginalEntities: (entities: Entity[]) => void
  ) {
    // Se não há entidades atuais ou se é um recarregamento completo, 
    // substituir todas as entidades
    if (entities.length === 0 || scannedEntities.length !== entities.length) {
      mergeEntities(scannedEntities, true); // true = replace all
      setOriginalEntities(JSON.parse(JSON.stringify(scannedEntities)));
      return;
    }
    
    // Caso contrário, fazer merge inteligente
    const mergedEntities = ProjectManager.mergeEntities(entities, scannedEntities);
    
    if (!EntityChangeDetector.compareEntityLists(entities, mergedEntities)) {
      const newEntities = scannedEntities.filter(e => !entities.some(existing => existing.name === e.name));
      if (newEntities.length > 0) {
        mergeEntities(newEntities, false);
        if (originalEntities.length === 0) {
          setOriginalEntities(JSON.parse(JSON.stringify(mergedEntities)));
        }
      }
    }
  }

  static handleUpdateProjectFromScanner(
    newEntities: Entity[],
    state: any,
    entities: Entity[],
    handleShowScannerModal: (existing: Entity[], newEntities: Entity[]) => void,
    mergeEntities: (entities: Entity[], replace: boolean) => void,
    handleCreateProject: () => Promise<void>
  ) {
    if (newEntities.length > 0) {
      if (state.isExistingProject && entities.length > 0) {
        const scannedEntities = entities.filter(entity => 
          newEntities.some(newEntity => newEntity.name === entity.name)
        );
        
        const reallyNewEntities = newEntities.filter(entity => 
          !entities.some(existing => existing.name === entity.name)
        );
        
        handleShowScannerModal(scannedEntities, reallyNewEntities);
        return;
      }

      mergeEntities(newEntities, false);
      return handleCreateProject();
    }
  }

  static handleLoadProjectFromScanner(
    scannedEntities: Entity[], 
    projectName: string,
    dispatch: any,
    setOriginalEntities: (entities: Entity[]) => void,
    setHasEntityChanges: (changes: boolean) => void
  ) {
    dispatch({ type: 'SET_ENTITIES', payload: scannedEntities });
    dispatch({ type: 'SET_PROJECT_NAME', payload: projectName });
    dispatch({ type: 'SET_IS_EXISTING_PROJECT', payload: true });
    setOriginalEntities(JSON.parse(JSON.stringify(scannedEntities)));
    setHasEntityChanges(false);
  }
}
