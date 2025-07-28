import { useAppContext } from '../contexts/AppContext';
import { Entity } from '../models/Entity';
import { Property } from '../models/Property';

export const useEntityManagement = () => {
  const { state, dispatch } = useAppContext();

  const addEntity = () => {
    const newEntity: Entity = {
      name: '',
      properties: []
    };
    dispatch({ type: 'ADD_ENTITY', payload: newEntity });
  };

  const updateEntityName = (index: number, name: string) => {
    const updatedEntity = { ...state.entities[index], name };
    dispatch({ type: 'UPDATE_ENTITY', payload: { index, entity: updatedEntity } });
  };

  const updateEntityBaseSkip = (index: number, baseSkip: boolean) => {
    const updatedEntity = { ...state.entities[index], baseSkip };
    dispatch({ type: 'UPDATE_ENTITY', payload: { index, entity: updatedEntity } });
  };

  const removeEntity = (index: number) => {
    dispatch({ type: 'REMOVE_ENTITY', payload: index });
  };

  const addProperty = (entityIndex: number) => {
    const newProperty: Property = {
      name: '',
      type: 'string',
      collectionType: 'none'
    };
    
    const entity = state.entities[entityIndex];
    const updatedEntity = {
      ...entity,
      properties: [...entity.properties, newProperty]
    };
    
    dispatch({ type: 'UPDATE_ENTITY', payload: { index: entityIndex, entity: updatedEntity } });
  };

  const updateProperty = (
    entityIndex: number, 
    propertyIndex: number, 
    field: keyof Property, 
    value: string
  ) => {
    const entity = state.entities[entityIndex];
    const updatedProperties = entity.properties.map((property, index) =>
      index === propertyIndex ? { ...property, [field]: value } : property
    );
    
    const updatedEntity = {
      ...entity,
      properties: updatedProperties
    };
    
    dispatch({ type: 'UPDATE_ENTITY', payload: { index: entityIndex, entity: updatedEntity } });
  };

  const removeProperty = (entityIndex: number, propertyIndex: number) => {
    const entity = state.entities[entityIndex];
    const updatedProperties = entity.properties.filter((_, index) => index !== propertyIndex);
    
    const updatedEntity = {
      ...entity,
      properties: updatedProperties
    };
    
    dispatch({ type: 'UPDATE_ENTITY', payload: { index: entityIndex, entity: updatedEntity } });
  };

  const addEntities = (newEntities: Entity[]) => {
    // Add multiple entities, avoiding duplicates by name
    const currentNames = state.entities.map(e => e.name);
    const uniqueEntities = newEntities.filter(entity => !currentNames.includes(entity.name));
    
    uniqueEntities.forEach(entity => {
      dispatch({ type: 'ADD_ENTITY', payload: entity });
    });
    
    return uniqueEntities.length;
  };

  const mergeEntities = (newEntities: Entity[], replaceExisting = false) => {
    if (replaceExisting) {
      // Replace all entities
      dispatch({ type: 'SET_ENTITIES', payload: newEntities });
    } else {
      // Merge entities, keeping existing ones
      const merged = [...state.entities];
      
      newEntities.forEach(newEntity => {
        const existingIndex = merged.findIndex(e => e.name === newEntity.name);
        if (existingIndex >= 0) {
          // Update existing entity
          merged[existingIndex] = { ...merged[existingIndex], ...newEntity };
        } else {
          // Add new entity
          merged.push(newEntity);
        }
      });
      
      dispatch({ type: 'SET_ENTITIES', payload: merged });
    }
  };

  const duplicateEntity = (index: number) => {
    const entityToDuplicate = state.entities[index];
    const duplicatedEntity: Entity = {
      name: `${entityToDuplicate.name}_Copy`,
      properties: entityToDuplicate.properties.map(prop => ({ ...prop }))
    };
    dispatch({ type: 'ADD_ENTITY', payload: duplicatedEntity });
  };

  const validateEntity = (entity: Entity): string[] => {
    const errors: string[] = [];
    
    if (!entity.name.trim()) {
      errors.push('Entity name is required');
    }
    
    if (entity.name && !/^[A-Za-z][A-Za-z0-9]*$/.test(entity.name)) {
      errors.push('Entity name must start with a letter and contain only letters and numbers');
    }
    
    entity.properties.forEach((property, index) => {
      if (!property.name.trim()) {
        errors.push(`Property ${index + 1} name is required`);
      }
      
      if (property.name && !/^[A-Za-z][A-Za-z0-9]*$/.test(property.name)) {
        errors.push(`Property ${index + 1} name must start with a letter and contain only letters and numbers`);
      }
    });
    
    return errors;
  };

  const validateAllEntities = (): Record<number, string[]> => {
    const validationErrors: Record<number, string[]> = {};
    
    state.entities.forEach((entity, index) => {
      const errors = validateEntity(entity);
      if (errors.length > 0) {
        validationErrors[index] = errors;
      }
    });
    
    return validationErrors;
  };

  return {
    entities: state.entities,
    addEntity,
    addEntities,
    mergeEntities,
    updateEntityName,
    updateEntityBaseSkip,
    removeEntity,
    addProperty,
    updateProperty,
    removeProperty,
    duplicateEntity,
    validateEntity,
    validateAllEntities,
  };
};
