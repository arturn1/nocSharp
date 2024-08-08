import { ProjectData } from '../models/ProjectData';
import { Entity } from '../models/Entity';
import { Property } from '../models/Property';

const typeMapping: { [key: string]: string } = {
  'integer': 'int',
  'varchar': 'string',
  'text': 'string',
  'timestamp': 'DateTime',
  'guid': 'Guid',
};

export const transformFileContent = (fileContent: string): ProjectData => {
  const lines = fileContent.split('\n');
  const entities: Entity[] = [];
  let currentEntity: Entity | null = null;

  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('Table ')) {
      if (currentEntity) {
        entities.push(currentEntity);
      }
      const tableName = trimmedLine.split(' ')[1];
      currentEntity = { name: tableName, properties: [] };
    } else if (currentEntity && trimmedLine !== '}') {
      const [name, type, ...rest] = trimmedLine.split(' ');
      if (name) {
        const mappedType = typeMapping[type] || 'object';
        const collectionType = rest.includes('integer') ? '' : 'None';
        const property: Property = { name, type: mappedType, collectionType };
        currentEntity.properties.push(property);
      }
    }
  });

  if (currentEntity) {
    entities.push(currentEntity);
  }

  return {
    projectName: 'Project',
    entities,
  };
};
