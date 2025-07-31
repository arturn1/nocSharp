import { Entity } from '../models/Entity';

export interface ModalData {
  isVisible: boolean;
  title: string;
  data?: any;
}

export interface EntityComparisonModalData {
  existing: Entity[];
  new: Entity[];
}

export interface ScannerModalData {
  existingEntities: Entity[];
  newEntities: Entity[];
  commands: string[];
  projectName: string;
  projectPath: string;
}

/**
 * Service responsável por gerenciar estados de modais e UI
 * Implementa o princípio de Responsabilidade Única (SRP)
 */
export class UIStateManager {
  
  /**
   * Cria dados para modal de comparação de entidades
   */
  static createEntityComparisonModal(
    existingEntities: Entity[],
    newEntities: Entity[]
  ): EntityComparisonModalData {
    return {
      existing: existingEntities,
      new: newEntities
    };
  }

  /**
   * Cria dados para modal do scanner
   */
  static createScannerModal(
    existingEntities: Entity[],
    newEntities: Entity[],
    commands: string[],
    projectName: string,
    projectPath: string
  ): ScannerModalData {
    return {
      existingEntities,
      newEntities,
      commands,
      projectName,
      projectPath
    };
  }
}
