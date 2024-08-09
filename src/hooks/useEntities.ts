import { useState } from 'react';
import { Entity } from '../models/Entity';

export const useEntities = () => {
  const [entities, setEntities] = useState<Entity[]>([]);

  const addEntity = () => setEntities([...entities, { name: '', properties: [] }]);

  const updateEntityName = (index: number, name: string) => {
    const newEntities = [...entities];
    newEntities[index].name = name;
    if (name && newEntities[index].properties.length === 0) {
      newEntities[index].properties.push({ name: '', type: '', collectionType: '' });
    }
    setEntities(newEntities);
  };

  const addProperty = (entityIndex: number) => {
    const newEntities = [...entities];
    newEntities[entityIndex].properties.push({ name: '', type: '', collectionType: '' });
    setEntities(newEntities);
  };

  const updateProperty = (entityIndex: number, propertyIndex: number, field: keyof Entity['properties'][number], value: string) => {
    const newEntities = [...entities];
    newEntities[entityIndex].properties[propertyIndex][field] = value;
    setEntities(newEntities);
  };

  const removeProperty = (entityIndex: number, propertyIndex: number) => {
    const newEntities = [...entities];
    newEntities[entityIndex].properties.splice(propertyIndex, 1);
    setEntities(newEntities);
  };

  const removeEntity = (index: number) => {
    const newEntities = entities.filter((_, entityIndex) => entityIndex !== index);
    setEntities(newEntities);
  };

  return {
    entities,
    setEntities,
    addEntity,
    updateEntityName,
    addProperty,
    updateProperty,
    removeProperty,
    removeEntity,
  };
};
