import React, { useState, useEffect } from 'react';
import { Spin, Typography } from 'antd';
import { useAppContext } from '../contexts/AppContext';
import { useProjectCreation } from '../hooks/useProjectCreation';
import { useEntityManagement } from '../hooks/useEntityManagement';
import { useFileManagement } from '../hooks/useFileManagement';
import { Entity } from '../models/Entity';
import { Property } from '../models/Property';
import { CommandFactory } from '../services/CommandFactory';
import { ProjectManager, ProjectContext } from '../services/ProjectManager';
import { EntityChangeDetector } from '../services/EntityChangeDetector';
import { UIStateManager, ScannerModalData, EntityComparisonModalData } from '../services/UIStateManager';
import { FileOperationService } from '../services/FileOperationService';
import { HomePageService } from '../services/HomePageService';

// Components
import AppLayout from '../components/Layout';
import HomePage from './HomePage';
import ImportPage from './ImportPage';
import ScannerPage from './ScannerPage';
import TemplatesPage from './TemplatesPage';
import DotNetDashboard from './DotNetDashboard/DotNetDashboard';
import ModalsManager from '../components/ModalsManager';
import ProjectModal from '../components/ProjectModal';

const { Text } = Typography;

const Home: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>('home');
  const [showEntitiesModal, setShowEntitiesModal] = useState<boolean>(false);
  const [entitiesComparison, setEntitiesComparison] = useState<EntityComparisonModalData>({ existing: [], new: [] });
  const [showScannerModal, setScannerModal] = useState<boolean>(false);
  const [scannerModalData, setScannerModalData] = useState<ScannerModalData>({
    existingEntities: [], 
    newEntities: [], 
    commands: [], 
    projectName: '', 
    projectPath: '' 
  });
  const [isExecutingCommands, setIsExecutingCommands] = useState<boolean>(false);
  const [originalEntities, setOriginalEntities] = useState<Entity[]>([]);
  const [hasEntityChanges, setHasEntityChanges] = useState<boolean>(false);
  const [scannerRefreshTrigger, setScannerRefreshTrigger] = useState<number>(0);
  
  const { state, dispatch } = useAppContext();
  const { 
    isModalVisible, 
    existingEntities, 
    overwriteChoices,
    handleCreateProject,
    handleConfirmCreation,
    handleOverwriteChoiceChange,
    handleModalCancel,
    checkForDuplicateEntities,
    handleEntityComparison
  } = useProjectCreation();
  
  const {
    entities,
    addEntity,
    updateEntityName,
    updateEntityBaseSkip,
    addProperty,
    updateProperty,
    removeProperty,
    removeEntity,
    mergeEntities
  } = useEntityManagement();
  
  const { 
    recentDirectories, 
    openDirectorySelector,
    selectRecentDirectory 
  } = useFileManagement();

  // Hook para detectar mudanças nas entidades usando o serviço
  useEffect(() => {
    if (originalEntities.length > 0) {
      const changeDetection = EntityChangeDetector.detectChanges(entities, originalEntities);
      setHasEntityChanges(changeDetection.hasChanges);
    }
  }, [entities, originalEntities]);

  // Handlers
  const handleApplyTemplate = (templateEntities: any[]) => {
    dispatch({ type: 'SET_ENTITIES', payload: templateEntities });
  };

  const handleShowScannerModal = (modifiedEntities: Entity[], newEntities: Entity[]) => {
    // Gerar comandos para entidades novas
    const newEntityCommands = CommandFactory.generateCommands(newEntities, {
      isExistingProject: state.isExistingProject,
      overwriteChoices: {},
    });
    
    // Gerar comandos para entidades modificadas (usando overwrite)
    const modifiedEntityCommands = CommandFactory.generateCommands(modifiedEntities, {
      isExistingProject: state.isExistingProject,
      overwriteChoices: modifiedEntities.reduce((acc, entity) => {
        acc[entity.name] = true; // Force overwrite for modified entities
        return acc;
      }, {} as Record<string, boolean>),
    });
    
    // Combinar todos os comandos
    const allCommands = [...modifiedEntityCommands, ...newEntityCommands];

    const modalData = UIStateManager.createScannerModal(
      modifiedEntities, // Entidades modificadas
      newEntities,      // Entidades novas
      allCommands,
      state.projectName || 'Projeto',
      state.directoryPath || ''
    );
    
    setScannerModalData(modalData);
    setScannerModal(true);
  };

  const handleExecuteScannerCommands = async () => {
    setIsExecutingCommands(true);

    try {
      console.log('🚀 Iniciando execução de comandos do scanner modal...');
      console.log('📋 Comandos a executar:', scannerModalData.commands.length);
      console.log('📝 Entidades modificadas:', scannerModalData.existingEntities.length);
      console.log('🆕 Entidades novas:', scannerModalData.newEntities.length);

      mergeEntities(scannerModalData.newEntities, false);
      
      const projectContext: ProjectContext = {
        projectName: state.projectName || 'Projeto',
        directoryPath: state.directoryPath || '',
        isExistingProject: state.isExistingProject,
        executeCommands: state.executeCommands || false
      };
      
      const result = await ProjectManager.executeCommands(scannerModalData.commands, projectContext);
      
      if (result.success) {
        console.log('✅ Comandos executados com sucesso! Iniciando processo de fechamento e reload...');
        
        // Fechar o modal imediatamente após sucesso
        setScannerModal(false);
        console.log('❌ Modal fechado');
        
        // Forçar refresh do EntityScanner
        setScannerRefreshTrigger(prev => {
          console.log('🔄 Incrementando refreshTrigger de', prev, 'para', prev + 1);
          return prev + 1;
        });
        
        // Recarregar o projeto após a execução dos comandos
        if (state.directoryPath) {
          try {
            console.log('🔄 Recarregando projeto após atualização...');
            const { scanExistingEntities, getProjectMetadata } = await import('../services/EntityScanService');
            
            // Reescanear as entidades do projeto
            const scanResult = await scanExistingEntities(state.directoryPath);
            if (scanResult.success) {
              console.log('✅ Projeto recarregado com sucesso:', scanResult.entities.length, 'entidades encontradas');
              
              // Atualizar as entidades no estado global
              mergeEntities(scanResult.entities, true); // true para substituir completamente
              
              // Recarregar os metadados do projeto
              const metadata = await getProjectMetadata(state.directoryPath);
              if (metadata.projectName) {
                console.log('📄 Metadados do projeto atualizados:', metadata.projectName);
              }
              
              // Mostrar mensagem de sucesso
              const modifiedCount = scannerModalData.existingEntities.length;
              const newCount = scannerModalData.newEntities.length;
              let successMessage = 'Projeto atualizado com sucesso!';
              
              if (modifiedCount > 0 && newCount > 0) {
                successMessage = `Projeto atualizado: ${modifiedCount} modificadas, ${newCount} novas entidades`;
              } else if (modifiedCount > 0) {
                successMessage = `Projeto atualizado: ${modifiedCount} entidades modificadas`;
              } else if (newCount > 0) {
                successMessage = `Projeto atualizado: ${newCount} novas entidades adicionadas`;
              }
              
              // Importar message dinamicamente para evitar problemas
              const { message } = await import('antd');
              message.success(successMessage);
              console.log('💬 Mensagem de sucesso exibida:', successMessage);
              
            } else {
              console.warn('⚠️ Falha ao recarregar projeto:', scanResult.errors);
              const { message } = await import('antd');
              message.warning('Comandos executados, mas houve problemas ao recarregar o projeto');
            }
          } catch (reloadError) {
            console.error('❌ Erro ao recarregar projeto:', reloadError);
            const { message } = await import('antd');
            message.error('Comandos executados, mas falha ao recarregar projeto');
          }
        }
      } else {
        console.error('❌ Failed to execute commands:', result.error);
        const { message } = await import('antd');
        message.error(`Erro ao executar comandos: ${result.error}`);
      }
      
    } catch (error) {
      console.error('❌ Error executing scanner commands:', error);
      const { message } = await import('antd');
      message.error(`Erro inesperado: ${error.message}`);
    } finally {
      setIsExecutingCommands(false);
      console.log('🏁 Processo de execução de comandos finalizado');
    }
  };

  const handleUpdateModifiedEntities = async () => {
    if (!state.directoryPath || !hasEntityChanges) return;

    setIsExecutingCommands(true);

    try {
      const projectContext: ProjectContext = {
        projectName: state.projectName || 'Projeto',
        directoryPath: state.directoryPath,
        isExistingProject: state.isExistingProject,
        executeCommands: state.executeCommands || false
      };

      const result = await ProjectManager.updateModifiedEntities(
        entities,
        originalEntities,
        projectContext
      );

      if (result.success && result.commandsExecuted > 0) {
        const nonBaseEntities = EntityChangeDetector.filterNonBaseEntities(entities);
        setOriginalEntities(JSON.parse(JSON.stringify(nonBaseEntities)));
        setHasEntityChanges(false);
        
        const changeDetection = EntityChangeDetector.detectChanges(entities, originalEntities);
        dispatch({ 
          type: 'ADD_LOG', 
          payload: `✅ ${changeDetection.modifiedCount} ${changeDetection.modifiedCount === 1 ? 'entidade atualizada' : 'entidades atualizadas'} com sucesso!` 
        });

        // Recarregar o projeto após a atualização das entidades modificadas
        try {
          console.log('Recarregando projeto após atualização de entidades modificadas...');
          const { scanExistingEntities, getProjectMetadata } = await import('../services/EntityScanService');
          
          // Reescanear as entidades do projeto
          const scanResult = await scanExistingEntities(state.directoryPath);
          if (scanResult.success) {
            console.log('Projeto recarregado com sucesso:', scanResult.entities.length, 'entidades encontradas');
            
            // Atualizar as entidades no estado global
            mergeEntities(scanResult.entities, true); // true para substituir completamente
            
            // Recarregar os metadados do projeto
            const metadata = await getProjectMetadata(state.directoryPath);
            if (metadata.projectName) {
              console.log('Metadados do projeto atualizados:', metadata.projectName);
            }
          } else {
            console.warn('Falha ao recarregar projeto:', scanResult.errors);
          }
        } catch (reloadError) {
          console.error('Erro ao recarregar projeto:', reloadError);
        }
      } else if (!result.success) {
        console.error('Failed to update entities:', result.error);
      }
    } catch (error) {
      console.error('Error updating modified entities:', error);
    } finally {
      setIsExecutingCommands(false);
    }
  };

  const handleUpdateProjectFromScanner = async (newEntities: Entity[]) => {
    return HomePageService.handleUpdateProjectFromScanner(
      newEntities,
      state,
      entities,
      handleShowScannerModal,
      mergeEntities,
      async () => await handleCreateProject()
    );
  };

  const handleLoadScannedEntities = (scannedEntities: Entity[]) => {
    HomePageService.handleLoadScannedEntities(
      entities,
      scannedEntities,
      originalEntities,
      mergeEntities,
      setOriginalEntities
    );
  };

  const handleScannerDirectorySelected = (path: string) => {
    dispatch({ type: 'SET_DIRECTORY_PATH', payload: path });
    dispatch({ type: 'SET_IS_EXISTING_PROJECT', payload: true });
  };

  const handleUpdateProperty = (
    entityIndex: number,
    propertyIndex: number,
    field: keyof Property,
    value: string
  ) => {
    updateProperty(entityIndex, propertyIndex, field, value);
  };

  const handleLoadProjectFromScanner = (scannedEntities: Entity[], projectName: string) => {
    HomePageService.handleLoadProjectFromScanner(
      scannedEntities,
      projectName,
      dispatch,
      setOriginalEntities,
      setHasEntityChanges
    );
  };

  const generateCommandsPreview = () => {
    return CommandFactory.generateCommands(entities, {
      isExistingProject: state.isExistingProject,
      overwriteChoices,
    });
  };

  if (state.isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text>Processing your request...</Text>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'home':
        return (
          <HomePage
            projectName={state.projectName}
            entities={entities}
            onMenuChange={setActiveMenu}
          />
        );

      case 'dashboard':
        return (
          <DotNetDashboard 
            projectPath={state.directoryPath}
          />
        );

      case 'import':
        return (
          <ImportPage
            entities={entities}
            onEntityComparison={handleEntityComparison}
            onMergeEntities={mergeEntities}
            onCreateProject={async () => await handleCreateProject()}
          />
        );

      case 'scanner':
        return (
          <ScannerPage
            entities={entities}
            originalEntities={originalEntities}
            hasEntityChanges={hasEntityChanges}
            isExecutingCommands={isExecutingCommands}
            currentProjectPath={state.directoryPath}
            isExistingProject={state.isExistingProject}
            onLoadScannedEntities={handleLoadScannedEntities}
            onDirectorySelected={handleScannerDirectorySelected}
            onUpdateProject={handleUpdateProjectFromScanner}
            onLoadProject={handleLoadProjectFromScanner}
            onEntityComparison={handleEntityComparison}
            onMergeEntities={mergeEntities}
            onShowEntitiesComparison={handleShowScannerModal}
            addEntity={addEntity}
            updateEntityName={updateEntityName}
            updateEntityBaseSkip={updateEntityBaseSkip}
            addProperty={addProperty}
            updateProperty={handleUpdateProperty}
            removeProperty={removeProperty}
            removeEntity={removeEntity}
            onUpdateModifiedEntities={handleUpdateModifiedEntities}
            refreshTrigger={scannerRefreshTrigger}
          />
        );

      case 'templates':
        return (
          <TemplatesPage onApplyTemplate={handleApplyTemplate} />
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout
      activeMenu={activeMenu}
      projectName={state.projectName}
      onMenuChange={setActiveMenu}
    >
      {renderContent()}
      
      <ModalsManager
        showEntitiesModal={showEntitiesModal}
        entitiesComparison={entitiesComparison}
        onCloseEntitiesModal={() => setShowEntitiesModal(false)}
        showScannerModal={showScannerModal}
        scannerModalData={scannerModalData}
        isExecutingCommands={isExecutingCommands}
        onExecuteScannerCommands={handleExecuteScannerCommands}
        onCloseScannerModal={() => setScannerModal(false)}
      />

      <ProjectModal
        isModalVisible={isModalVisible}
        projectName={state.projectName}
        isExistingProject={state.isExistingProject}
        existingEntities={existingEntities}
        overwriteChoices={overwriteChoices}
        onConfirmCreation={handleConfirmCreation}
        onModalCancel={handleModalCancel}
        onOverwriteChoiceChange={handleOverwriteChoiceChange}
        generateCommandsPreview={generateCommandsPreview}
      />
    </AppLayout>
  );
};

export default Home;
