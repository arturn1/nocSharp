import { Entity } from '../models/Entity';
import { CommandFactory } from './CommandFactory';
import { ProjectManager, ProjectContext } from './ProjectManager';

export interface CleanOptions {
  force?: boolean;
  listOnly?: boolean;
}

export interface CleanResult {
  success: boolean;
  commands: string[];
  affectedFiles?: string[];
  error?: string;
}

/**
 * Service para gerenciar limpeza e remoção de entidades
 */
export class EntityCleanService {
  
  /**
   * Remove entidades específicas do projeto
   */
  static async cleanEntities(
    entityNames: string[], 
    projectContext: ProjectContext,
    options: CleanOptions = {}
  ): Promise<CleanResult> {
    try {
      let commands: string[];
      
      if (options.listOnly) {
        commands = CommandFactory.generateCleanListCommands(entityNames);
      } else {
        commands = CommandFactory.generateCleanCommands(entityNames, { 
          force: options.force 
        });
      }

      // Adicionar o contexto do diretório aos comandos
      const contextualCommands = commands.map(command => 
        `cd "${projectContext.directoryPath}" && ${command}`
      );

      if (options.listOnly) {
        // Para listagem, apenas retornar os comandos sem executar
        return {
          success: true,
          commands: contextualCommands,
          affectedFiles: [] // Poderia ser implementado para mostrar preview
        };
      }

      // Executar os comandos de limpeza
      const result = await ProjectManager.executeCommands(contextualCommands, projectContext);
      
      return {
        success: result.success,
        commands: contextualCommands,
        error: result.error
      };

    } catch (error) {
      return {
        success: false,
        commands: [],
        error: error instanceof Error ? error.message : 'Unknown error during cleanup'
      };
    }
  }

  /**
   * Remove todas as entidades do projeto
   */
  static async cleanAllEntities(
    projectContext: ProjectContext,
    options: CleanOptions = {}
  ): Promise<CleanResult> {
    try {
      const command = CommandFactory.generateCleanAllCommand({ 
        force: options.force 
      });

      const contextualCommand = `cd "${projectContext.directoryPath}" && ${command}`;

      if (options.listOnly) {
        return {
          success: true,
          commands: [contextualCommand],
          affectedFiles: []
        };
      }

      const result = await ProjectManager.executeCommands([contextualCommand], projectContext);
      
      return {
        success: result.success,
        commands: [contextualCommand],
        error: result.error
      };

    } catch (error) {
      return {
        success: false,
        commands: [],
        error: error instanceof Error ? error.message : 'Unknown error during cleanup'
      };
    }
  }

  /**
   * Valida se as entidades podem ser removidas
   */
  static validateEntitiesForClean(
    entities: Entity[], 
    entitiesToClean: string[]
  ): { canClean: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    // Verificar dependências entre entidades
    entities.forEach(entity => {
      if (!entitiesToClean.includes(entity.name)) {
        entity.properties.forEach(prop => {
          if (entitiesToClean.includes(prop.type)) {
            warnings.push(
              `A entidade "${entity.name}" possui uma propriedade "${prop.name}" do tipo "${prop.type}" que será removida`
            );
          }
        });
      }
    });

    return {
      canClean: true, // Sempre permitir, mas mostrar warnings
      warnings
    };
  }
}
