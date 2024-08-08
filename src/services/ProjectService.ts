import { ProjectData } from '../models/ProjectData';
import path from 'path';

export const createProject = async (
  projectData: ProjectData,
  directoryPath: string,
  executeCommands: boolean
): Promise<{ success: boolean; logs: string[]; errors: string[] }> => {
  const { projectName, entities } = projectData;
  const logs: string[] = [];
  const errors: string[] = [];
  const commands: string[] = [];

  if (!projectName) {
    errors.push('Project name is required');
    return { success: false, logs, errors };
  }

  const projectPath = path.join(directoryPath, projectName);

  try {
    const createProjectCommand = `cd ${directoryPath} && nc new ${projectName}`;
    logs.push(`Executing: ${createProjectCommand}`);
    commands.push(createProjectCommand);
    if (executeCommands) {
      await window.electron.executeCommand(createProjectCommand);
      logs.push('Project created successfully');
    }

    for (const entity of entities) {
      if (entity.name) {
        const fields = entity.properties
          .map(prop => `${prop.name}:${prop.type}`)
          .join(' ');
        const createEntityCommand = `cd ${projectPath} && nc g e ${entity.name} ${fields}`;
        logs.push(`Executing: ${createEntityCommand}`);
        commands.push(createEntityCommand);
        if (executeCommands) {
          await window.electron.executeCommand(createEntityCommand);
          logs.push(`Entity ${entity.name} created successfully`);
        }
      }
    }

    if (!executeCommands) {
      console.log('Generated Commands:', commands);
    }

    return { success: true, logs, errors };
  } catch (error) {
    errors.push(`Error: ${error.message}`);
    return { success: false, logs, errors };
  }
};
