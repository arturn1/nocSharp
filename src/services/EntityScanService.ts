import { Entity } from '../models/Entity';

export interface ScanResult {
  success: boolean;
  entities: Entity[];
  errors: string[];
}

export const scanExistingEntities = async (projectPath: string): Promise<ScanResult> => {
  try {
    const entities = await window.electron.scanExistingEntities(projectPath);
    return {
      success: true,
      entities: entities,
      errors: []
    };
  } catch (error) {
    return {
      success: false,
      entities: [],
      errors: [error.message || 'Failed to scan entities']
    };
  }
};

export const isValidProjectStructure = async (projectPath: string): Promise<boolean> => {
  try {
    // Check if it's a valid nocsharp project by looking for common structure
    await window.electron.scanExistingEntities(projectPath);
    return true; // If no error thrown, it's valid
  } catch (error) {
    return false;
  }
};

export const getProjectMetadata = async (projectPath: string): Promise<{
  isValid: boolean;
  entityCount: number;
  projectName: string;
}> => {
  try {
    const entities = await window.electron.scanExistingEntities(projectPath);
    const projectName = projectPath.split('/').pop() || projectPath.split('\\').pop() || 'Unknown';
    
    return {
      isValid: true,
      entityCount: entities.length,
      projectName
    };
  } catch (error) {
    return {
      isValid: false,
      entityCount: 0,
      projectName: 'Unknown'
    };
  }
};
