import { useState } from 'react';
import { message } from 'antd';
import { useAppContext } from '../contexts/AppContext';
import { createProject, checkEntityExists } from '../services/ProjectService';
import { Entity } from '../models/Entity';

export const useProjectCreation = () => {
  const { state, dispatch } = useAppContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [existingEntities, setExistingEntities] = useState<Entity[]>([]);
  const [overwriteChoices, setOverwriteChoices] = useState<Record<string, boolean>>({});

  const handleCreateProject = () => {
    if (!state.directoryPath) {
      message.error('Please select a directory first.');
      return;
    }
    setIsModalVisible(true);
  };

  const checkExistingEntities = async (): Promise<Entity[]> => {
    const existingEntitiesList: Entity[] = [];

    for (const entity of state.entities) {
      const exists = await checkEntityExists(state.directoryPath, entity.name);
      if (exists) {
        existingEntitiesList.push(entity);
      }
    }

    return existingEntitiesList;
  };

  const checkForDuplicateEntities = (newEntities: Entity[], existingEntities: Entity[]): Entity[] => {
    if (!newEntities || !existingEntities) {
      return [];
    }
    
    const duplicates = newEntities.filter(newEntity =>
      existingEntities.some(existingEntity => 
        existingEntity.name && newEntity.name &&
        existingEntity.name.toLowerCase().trim() === newEntity.name.toLowerCase().trim()
      )
    );
    
    if (duplicates.length > 0) {
      console.log('Duplicates found:', duplicates.map(e => e.name));
    }
    
    return duplicates;
  };

  const handleEntityComparison = (newEntities: Entity[], existingEntities: Entity[]) => {
    const duplicateEntities = checkForDuplicateEntities(newEntities, existingEntities);
    
    if (duplicateEntities.length > 0) {
      setExistingEntities(duplicateEntities);
      const initialChoices: Record<string, boolean> = {};
      newEntities.forEach(entity => {
        initialChoices[entity.name] = !duplicateEntities.some(e => e.name === entity.name);
      });
      setOverwriteChoices(initialChoices);
      setIsModalVisible(true);
      return true; // Indica que há duplicatas
    }
    return false; // Indica que não há duplicatas
  };

  const handleConfirmCreation = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_LOGS' });
    dispatch({ type: 'CLEAR_ERRORS' });

    try {
      if (state.isExistingProject) {
        const existingEntitiesList = await checkExistingEntities();

        if (existingEntitiesList.length > 0) {
          setExistingEntities(existingEntitiesList);
          const initialChoices: Record<string, boolean> = {};
          state.entities.forEach(entity => {
            initialChoices[entity.name] = !existingEntitiesList.some(e => e.name === entity.name);
          });
          setOverwriteChoices(initialChoices);
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
      }

      await proceedWithProjectCreation();
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error.message });
      message.error('Failed to process request');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const proceedWithProjectCreation = async () => {
    const filteredEntities = state.isExistingProject 
      ? state.entities.filter(entity => overwriteChoices[entity.name] !== false)
      : state.entities;

    if (filteredEntities.length === 0) {
      dispatch({ type: 'ADD_ERROR', payload: 'No entities selected for project creation.' });
      message.error('Nenhuma entidade selecionada para criação do projeto.');
      return;
    }

    const projectData = { projectName: state.projectName, entities: filteredEntities };
    const result = await createProject(
      projectData, 
      state.directoryPath, 
      state.executeCommands, 
      state.isExistingProject,
      overwriteChoices
    );

    result.logs.forEach(log => dispatch({ type: 'ADD_LOG', payload: log }));
    result.errors.forEach(error => dispatch({ type: 'ADD_ERROR', payload: error }));

    if (result.success) {
      message.success(state.isExistingProject ? 'Entidades adicionadas com sucesso' : 'Projeto criado com sucesso');
      setIsModalVisible(false);
      resetOverwriteState();
    } else {
      const hasCriticalError = result.errors.some(error => error.includes('timed out') || error.includes('nocsharp'));

      if (hasCriticalError) {
        message.error('Erro crítico ao executar o comando. Verifique o CLI nocsharp.');
      } else {
        message.warning('Alguns erros ocorreram. Verifique os logs para mais detalhes.');
      }

      // Não fechar o modal para permitir que o usuário veja os erros
    }
  };

  const resetOverwriteState = () => {
    setExistingEntities([]);
    setOverwriteChoices({});
  };

  const handleOverwriteChoiceChange = (entityName: string, value: boolean) => {
    setOverwriteChoices(prevChoices => ({
      ...prevChoices,
      [entityName]: value,
    }));
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    resetOverwriteState();
  };

  return {
    isModalVisible,
    existingEntities,
    overwriteChoices,
    handleCreateProject,
    handleConfirmCreation,
    handleOverwriteChoiceChange,
    handleModalCancel,
    proceedWithProjectCreation,
    resetOverwriteState,
    checkForDuplicateEntities,
    handleEntityComparison,
  };
};
