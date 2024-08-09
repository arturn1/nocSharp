import { ProjectData } from '../models/ProjectData';
import { joinPaths } from '../utils/pathUtils';

export const createProject = async (
  projectData: ProjectData,
  directoryPath: string,
  executeCommands: boolean,
  isExistingProject: boolean
): Promise<{ success: boolean; logs: string[]; errors: string[] }> => {
  const { projectName, entities } = projectData;
  const logs: string[] = [];
  const errors: string[] = [];
  const commands: string[] = [];

  if (!projectName && !isExistingProject) {
    errors.push('Project name is required for new projects');
    return { success: false, logs, errors };
  }

  const projectPath = isExistingProject ? directoryPath : joinPaths(directoryPath, projectName);

  try {
    if (!isExistingProject) {
      const createProjectCommand = `cd "${directoryPath}" && nc new "${projectName}"`;
      logs.push(`Executing: ${createProjectCommand}`);
      commands.push(createProjectCommand);
      if (executeCommands) {
        await window.electron.executeCommand(createProjectCommand);
        logs.push('Project created successfully');
      }
    }

    for (const entity of entities) {
      if (entity.name) {
        const fields = entity.properties
          .map(prop => `${prop.name}:${prop.type}`)
          .join(' ');
        const createEntityCommand = `cd "${projectPath}" && nc s "${entity.name}" ${fields}`;
        logs.push(`Executing: ${createEntityCommand}`);
        commands.push(createEntityCommand);
        if (executeCommands) {
          await window.electron.executeCommand(createEntityCommand);
          logs.push(`Scaffold ${entity.name} created successfully`);
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
