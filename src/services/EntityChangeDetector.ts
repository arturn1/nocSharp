import { Entity } from '../models/Entity';

export interface EntityChangeDetection {
  hasChanges: boolean;
  modifiedCount: number;
  addedEntities: Entity[];
  modifiedEntities: Entity[];
  removedEntities: Entity[];
}

/**
 * Service responsável por detectar mudanças em entidades
 * Implementa o princípio de Responsabilidade Única (SRP)
 */
export class EntityChangeDetector {
  
  /**
   * Detecta mudanças entre entidades atuais e originais
   */
  static detectChanges(
    currentEntities: Entity[],
    originalEntities: Entity[]
  ): EntityChangeDetection {
    const nonBaseCurrentEntities = currentEntities.filter(entity => entity.name !== 'BaseEntity');
    const nonBaseOriginalEntities = originalEntities.filter(entity => entity.name !== 'BaseEntity');
    
    const addedEntities: Entity[] = [];
    const modifiedEntities: Entity[] = [];
    const removedEntities: Entity[] = [];
    
    // Detectar entidades adicionadas e modificadas
    nonBaseCurrentEntities.forEach(currentEntity => {
      const originalEntity = nonBaseOriginalEntities.find(orig => orig.name === currentEntity.name);
      if (!originalEntity) {
        // Nova entidade
        addedEntities.push(currentEntity);
      } else if (JSON.stringify(currentEntity) !== JSON.stringify(originalEntity)) {
        // Entidade modificada
        modifiedEntities.push(currentEntity);
      }
    });
    
    // Detectar entidades removidas
    nonBaseOriginalEntities.forEach(originalEntity => {
      const currentEntity = nonBaseCurrentEntities.find(curr => curr.name === originalEntity.name);
      if (!currentEntity) {
        removedEntities.push(originalEntity);
      }
    });
    
    const modifiedCount = addedEntities.length + modifiedEntities.length + removedEntities.length;
    const hasChanges = modifiedCount > 0;
    
    return {
      hasChanges,
      modifiedCount,
      addedEntities,
      modifiedEntities,
      removedEntities
    };
  }

  /**
   * Compara duas listas de entidades para detectar diferenças
   */
  static compareEntityLists(
    list1: Entity[],
    list2: Entity[]
  ): boolean {
    if (list1.length !== list2.length) {
      return false;
    }
    
    return JSON.stringify(list1) === JSON.stringify(list2);
  }

  /**
   * Filtra entidades excluindo BaseEntity
   */
  static filterNonBaseEntities(entities: Entity[]): Entity[] {
    return entities.filter(entity => entity.name !== 'BaseEntity');
  }

  /**
   * Calcula estatísticas das entidades
   */
  static calculateEntityStats(entities: Entity[]): {
    totalEntities: number;
    totalProperties: number;
    averagePropertiesPerEntity: number;
  } {
    const filteredEntities = this.filterNonBaseEntities(entities);
    const totalEntities = filteredEntities.length;
    const totalProperties = filteredEntities.reduce((sum, entity) => sum + entity.properties.length, 0);
    const averagePropertiesPerEntity = totalEntities > 0 ? Math.round(totalProperties / totalEntities * 10) / 10 : 0;
    
    return {
      totalEntities,
      totalProperties,
      averagePropertiesPerEntity
    };
  }
}
