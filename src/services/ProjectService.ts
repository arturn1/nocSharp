import { ProjectData } from '../models/ProjectData';

export const createProject = async (projectData: ProjectData, directoryPath: string): Promise<void> => {
  const { projectName, entities } = projectData;
  if (!projectName) {
    throw new Error('Project name is required');
  }

  await window.electron.executeCommand(`cd ${directoryPath} && nc new ${projectName}`);

  for (const entity of entities) {
    if (entity.name) {
      const fields = entity.properties.map(prop => {
        const collectionPrefix = prop.collectionType ? `${prop.collectionType}<` : '';
        const collectionSuffix = prop.collectionType ? '>' : '';
        return `${prop.name}:${collectionPrefix}${prop.type}${collectionSuffix}`;
      }).join(' ');
      await window.electron.executeCommand(`cd ${directoryPath} && nc g e ${entity.name} ${fields}`);
    }
  }
};
