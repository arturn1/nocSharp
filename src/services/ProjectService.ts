import { ProjectData } from '../models/ProjectData';

export const createProject = async (projectData: ProjectData, directoryPath: string): Promise<{ success: boolean; logs: string[]; errors: string[] }> => {
  const { projectName, entities } = projectData;
  const logs: string[] = [];
  const errors: string[] = [];

  if (!projectName) {
    errors.push('Project name is required');
    return { success: false, logs, errors };
  }

  try {
    const createProjectCommand = `cd ${directoryPath} && nc new ${projectName}`;
    logs.push(`Executing: ${createProjectCommand}`);
    await window.electron.executeCommand(createProjectCommand);
    logs.push('Project created successfully');

    for (const entity of entities) {
      if (entity.name) {
        const fields = entity.properties.map(prop => {
          const collectionPrefix = prop.collectionType ? `${prop.collectionType}<` : '';
          const collectionSuffix = prop.collectionType ? '>' : '';
          return `${prop.name}:${collectionPrefix}${prop.type}${collectionSuffix}`;
        }).join(' ');
        const createEntityCommand = `cd ${directoryPath} && nc g e ${entity.name} ${fields}`;
        logs.push(`Executing: ${createEntityCommand}`);
        await window.electron.executeCommand(createEntityCommand);
        logs.push(`Entity ${entity.name} created successfully`);
      }
    }

    return { success: true, logs, errors };
  } catch (error) {
    errors.push(`Error: ${error.message}`);
    return { success: false, logs, errors };
  }
};
