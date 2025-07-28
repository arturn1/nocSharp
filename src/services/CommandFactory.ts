import { Entity } from '../models/Entity';
import { ProjectData } from '../models/ProjectData';
import { joinPaths } from '../utils/pathUtils';

interface CommandFactoryOptions {
  isExistingProject: boolean;
  overwriteChoices: Record<string, boolean>;
}

export interface ProjectCreationCommands {
  projectCommand?: string;
  entityCommands: string[];
  allCommands: string[];
}

export class CommandFactory {
  static generateCommands(entities: Entity[], options: CommandFactoryOptions): string[] {
    const { isExistingProject, overwriteChoices } = options;

    // Filtrar entidades com base no estado do projeto
    const filteredEntities = isExistingProject
      ? entities.filter(entity => overwriteChoices[entity.name] !== false)
      : entities;

    // Gerar comandos para cada entidade
    return filteredEntities.map(entity => {
      const fieldsStr = entity.properties
        .map(prop => {
          let typeStr = prop.type;
          if (prop.collectionType && prop.collectionType !== 'none' && prop.collectionType.trim() !== '') {
            typeStr = `${prop.collectionType}<${prop.type}>`;
          }
          
          const fieldDefinition = `${prop.name}:${typeStr}`;
          
          // Verificar se o tipo contém caracteres especiais (< e >) para adicionar aspas
          const hasComplexType = typeStr.includes('<') && typeStr.includes('>');
          
          const result = hasComplexType ? `"${fieldDefinition}"` : fieldDefinition;
          
          return result;
        })
        .join(' ');

      const baseSkipParam = entity.baseSkip ? ' --baseSkip' : '';
      return `nocsharp s "${entity.name}" ${fieldsStr}${baseSkipParam}`;
    });
  }

  static generateProjectCommands(
    projectData: ProjectData,
    directoryPath: string,
    isExistingProject: boolean,
    overwriteChoices: Record<string, boolean> = {}
  ): ProjectCreationCommands {
    const { projectName, entities } = projectData;
    const commands: string[] = [];
    let projectCommand: string | undefined;

    // Comando para criar projeto (apenas se não for existente)
    if (!isExistingProject && projectName) {
      projectCommand = `cd "${directoryPath}" && nocsharp new "${projectName}"`;
      commands.push(projectCommand);
    }

    // Comandos para criar entidades
    const entityCommands = CommandFactory.generateCommands(entities, {
      isExistingProject,
      overwriteChoices,
    });

    // Adicionar prefixo de diretório para comandos de entidades
    const projectPath = isExistingProject ? directoryPath : joinPaths(directoryPath, projectName);
    const prefixedEntityCommands = entityCommands.map(command => 
      command.startsWith('nocsharp s') ? `cd "${projectPath}" && ${command}` : command
    );

    commands.push(...prefixedEntityCommands);

    return {
      projectCommand,
      entityCommands: prefixedEntityCommands,
      allCommands: commands,
    };
  }

  static generateScript(entities: Entity[], projectName: string, isExistingProject = false): string {
    const commands: string[] = [];
    
    if (!isExistingProject) {
      commands.push(`nocsharp new "${projectName}"`);
      commands.push(`cd "${projectName}"`);
    }
    
    const entityCommands = CommandFactory.generateCommands(entities, {
      isExistingProject,
      overwriteChoices: {},
    });
    
    commands.push(...entityCommands);
    
    return commands.join('\n');
  }
}
