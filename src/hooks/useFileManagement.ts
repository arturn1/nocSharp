import { useState } from 'react';
import { message } from 'antd';
import { useAppContext } from '../contexts/AppContext';
import { readFile } from '../services/FileService';
import { RcFile } from 'antd/es/upload';

export const useFileManagement = () => {
  const { dispatch } = useAppContext();
  const [recentDirectories, setRecentDirectories] = useState<string[]>([]);

  const handleFileUpload = async (file: RcFile) => {
    try {
      const projectData = await readFile(file);
      const fileNameWithoutExtension = file.name.split('.').slice(0, -1).join('.');
      
      dispatch({ type: 'SET_ENTITIES', payload: projectData.entities });
      dispatch({ type: 'SET_PROJECT_NAME', payload: fileNameWithoutExtension });
      
      message.success('File uploaded successfully');
      return true;
    } catch (error) {
      message.error(`Failed to read file: ${error.message}`);
      return false;
    }
  };

  const openDirectorySelector = async (existingProject: boolean) => {
    try {
      const result = await window.electron.dialog.showOpenDialog({
        properties: ['openDirectory'],
      });

      if (!result.canceled && result.filePaths.length > 0) {
        const selectedPath = result.filePaths[0];

        dispatch({ type: 'SET_DIRECTORY_PATH', payload: selectedPath });

        // Definir SET_IS_EXISTING_PROJECT como true apenas no contexto do Entity Scanner
        if (existingProject) {
          dispatch({ type: 'SET_IS_EXISTING_PROJECT', payload: true });
        }

        // Adicionar ao histórico de diretórios recentes
        setRecentDirectories(prev => {
          const filtered = prev.filter(path => path !== selectedPath);
          return [selectedPath, ...filtered].slice(0, 5); // Manter apenas os 5 mais recentes
        });

        message.success('Directory selected successfully');
        return selectedPath;
      } else {
        message.warning('No directory selected');
        return null;
      }
    } catch (err) {
      message.error(`Failed to select directory: ${err.message}`);
      return null;
    }
  };

  const selectRecentDirectory = (path: string, existingProject: boolean) => {
    dispatch({ type: 'SET_DIRECTORY_PATH', payload: path });
    dispatch({ type: 'SET_IS_EXISTING_PROJECT', payload: existingProject });
    message.success('Directory selected from recent');
  };

  const clearRecentDirectories = () => {
    setRecentDirectories([]);
    message.success('Recent directories cleared');
  };



  const importProjectConfiguration = async (file: File) => {
    try {
      const text = await file.text();
      const config = JSON.parse(text);
      
      if (config.projectName) {
        dispatch({ type: 'SET_PROJECT_NAME', payload: config.projectName });
      }
      
      if (config.entities) {
        dispatch({ type: 'SET_ENTITIES', payload: config.entities });
      }
      
      message.success('Configuration imported successfully');
      return true;
    } catch (error) {
      message.error(`Failed to import configuration: ${error.message}`);
      return false;
    }
  };

  return {
    recentDirectories,
    handleFileUpload,
    openDirectorySelector,
    selectRecentDirectory,
    clearRecentDirectories,
    importProjectConfiguration,
  };
};
