import React, { useState, useEffect } from 'react';
import { Typography, Button, Form, Modal, Input, Select, Card, Space, Spin, Alert, Row, Col, Menu, Layout, Statistic } from 'antd';
import { FileTextOutlined, ScanOutlined, PlusOutlined, DatabaseOutlined, SettingOutlined, CodeOutlined, ToolOutlined, HomeOutlined } from '@ant-design/icons';
import { useAppContext } from '../contexts/AppContext';
import { useProjectCreation } from '../hooks/useProjectCreation';
import { useEntityManagement } from '../hooks/useEntityManagement';
import { useFileManagement } from '../hooks/useFileManagement';
import { Entity } from '../models/Entity';
import { Property } from '../models/Property';
import EntityForm from '../components/EntityForm';
import ProjectForm from '../components/ProjectForm';
import EntityTemplates from '../components/EntityTemplates';
import ScriptGenerator from '../components/ScriptGenerator';
import EntityScanner from '../components/EntityScanner';
import ParserTester from '../components/ParserTester';
import DBDiagramUpload from '../components/DBDiagramUpload';
import { CommandFactory } from '../services/CommandFactory';
import { scanExistingEntities } from '../services/EntityScanService';

const { Title, Text } = Typography;
const { Option } = Select;
const { Sider, Content } = Layout;

const Home: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>('home');
  const [dbDiagramFileName, setDbDiagramFileName] = useState<string>('');
  const [importedEntities, setImportedEntities] = useState<Entity[]>([]);
  const [showEntitiesModal, setShowEntitiesModal] = useState<boolean>(false);
  const [entitiesComparison, setEntitiesComparison] = useState<{
    existing: Entity[];
    new: Entity[];
  }>({ existing: [], new: [] });
  const [showScannerModal, setScannerModal] = useState<boolean>(false);
  const [scannerModalData, setScannerModalData] = useState<{
    existingEntities: Entity[];
    newEntities: Entity[];
    commands: string[];
    projectName: string;
    projectPath: string;
  }>({ existingEntities: [], newEntities: [], commands: [], projectName: '', projectPath: '' });
  const [isExecutingCommands, setIsExecutingCommands] = useState<boolean>(false);
  const [originalEntities, setOriginalEntities] = useState<Entity[]>([]);
  const [hasEntityChanges, setHasEntityChanges] = useState<boolean>(false);
  
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

  // Hook para atualizar entidades quando acessar "Gerenciar Entidades"
  useEffect(() => {
    const refreshProjectEntities = async () => {
      if (activeMenu === 'entities' && state.directoryPath && state.isExistingProject) {
        console.log('🔄 Refreshing project entities for path:', state.directoryPath);
        try {
          const scanResult = await scanExistingEntities(state.directoryPath);
          if (scanResult.success && scanResult.entities.length > 0) {
            console.log('✅ Updated entities from project:', scanResult.entities);
            // Merge with existing entities to keep any new ones added manually
            const updatedEntities = [...scanResult.entities];
            
            // Add any entities that exist in the global state but not in the scanned result
            entities.forEach(existingEntity => {
              if (!scanResult.entities.some(scanned => scanned.name === existingEntity.name)) {
                updatedEntities.push(existingEntity);
              }
            });
            
            dispatch({ type: 'SET_ENTITIES', payload: updatedEntities });
            // Salvar estado original para comparação
            setOriginalEntities(JSON.parse(JSON.stringify(updatedEntities)));
            setHasEntityChanges(false);
          }
        } catch (error) {
          console.error('❌ Error refreshing project entities:', error);
        }
      }
    };

    refreshProjectEntities();
  }, [activeMenu, state.directoryPath, state.isExistingProject]);

  // Hook para detectar mudanças nas entidades
  useEffect(() => {
    if (originalEntities.length > 0) {
      const hasChanges = JSON.stringify(entities) !== JSON.stringify(originalEntities);
      setHasEntityChanges(hasChanges);
    }
  }, [entities, originalEntities]);

  const handleApplyTemplate = (templateEntities: any[]) => {
    dispatch({ type: 'SET_ENTITIES', payload: templateEntities });
  };

  const handleDBDiagramImport = () => {
    openDirectorySelector(false); // Ajustado para indicar que o projeto é existente
  };

  const handleDBDiagramEntitiesLoaded = (loadedEntities: Entity[], fileName: string) => {
    setImportedEntities(loadedEntities);
    setDbDiagramFileName(fileName);
    dispatch({ type: 'SET_PROJECT_NAME', payload: fileName.replace(/\.[^/.]+$/, "") || 'DBDiagram Project' });
  };

  const handleCreateProjectFromDBDiagram = async () => {
    if (importedEntities.length > 0 && state.directoryPath) {
      // Merge imported entities with existing ones
      mergeEntities(importedEntities, false);
      // Create the project
      await handleCreateProject();
      // Clear imported entities after project creation
      setImportedEntities([]);
      setDbDiagramFileName('');
    }
  };

  const handleShowEntitiesComparison = (existingEntities: Entity[], newEntities: Entity[]) => {
    console.log('🔍 Showing entities comparison:', { existingEntities, newEntities });
    setEntitiesComparison({ existing: existingEntities, new: newEntities });
    setShowEntitiesModal(true);
  };

  const handleShowScannerModal = (existingEntities: Entity[], newEntities: Entity[]) => {
    console.log('🔍 Opening Scanner Modal with entities:', { existingEntities, newEntities });
    
    // Gerar comandos baseados nas novas entidades
    const commands = CommandFactory.generateCommands(newEntities, {
      isExistingProject: state.isExistingProject,
      overwriteChoices: {},
    });

    setScannerModalData({
      existingEntities,
      newEntities,
      commands,
      projectName: state.projectName || 'Projeto',
      projectPath: state.directoryPath || ''
    });
    setScannerModal(true);
  };

  const handleExecuteScannerCommands = async () => {
    setIsExecutingCommands(true);
    console.log('🚀 Executing scanner commands:', scannerModalData.commands);
    console.log('📂 Project path:', scannerModalData.projectPath);

    try {
      // Merge as novas entidades primeiro
      mergeEntities(scannerModalData.newEntities, false);
      
      // Executar os comandos no diretório do projeto
      for (const command of scannerModalData.commands) {
        console.log('⚡ Executing command:', command);
        console.log('📍 In directory:', scannerModalData.projectPath);
        
        if (state.executeCommands && scannerModalData.projectPath) {
          // Executar o comando no diretório correto usando cd
          const fullCommand = `cd "${scannerModalData.projectPath}" && ${command}`;
          await window.electron.executeCommand(fullCommand);
        }
      }
      
      console.log('✅ All commands executed successfully');
      setScannerModal(false);
      
    } catch (error) {
      console.error('❌ Error executing commands:', error);
    } finally {
      setIsExecutingCommands(false);
    }
  };

  const handleUpdateModifiedEntities = async () => {
    if (!state.directoryPath || !hasEntityChanges) return;

    console.log('🔄 Updating modified entities...');
    setIsExecutingCommands(true);

    try {
      // Filtrar entidades que não são BaseEntity
      const nonBaseEntities = entities.filter(entity => entity.name !== 'BaseEntity');
      
      // Detectar entidades modificadas
      const modifiedEntities: Entity[] = [];
      
      nonBaseEntities.forEach(currentEntity => {
        const originalEntity = originalEntities.find(orig => orig.name === currentEntity.name);
        if (!originalEntity) {
          // Nova entidade
          modifiedEntities.push(currentEntity);
        } else if (JSON.stringify(currentEntity) !== JSON.stringify(originalEntity)) {
          // Entidade modificada
          modifiedEntities.push(currentEntity);
        }
      });

      console.log('📝 Modified entities:', modifiedEntities);

      if (modifiedEntities.length > 0) {
        // Gerar comandos apenas para entidades modificadas
        const commands = CommandFactory.generateCommands(modifiedEntities, {
          isExistingProject: state.isExistingProject,
          overwriteChoices: {},
        });

        console.log('⚡ Commands to execute:', commands);

        // Executar comandos no diretório correto
        for (const command of commands) {
          console.log('🔧 Executing:', command);
          if (state.executeCommands) {
            const fullCommand = `cd "${state.directoryPath}" && ${command}`;
            await window.electron.executeCommand(fullCommand);
          }
        }

        // Atualizar estado original após sucesso
        setOriginalEntities(JSON.parse(JSON.stringify(nonBaseEntities)));
        setHasEntityChanges(false);
        
        console.log('✅ Entities updated successfully');
        
        // Adicionar log de sucesso
        dispatch({ 
          type: 'ADD_LOG', 
          payload: `✅ ${modifiedEntities.length} ${modifiedEntities.length === 1 ? 'entidade atualizada' : 'entidades atualizadas'} com sucesso!` 
        });
      }
    } catch (error) {
      console.error('❌ Error updating entities:', error);
    } finally {
      setIsExecutingCommands(false);
    }
  };

  const handleUpdateProjectFromScanner = async (newEntities: Entity[]) => {
    console.log('🚀 Starting project update with entities:', newEntities);
    console.log('📊 Current state entities:', entities);
    console.log('🔄 Existing project status:', state.isExistingProject);
    
    if (newEntities.length > 0) {
      // Verificar se é projeto existente e se há entidades já carregadas
      if (state.isExistingProject && entities.length > 0) {
        // Filtrar entidades que já existem no projeto escaneado
        const scannedEntities = entities.filter(entity => 
          newEntities.some(newEntity => newEntity.name === entity.name)
        );
        
        // Filtrar novas entidades que não existem no projeto
        const reallyNewEntities = newEntities.filter(entity => 
          !entities.some(existing => existing.name === entity.name)
        );
        
        console.log('🔍 Showing scanner modal with:', { 
          existing: scannedEntities, 
          new: reallyNewEntities 
        });
        
        // Mostrar modal do scanner com entidades existentes e novas
        handleShowScannerModal(scannedEntities, reallyNewEntities);
        return;
      }

      // Se não é projeto existente ou não há entidades, usar o fluxo normal
      mergeEntities(newEntities, false);
      await handleCreateProject();
    }
  };

  const generateCommandsPreview = () => {
    const commands = CommandFactory.generateCommands(entities, {
      isExistingProject: state.isExistingProject,
      overwriteChoices,
    });

    return commands;
  };

  const handleLoadScannedEntities = (scannedEntities: Entity[]) => {
    mergeEntities(scannedEntities, false);
  };

  const handleScannerDirectorySelected = (path: string) => {
    dispatch({ type: 'SET_DIRECTORY_PATH', payload: path });
    dispatch({ type: 'SET_IS_EXISTING_PROJECT', payload: true });
  };

  // Wrapper para compatibilidade com EntityForm
  // Recebe field e value diretamente e repassa para updateProperty
  const handleUpdateProperty = (
    entityIndex: number,
    propertyIndex: number,
    field: keyof Property,
    value: string
  ) => {
    updateProperty(entityIndex, propertyIndex, field, value);
  };

  // Atualizar o estado global com o nome do projeto ao carregar o arquivo
  const handleLoadProjectFromFile = async (filePath: string) => {
    try {
      const fileContent = await window.electron.executeCommand(`cat ${filePath}`); // Usar comando shell para ler o arquivo
      const projectName = fileContent.split('\n')[0].trim(); // Supondo que o nome do projeto está na primeira linha
      dispatch({ type: 'SET_PROJECT_NAME', payload: projectName });
      dispatch({ type: 'SET_DIRECTORY_PATH', payload: filePath });
      // message.success(`Projeto '${projectName}' carregado com sucesso!`);
    } catch (error) {
      // message.error('Erro ao carregar o arquivo do projeto.');
    }
  };

  // Atualizar o estado global ao carregar um projeto via EntityScanner
  const handleLoadProjectFromScanner = (scannedEntities: Entity[], projectName: string) => {
    dispatch({ type: 'SET_ENTITIES', payload: scannedEntities });
    dispatch({ type: 'SET_PROJECT_NAME', payload: projectName });
    dispatch({ type: 'SET_IS_EXISTING_PROJECT', payload: true });
    // message.success(`Projeto '${projectName}' carregado com sucesso!`);
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

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: 'import',
      icon: <DatabaseOutlined />,
      label: 'Import DBDiagram',
    },
    {
      key: 'scanner',
      icon: <ScanOutlined />,
      label: 'Entity Scanner',
    },
    {
      key: 'entities',
      icon: <PlusOutlined />,
      label: 'Gerenciar Entidades',
    },
    {
      key: 'generator',
      icon: <CodeOutlined />,
      label: 'Script Generator',
    },
    {
      key: 'tools',
      icon: <ToolOutlined />,
      label: 'Ferramentas',
      children: [
        { key: 'templates', label: 'Templates' },
        { key: 'parser', label: 'Parser Tester' },
      ],
    },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'home':
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Card title="🚀 nocSharp Project Generator" size="small">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Statistic
                    title="Nome do Projeto"
                    value={state.projectName || 'Nenhum projeto carregado'}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Total de Entidades"
                    value={entities.length}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Total de Propriedades"
                    value={entities.reduce((sum, entity) => sum + entity.properties.length, 0)}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Col>
              </Row>
            </Card>

            {/* Menu anterior */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card size="small" hoverable onClick={() => setActiveMenu('import')} style={{ cursor: 'pointer' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                      <DatabaseOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
                      <Title level={5} style={{ margin: 0 }}>Importar do DBDiagram</Title>
                    </Space>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Cole código do dbdiagram.io ou carregue arquivo .dbml
                    </Text>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" hoverable onClick={() => setActiveMenu('scanner')} style={{ cursor: 'pointer' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                      <ScanOutlined style={{ fontSize: '18px', color: '#52c41a' }} />
                      <Title level={5} style={{ margin: 0 }}>Carregar Projeto Existente</Title>
                    </Space>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Selecione projeto nocSharp para carregar entidades
                    </Text>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Space>
        );

      case 'import':
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Card title="� Importar do DBDiagram" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>Primeiro, selecione o diretório onde deseja criar o projeto:</Text>
                <Space>
                  <Input 
                    placeholder="Diretório selecionado aparecerá aqui" 
                    value={state.directoryPath} 
                    readOnly 
                    style={{ width: '300px' }}
                  />
                  <Button onClick={handleDBDiagramImport}>Selecionar Diretório</Button>
                </Space>
                
                {state.directoryPath && (
                  <>
                    <Text>Agora, faça upload do arquivo DBDiagram:</Text>
                    <DBDiagramUpload 
                      onEntitiesLoaded={(loadedEntities, fileName) => {
                        handleDBDiagramEntitiesLoaded(loadedEntities, fileName || 'dbdiagram');
                      }}
                      title="📊 Carregar Arquivo DBDiagram"
                      description="Faça upload de um arquivo .dbml para carregar entidades automaticamente"
                      onEntityComparison={handleEntityComparison}
                      existingEntities={entities}
                    />
                  </>
                )}
                
                {importedEntities.length > 0 && (
                  <Card title={`⚙️ Entidades Importadas - ${dbDiagramFileName}`} size="small" style={{ marginTop: '16px' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Alert
                        message={`${importedEntities.length} entidades foram importadas com sucesso!`}
                        description="Revise as entidades abaixo e clique em 'Criar Projeto' para gerar o projeto completo."
                        type="success"
                        showIcon
                        style={{ marginBottom: '16px' }}
                      />
                      
                      <EntityForm
                        entities={importedEntities}
                        addEntity={(entity) => setImportedEntities([...importedEntities, entity])}
                        updateEntityName={(index, name) => {
                          const updated = [...importedEntities];
                          updated[index].name = name;
                          setImportedEntities(updated);
                        }}
                        updateEntityBaseSkip={(index, baseSkip) => {
                          const updated = [...importedEntities];
                          updated[index].baseSkip = baseSkip;
                          setImportedEntities(updated);
                        }}
                        addProperty={(entityIndex, property) => {
                          const updated = [...importedEntities];
                          updated[entityIndex].properties.push(property);
                          setImportedEntities(updated);
                        }}
                        updateProperty={(entityIndex, propertyIndex, field, value) => {
                          const updated = [...importedEntities];
                          updated[entityIndex].properties[propertyIndex][field] = value;
                          setImportedEntities(updated);
                        }}
                        removeProperty={(entityIndex, propertyIndex) => {
                          const updated = [...importedEntities];
                          updated[entityIndex].properties.splice(propertyIndex, 1);
                          setImportedEntities(updated);
                        }}
                        removeEntity={(index) => {
                          const updated = importedEntities.filter((_, i) => i !== index);
                          setImportedEntities(updated);
                        }}
                        hideAddButton={false}
                        collapsible={true}
                      />
                      
                      <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <Button 
                          type="primary" 
                          size="large"
                          onClick={handleCreateProjectFromDBDiagram}
                          disabled={!state.directoryPath || importedEntities.length === 0}
                          style={{ minWidth: '200px' }}
                        >
                          🚀 Criar Projeto Completo
                        </Button>
                      </div>
                    </Space>
                  </Card>
                )}
              </Space>
            </Card>
          </Space>
        );

      case 'scanner':
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Card title="🔍 Entity Scanner" size="small">
              <EntityScanner 
                onEntitiesLoaded={handleLoadScannedEntities}
                onDirectorySelected={handleScannerDirectorySelected}
                onUpdateProject={handleUpdateProjectFromScanner}
                onLoadProject={handleLoadProjectFromScanner}
                onEntityComparison={handleEntityComparison}
                existingEntities={entities}
                onMergeEntities={(newEntities) => mergeEntities(newEntities, false)}
                onShowEntitiesComparison={handleShowScannerModal}
              />
            </Card>
          </Space>
        );

      case 'entities':
        // Filtrar BaseEntity da visualização
        const displayEntities = entities.filter(entity => entity.name !== 'BaseEntity');
        
        // Calcular entidades modificadas para exibição
        const getModifiedEntitiesCount = () => {
          if (originalEntities.length === 0) return 0;
          
          const nonBaseEntities = entities.filter(entity => entity.name !== 'BaseEntity');
          let modifiedCount = 0;
          
          nonBaseEntities.forEach(currentEntity => {
            const originalEntity = originalEntities.find(orig => orig.name === currentEntity.name);
            if (!originalEntity || JSON.stringify(currentEntity) !== JSON.stringify(originalEntity)) {
              modifiedCount++;
            }
          });
          
          return modifiedCount;
        };
        
        const modifiedCount = getModifiedEntitiesCount();
        
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Card title="⚙️ Configuração de Entidades" size="small">
              {state.directoryPath && state.isExistingProject && (
                <Alert
                  message="Sincronização Automática Ativa"
                  description={
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text>As entidades são automaticamente sincronizadas com o projeto quando você acessa esta tela.</Text>
                      <Text code style={{ fontSize: '11px' }}>
                        📂 Projeto: {state.directoryPath}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        ℹ️ BaseEntity é automaticamente filtrada da visualização
                      </Text>
                    </Space>
                  }
                  type="info"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              )}
              
              <EntityForm
                entities={displayEntities}
                addEntity={addEntity}
                updateEntityName={updateEntityName}
                updateEntityBaseSkip={updateEntityBaseSkip}
                addProperty={addProperty}
                updateProperty={handleUpdateProperty}
                removeProperty={removeProperty}
                removeEntity={removeEntity}
              />

              {/* Botão de atualizar no final da tela */}
              {state.directoryPath && state.isExistingProject && (
                <Card 
                  title="🔄 Controle de Atualizações" 
                  size="small" 
                  style={{ marginTop: '16px' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {/* Estatísticas das entidades */}
                    <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                      <Col span={8}>
                        <Statistic
                          title="Total de Entidades"
                          value={displayEntities.length}
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title="Entidades Modificadas"
                          value={modifiedCount}
                          valueStyle={{ color: hasEntityChanges ? '#faad14' : '#52c41a' }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title="Status"
                          value={hasEntityChanges ? 'Pendente' : 'Sincronizado'}
                          valueStyle={{ color: hasEntityChanges ? '#faad14' : '#52c41a' }}
                        />
                      </Col>
                    </Row>

                    {/* Estado das alterações */}
                    <div style={{ textAlign: 'center' }}>
                      {hasEntityChanges ? (
                        <>
                          <Alert
                            message={`⚠️ ${modifiedCount} ${modifiedCount === 1 ? 'entidade modificada' : 'entidades modificadas'}`}
                            description="Clique no botão abaixo para aplicar as alterações no projeto"
                            type="warning"
                            showIcon
                            style={{ marginBottom: '16px' }}
                          />
                          <Button 
                            type="primary" 
                            size="large"
                            onClick={handleUpdateModifiedEntities}
                            loading={isExecutingCommands}
                            disabled={isExecutingCommands}
                            style={{ minWidth: '250px' }}
                          >
                            {isExecutingCommands 
                              ? '🔄 Atualizando...' 
                              : `🚀 Atualizar ${modifiedCount} ${modifiedCount === 1 ? 'Entidade' : 'Entidades'}`
                            }
                          </Button>
                        </>
                      ) : (
                        <Alert
                          message="✅ Todas as entidades estão sincronizadas"
                          description="Não há alterações pendentes para aplicar no projeto"
                          type="success"
                          showIcon
                        />
                      )}
                    </div>
                  </Space>
                </Card>
              )}
            </Card>
          </Space>
        );

      case 'generator':
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <ScriptGenerator />
          </Space>
        );

      case 'templates':
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <EntityTemplates onApplyTemplate={handleApplyTemplate} />
          </Space>
        );

      case 'parser':
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <ParserTester />
          </Space>
        );

      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={180} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '12px 8px', textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0, fontSize: '16px' }}>nocSharp</Title>
          {state.projectName && (
            <Text strong style={{ fontSize: '14px', color: '#1890ff' }}>
              {state.projectName}
            </Text>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeMenu]}
          items={menuItems}
          onClick={({ key }) => setActiveMenu(key)}
          style={{ border: 'none', fontSize: '13px' }}
        />
      </Sider>
      
      <Layout>
        <Content style={{ padding: '12px', overflow: 'auto', maxHeight: '100vh' }}>
          {renderContent()}
        </Content>
      </Layout>

      {/* Modals */}
      {/* Modal para comparação de entidades */}
      <Modal
        title="📊 Comparação de Entidades"
        open={showEntitiesModal}
        onOk={() => setShowEntitiesModal(false)}
        onCancel={() => setShowEntitiesModal(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setShowEntitiesModal(false)}>
            Fechar
          </Button>
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="🏗️ Entidades Existentes no Projeto" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Total: {entitiesComparison.existing.length} entidades</Text>
                  {entitiesComparison.existing.map((entity, index) => (
                    <Card key={index} size="small" style={{ marginBottom: '8px' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong style={{ color: '#1890ff' }}>{entity.name}</Text>
                        <Text type="secondary">
                          {entity.properties.length} propriedades
                        </Text>
                        <div style={{ fontSize: '12px' }}>
                          {entity.properties.slice(0, 3).map((prop, i) => (
                            <Text key={i} code style={{ marginRight: '8px' }}>
                              {prop.name}: {prop.type}
                            </Text>
                          ))}
                          {entity.properties.length > 3 && (
                            <Text type="secondary">... +{entity.properties.length - 3} more</Text>
                          )}
                        </div>
                      </Space>
                    </Card>
                  ))}
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="✨ Novas Entidades a Serem Adicionadas" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Total: {entitiesComparison.new.length} entidades</Text>
                  {entitiesComparison.new.map((entity, index) => (
                    <Card key={index} size="small" style={{ marginBottom: '8px' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong style={{ color: '#52c41a' }}>{entity.name}</Text>
                        <Text type="secondary">
                          {entity.properties.length} propriedades
                        </Text>
                        <div style={{ fontSize: '12px' }}>
                          {entity.properties.slice(0, 3).map((prop, i) => (
                            <Text key={i} code style={{ marginRight: '8px' }}>
                              {prop.name}: {prop.type}
                            </Text>
                          ))}
                          {entity.properties.length > 3 && (
                            <Text type="secondary">... +{entity.properties.length - 3} more</Text>
                          )}
                        </div>
                      </Space>
                    </Card>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>
        </Space>
      </Modal>

      {/* Modal do Entity Scanner */}
      <Modal
        title="🔍 Entity Scanner - Atualizar Projeto"
        open={showScannerModal}
        onOk={handleExecuteScannerCommands}
        onCancel={() => setScannerModal(false)}
        width={1200}
        okText={isExecutingCommands ? "Executando..." : "🚀 Executar Comandos"}
        cancelText="Cancelar"
        confirmLoading={isExecutingCommands}
        okButtonProps={{ 
          disabled: isExecutingCommands || scannerModalData.commands.length === 0 
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Alert
            message={`Atualizando projeto: ${scannerModalData.projectName}`}
            description={
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>{`${scannerModalData.newEntities.length} novas entidades serão adicionadas ao projeto`}</Text>
                <Text code style={{ fontSize: '11px' }}>
                  📂 Diretório: {scannerModalData.projectPath}
                </Text>
              </Space>
            }
            type="info"
            showIcon
          />

          {/* Entidades Existentes e Novas */}
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="🏗️ Entidades Existentes no Projeto" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Total: {scannerModalData.existingEntities.length} entidades</Text>
                  <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                    {scannerModalData.existingEntities.map((entity, index) => (
                      <Card key={index} size="small" style={{ marginBottom: '8px' }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Text strong style={{ color: '#1890ff' }}>{entity.name}</Text>
                          <Text type="secondary">
                            {entity.properties.length} propriedades
                          </Text>
                          <div style={{ fontSize: '12px' }}>
                            {entity.properties.slice(0, 3).map((prop, i) => (
                              <Text key={i} code style={{ marginRight: '8px' }}>
                                {prop.name}: {prop.type}
                              </Text>
                            ))}
                            {entity.properties.length > 3 && (
                              <Text type="secondary">... +{entity.properties.length - 3} more</Text>
                            )}
                          </div>
                        </Space>
                      </Card>
                    ))}
                  </div>
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="✨ Novas Entidades a Serem Adicionadas" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Total: {scannerModalData.newEntities.length} entidades</Text>
                  <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                    {scannerModalData.newEntities.map((entity, index) => (
                      <Card key={index} size="small" style={{ marginBottom: '8px' }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Text strong style={{ color: '#52c41a' }}>{entity.name}</Text>
                          <Text type="secondary">
                            {entity.properties.length} propriedades
                          </Text>
                          <div style={{ fontSize: '12px' }}>
                            {entity.properties.slice(0, 3).map((prop, i) => (
                              <Text key={i} code style={{ marginRight: '8px' }}>
                                {prop.name}: {prop.type}
                              </Text>
                            ))}
                            {entity.properties.length > 3 && (
                              <Text type="secondary">... +{entity.properties.length - 3} more</Text>
                            )}
                          </div>
                        </Space>
                      </Card>
                    ))}
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Comandos a serem executados */}
          <Card title="📜 Comandos que serão executados:" size="small">
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              maxHeight: '250px',
              overflow: 'auto'
            }}>
              {scannerModalData.commands.length > 0 ? (
                scannerModalData.commands.map((command, index) => (
                  <div key={index} style={{ marginBottom: '8px' }}>
                    <Text style={{ color: '#666', fontSize: '11px' }}>#{index + 1}</Text><br />
                    <Text code>{command}</Text>
                  </div>
                ))
              ) : (
                <Text type="secondary">Nenhum comando será executado</Text>
              )}
            </div>

            {scannerModalData.commands.length > 0 && (
              <Alert
                message={`Total: ${scannerModalData.commands.length} comando(s) serão executados`}
                type="success"
                style={{ marginTop: '8px' }}
              />
            )}
          </Card>

          {isExecutingCommands && (
            <Card size="small">
              <Space>
                <Spin />
                <Text>Executando comandos... Por favor, aguarde.</Text>
              </Space>
            </Card>
          )}
        </Space>
      </Modal>

      {/* Modal principal de gerenciamento de projeto */}
      <Modal
        title="🚀 Gerenciar Projeto e Entidades"
        open={isModalVisible}
        onOk={handleConfirmCreation}
        onCancel={handleModalCancel}
        width={1000}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message={state.isExistingProject 
              ? `Adicionar ou atualizar entidades no projeto existente: ${state.projectName}`
              : `Criar novo projeto: ${state.projectName}`
            }
            type="info"
            showIcon
          />

          {/* Exibir entidades duplicadas logo no início */}
          {existingEntities.length > 0 && (
            <Card title="⚠️ Entidades Duplicadas Encontradas" size="small" style={{ marginBottom: '16px' }}>
              <Alert
                message="As seguintes entidades já existem no projeto"
                description="Escolha como proceder com cada entidade duplicada"
                type="warning"
                showIcon
                style={{ marginBottom: '12px' }}
              />
              <Form layout="vertical">
                {existingEntities.map((entity, index) => (
                  <Form.Item key={index} label={
                    <Space>
                      <Text strong>{entity.name}</Text>
                      <Text type="secondary">({entity.properties.length} propriedades)</Text>
                    </Space>
                  }>
                    <Select
                      value={overwriteChoices[entity.name]}
                      onChange={(value) => handleOverwriteChoiceChange(entity.name, value)}
                      style={{ width: '100%' }}
                    >
                      <Option value={false}>
                        <Space>
                          <Text>🔒 Manter Existente</Text>
                          <Text type="secondary">(não modificar)</Text>
                        </Space>
                      </Option>
                      <Option value={true}>
                        <Space>
                          <Text>🔄 Sobrescrever</Text>
                          <Text type="secondary">(substituir completamente)</Text>
                        </Space>
                      </Option>
                    </Select>
                  </Form.Item>
                ))}
              </Form>
            </Card>
          )}

          {/* Exibir comandos gerados */}
          <Card title="📜 Comandos que serão executados:" size="small">
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              maxHeight: '250px',
              overflow: 'auto'
            }}>
              {generateCommandsPreview().length > 0 ? (
                generateCommandsPreview().map((command, index) => (
                  <div key={index} style={{ marginBottom: '8px' }}>
                    <Text style={{ color: '#666', fontSize: '11px' }}>#{index + 1}</Text><br />
                    <Text code>{command}</Text>
                  </div>
                ))
              ) : (
                <Text type="secondary">Nenhum comando será executado</Text>
              )}
            </div>

            {generateCommandsPreview().length > 0 && (
              <Alert
                message={`Total: ${generateCommandsPreview().length} comando(s) serão executados`}
                type="success"
                style={{ marginTop: '8px' }}
              />
            )}
          </Card>
        </Space>
      </Modal>
    </Layout>
  );
};

export default Home;
