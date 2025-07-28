import { ProjectData } from '../models/ProjectData';
import { joinPaths } from '../utils/pathUtils';
import { Entity } from '../models/Entity';
import { CommandFactory } from './CommandFactory';

export interface ProjectCreationResult {
  success: boolean;
  logs: string[];
  errors: string[];
  generatedCommands?: string[];
}

// Execute command with timeout
const executeCommandWithTimeout = async (command: string, timeoutMs: number = 5000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Command timed out after ${timeoutMs / 1000} seconds: ${command}`));
    }, timeoutMs);

    window.electron.executeCommand(command)
      .then(() => {
        clearTimeout(timeoutId);
        resolve();
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
};

export const createProject = async (
  projectData: ProjectData,
  directoryPath: string,
  executeCommands: boolean,
  isExistingProject: boolean,
  overwriteChoices: Record<string, boolean> = {}
): Promise<ProjectCreationResult> => {
  const { projectName, entities } = projectData;
  const logs: string[] = [];
  const errors: string[] = [];

  // Validation
  if (!projectName && !isExistingProject) {
    errors.push('Project name is required for new projects');
    return { success: false, logs, errors };
  }

  if (entities.length === 0) {
    errors.push('At least one entity is required');
    return { success: false, logs, errors };
  }

  // Validate entities
  for (const entity of entities) {
    if (!entity.name.trim()) {
      errors.push('All entities must have a name');
      return { success: false, logs, errors };
    }

    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(entity.name)) {
      errors.push(`Entity name '${entity.name}' is invalid. Must start with a letter and contain only letters and numbers.`);
      return { success: false, logs, errors };
    }
  }

  try {
    // Use CommandFactory to generate all commands
    const commandData = CommandFactory.generateProjectCommands(
      projectData,
      directoryPath,
      isExistingProject,
      overwriteChoices
    );

    // Log all commands that will be executed
    logs.push('Generated commands:');
    commandData.allCommands.forEach((command, index) => {
      logs.push(`${index + 1}. ${command}`);
    });

    // Execute commands if required
    if (executeCommands) {
      for (const command of commandData.allCommands) {
        logs.push(`Executing: ${command}`);
        
        try {
          await executeCommandWithTimeout(command);
          logs.push(`✓ Command executed successfully`);
        } catch (error) {
          const errorMsg = error.message.includes('timed out') 
            ? `Command timed out. Please check if nocsharp CLI is installed and accessible: ${error.message}`
            : `Failed to execute command: ${error.message}`;
          errors.push(errorMsg);
          // Continue with other commands instead of stopping completely
          continue;
        }
      }
    } else {
      logs.push('Commands generated but not executed (dry run mode)');
    }

    return { 
      success: true, 
      logs, 
      errors, 
      generatedCommands: commandData.allCommands 
    };
  } catch (error) {
    errors.push(`Error: ${error.message}`);
    return { success: false, logs, errors };
  }
};

export const checkEntityExists = async (projectPath: string, entityName: string): Promise<boolean> => {
  try {
    const exists = await window.electron.checkEntityExists(projectPath, entityName);
    return exists;
  } catch (error) {
    return false;
  }
};

export const getProjectInfo = async (projectPath: string): Promise<{ isValidProject: boolean; projectName?: string; existingEntities?: string[] }> => {
  try {
    // This could be enhanced to actually check for nocsharp project structure
    const projectName = projectPath.split('/').pop() || 'Unknown';
    return {
      isValidProject: true,
      projectName,
      existingEntities: [] // This could be implemented to scan existing entities
    };
  } catch (error) {
    return { isValidProject: false };
  }
};

export const generateScript = (entities: Entity[], projectName: string, isExistingProject = false): string => {
  return CommandFactory.generateScript(entities, projectName, isExistingProject);
};