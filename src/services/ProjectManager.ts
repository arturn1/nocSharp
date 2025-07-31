import { Entity } from '../models/Entity';
import { scanExistingEntities } from './EntityScanService';
import { CommandFactory } from './CommandFactory';

export interface ProjectContext {
  projectName: string;
  directoryPath: string;
  isExistingProject: boolean;
  executeCommands: boolean;
}

export interface CommandExecutionResult {
  success: boolean;
  error?: string;
  commandsExecuted: number;
}

/**
 * Service responsável por gerenciar operações de projeto
 * Implementa o princípio de Responsabilidade Única (SRP)
 */
export class ProjectManager {
  
  /**
   * Executa comandos no contexto do projeto
   */
  static async executeCommands(
    commands: string[], 
    projectContext: ProjectContext
  ): Promise<CommandExecutionResult> {
    if (!projectContext.executeCommands || !projectContext.directoryPath) {
      return { success: false, error: 'Invalid project context', commandsExecuted: 0 };
    }

    try {
      let commandsExecuted = 0;
      
      for (const command of commands) {
        const fullCommand = `cd "${projectContext.directoryPath}" && ${command}`;
        await window.electron.executeCommand(fullCommand);
        commandsExecuted++;
      }
      
      return { success: true, commandsExecuted };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage, commandsExecuted: 0 };
    }
  }

  /**
   * Atualiza entidades modificadas no projeto
   */
  static async updateModifiedEntities(
    currentEntities: Entity[],
    originalEntities: Entity[],
    projectContext: ProjectContext
  ): Promise<CommandExecutionResult> {
    // Filtrar entidades que não são BaseEntity
    const nonBaseEntities = currentEntities.filter(entity => entity.name !== 'BaseEntity');
    
    // Detectar entidades modificadas
    const modifiedEntities: Entity[] = [];
    
    nonBaseEntities.forEach(currentEntity => {
      const originalEntity = originalEntities.find(orig => orig.name === currentEntity.name);
      if (!originalEntity) {
        // Nova entidade
        modifiedEntities.push(currentEntity);
      } else if (JSON.stringify(currentEntity) !== JSON.stringify(originalEntity)) {
        // Entidade modificada
        modifiedEntities.push(currentEntity);
      }
    });

    if (modifiedEntities.length === 0) {
      return { success: true, commandsExecuted: 0 };
    }

    // Gerar comandos apenas para entidades modificadas
    const commands = CommandFactory.generateCommands(modifiedEntities, {
      isExistingProject: projectContext.isExistingProject,
      overwriteChoices: {},
    });

    return await this.executeCommands(commands, projectContext);
  }

  /**
   * Carrega entidades do projeto a partir do caminho
   */
  static async loadProjectEntities(projectPath: string): Promise<{
    success: boolean;
    entities: Entity[];
    errors: string[];
  }> {
    try {
      const scanResult = await scanExistingEntities(projectPath);
      return scanResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        entities: [],
        errors: [errorMessage]
      };
    }
  }

  /**
   * Merge entidades novas com existentes
   */
  static mergeEntities(
    existingEntities: Entity[],
    newEntities: Entity[]
  ): Entity[] {
    const mergedEntities = [...existingEntities];
    
    newEntities.forEach(newEntity => {
      const existingIndex = mergedEntities.findIndex(existing => existing.name === newEntity.name);
      if (existingIndex === -1) {
        // Entidade nova, adicionar
        mergedEntities.push(newEntity);
      }
      // Entidade existente, manter a versão atual (não sobrescrever)
    });
    
    return mergedEntities;
  }
}
