import { ProjectData } from '../models/ProjectData';
import { transformFileContent } from '../utils/transformFileContent';

export const readFile = (file: File): Promise<ProjectData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target?.result as string;
      const projectData = transformFileContent(fileContent);
      resolve(projectData);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
