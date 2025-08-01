import React, { useState, useEffect } from 'react';
import { Space, Card, Row, Col, Statistic, Typography, Button, Badge, Divider, Modal, Form, Input, message, Alert, Spin } from 'antd';
import { 
  DatabaseOutlined, 
  ScanOutlined, 
  CodeOutlined, 
  FileTextOutlined, 
  SettingOutlined, 
  BarChartOutlined,
  ThunderboltOutlined,
  ApiOutlined,
  FolderOpenOutlined,
  PlusCircleOutlined,
  RocketOutlined,
  ProjectOutlined,
  EditOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { EntityChangeDetector } from '../../services/EntityChangeDetector';
import { Entity } from '../../models/Entity';
import { ProjectData } from '../../models/ProjectData';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppContext } from '../../contexts/AppContext';
import { createProject } from '../../services/ProjectService';
import { nocSharpCli, CliCheckResult } from '../../services/NocSharpCliService';

const { Title, Text } = Typography;

interface HomePageProps {
  projectName?: string;
  entities: Entity[];
  originalEntities?: Entity[];
  onMenuChange: (key: string) => void;
  onCreateNewProject?: (projectName: string, directoryPath: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({
  projectName,
  entities,
  originalEntities = [],
  onMenuChange,
  onCreateNewProject
}) => {
  const { isDarkMode } = useTheme();
  const { state, dispatch } = useAppContext();
  const [isCreateProjectModalVisible, setIsCreateProjectModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedDirectory, setSelectedDirectory] = useState<string>('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [cliStatus, setCliStatus] = useState<CliCheckResult | null>(null);
  const [isCheckingCli, setIsCheckingCli] = useState(false);
  
  const entityStats = EntityChangeDetector.calculateEntityStats(entities);
  const filteredEntities = EntityChangeDetector.filterNonBaseEntities(entities);
  
  // Verificar status do CLI nocsharp na inicialização
  useEffect(() => {
    checkCliStatus();
  }, []);
  
  // Usar EntityChangeDetector para detectar modificações corretamente
  const changeDetection = originalEntities.length > 0 && entities.length > 0 
    ? EntityChangeDetector.detectChanges(entities, originalEntities)
    : { 
        hasChanges: false, 
        addedEntities: [] as Entity[], 
        modifiedEntities: [] as Entity[], 
        removedEntities: [] as Entity[],
        modifiedCount: 0 
      };
  
  const newEntitiesCount = changeDetection.addedEntities.length;
  const modifiedEntitiesCount = changeDetection.modifiedEntities.length;
  
  // Cores frias e sobrias
  const colors = {
    primary: '#4A90E2',      // Azul acinzentado
    secondary: '#5D6D7E',    // Cinza azulado
    accent: '#52648B',       // Azul escuro
    success: '#2E8B57',      // Verde mar
    warning: '#708090',      // Cinza ardósia
    info: '#36648B',         // Azul aço
    text: isDarkMode ? '#E8F4FD' : '#2C3E50',
    background: isDarkMode ? '#1A1A1A' : '#F8FAFC'
  };

  // Handlers para criação de projeto
  const checkCliStatus = async () => {
    setIsCheckingCli(true);
    try {
      const status = await nocSharpCli.checkCliAvailability(false); // Force check without cache
      setCliStatus(status);
    } catch (error) {
      console.error('Erro ao verificar CLI:', error);
      setCliStatus({
        isAvailable: false,
        error: 'Erro ao verificar nocsharp CLI'
      });
    } finally {
      setIsCheckingCli(false);
    }
  };

  const handleCreateProjectClick = () => {
    if (!cliStatus?.isAvailable) {
      message.error('nocsharp CLI não está disponível. Por favor, instale o CLI antes de criar projetos.');
      return;
    }
    setIsCreateProjectModalVisible(true);
  };

  const handleSelectDirectory = async () => {
    try {
      // Usar a API do Electron para selecionar diretório
      const result = await window.electron.dialog.showOpenDialog({
        properties: ['openDirectory']
      });
      if (result && !result.canceled && result.filePaths.length > 0) {
        setSelectedDirectory(result.filePaths[0]);
        form.setFieldsValue({ directoryPath: result.filePaths[0] });
      }
    } catch (error) {
      console.error('Erro ao selecionar diretório:', error);
      message.error('Erro ao selecionar diretório');
    }
  };

  const handleCreateProject = async () => {
    try {
      console.log('🚀 Iniciando processo de criação de projeto...');
      
      const values = await form.validateFields();
      const { projectName: newProjectName } = values;
      
      console.log('📝 Dados do formulário validados:', { newProjectName, selectedDirectory });
      
      if (!selectedDirectory) {
        message.error('Por favor, selecione um diretório para o projeto');
        return;
      }

      setIsCreatingProject(true);
      message.loading('Criando projeto...', 0);

      // Criar dados básicos do projeto
      const projectData: ProjectData = {
        projectName: newProjectName,
        entities: [] // Começar com zero entidades
      };

      console.log('📦 Dados do projeto preparados:', projectData);
      console.log('📂 Diretório selecionado:', selectedDirectory);

      // Chamar o serviço de criação de projeto
      console.log('🔧 Chamando serviço de criação de projeto...');
      const result = await createProject(
        projectData,
        selectedDirectory,
        true, // executeCommands = true para realmente criar o projeto
        false, // isExistingProject = false pois é um novo projeto
        {} // overwriteChoices vazio
      );

      console.log('📊 Resultado da criação:', result);

      // Remover loading message
      message.destroy();

      if (result.success) {
        console.log('✅ Projeto criado com sucesso!');
        
        // Atualizar o contexto global com sucesso
        const projectPath = `${selectedDirectory}\\${newProjectName}`;
        console.log('📍 Caminho do projeto:', projectPath);
        
        dispatch({ type: 'SET_PROJECT_NAME', payload: newProjectName });
        dispatch({ type: 'SET_DIRECTORY_PATH', payload: projectPath });
        dispatch({ type: 'SET_IS_EXISTING_PROJECT', payload: false });
        dispatch({ type: 'SET_ENTITIES', payload: [] }); // Começar com zero entidades

        // Fechar o modal
        setIsCreateProjectModalVisible(false);
        form.resetFields();
        setSelectedDirectory('');

        // Chamar callback se fornecido
        if (onCreateNewProject) {
          console.log('📞 Chamando callback onCreateNewProject...');
          await onCreateNewProject(newProjectName, projectPath);
        }

        // Mostrar logs de sucesso
        if (result.logs.length > 0) {
          console.log('📝 Adicionando logs ao contexto:', result.logs);
          result.logs.forEach(log => {
            dispatch({ type: 'ADD_LOG', payload: log });
          });
        }

        // Redirecionar para scanner para começar a editar entidades
        message.success(`Projeto "${newProjectName}" criado com sucesso! Agora você pode adicionar entidades.`);
        console.log('🔄 Redirecionando para scanner...');
        onMenuChange('scanner');
        
      } else {
        // Mostrar erros
        console.error('❌ Erro ao criar projeto:', result.errors);
        
        if (result.errors.length > 0) {
          result.errors.forEach(error => {
            dispatch({ type: 'ADD_ERROR', payload: error });
          });
          message.error(`Erro ao criar projeto: ${result.errors[0]}`);
        } else {
          message.error('Erro desconhecido ao criar projeto');
        }
      }
      
    } catch (error) {
      console.error('❌ Erro inesperado ao criar projeto:', error);
      message.destroy();
      message.error(`Erro inesperado: ${error.message}`);
    } finally {
      setIsCreatingProject(false);
      console.log('🏁 Processo de criação finalizado');
    }
  };

  const handleCancelCreateProject = () => {
    setIsCreateProjectModalVisible(false);
    form.resetFields();
    setSelectedDirectory('');
  };

  const quickActions = [
    {
      key: 'create-project',
      title: 'Criar Novo Projeto',
      description: 'Crie um novo projeto nocSharp do zero com suas entidades',
      icon: <ProjectOutlined />,
      color: colors.accent,
      gradient: `linear-gradient(135deg, ${colors.accent} 0%, #4682B4 100%)`,
      tag: 'Novo',
      onClick: handleCreateProjectClick
    },
    {
      key: 'import',
      title: 'Importar DBDiagram',
      description: 'Cole código do dbdiagram.io ou carregue arquivo .dbml',
      icon: <DatabaseOutlined />,
      color: colors.primary,
      gradient: `linear-gradient(135deg, ${colors.primary} 0%, #3A7BD5 100%)`,
      tag: 'Rápido'
    },
    {
      key: 'scanner',
      title: 'Carregar Projeto',
      description: 'Escaneie projeto nocSharp existente para carregar entidades',
      icon: <ScanOutlined />,
      color: colors.success,
      gradient: `linear-gradient(135deg, ${colors.success} 0%, #228B22 100%)`,
      tag: 'Análise'
    },
    {
      key: 'dashboard',
      title: 'Dashboard .NET',
      description: 'Monitore métricas do projeto e arquitetura em tempo real',
      icon: <BarChartOutlined />,
      color: colors.info,
      gradient: `linear-gradient(135deg, ${colors.info} 0%, #4682B4 100%)`,
      tag: 'Análise'
    }
  ];

  return (
    <div style={{
      padding: '24px',
      background: colors.background,
      minHeight: '100vh'
    }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Header Principal */}
        <Card 
          className="animate-fade-in-scale shadow-soft"
          style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
              : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            border: isDarkMode ? '1px solid #374151' : '1px solid #cbd5e1',
            borderRadius: '16px',
            boxShadow: isDarkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <Row align="middle" justify="space-between">
            <Col>
              <Space align="center" size="large">
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${colors.primary} 0%, #3A7BD5 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 24px ${colors.primary}30`
                }}>
                  <RocketOutlined style={{ fontSize: '32px', color: 'white' }} />
                </div>
                <div>
                  <Title 
                    level={2} 
                    className="text-gradient"
                    style={{ 
                      margin: 0,
                      fontSize: '28px'
                    }}
                  >
                    nocSharp Generator
                  </Title>
                  <Text 
                    style={{ 
                      fontSize: '16px',
                      color: isDarkMode ? '#94A3B8' : '#64748B',
                      fontWeight: '500'
                    }}
                  >
                    Plataforma de desenvolvimento .NET para desenvolvedores
                  </Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Space size="large" direction="vertical" align="end">
                <Badge 
                  status={projectName ? 'success' : 'default'} 
                  text={
                    <Text strong style={{ 
                      color: projectName 
                        ? (isDarkMode ? colors.primary : colors.accent)
                        : (isDarkMode ? '#6B7280' : '#9CA3AF'),
                      fontSize: '14px'
                    }}>
                      {projectName ? 'Projeto Carregado' : 'Nenhum Projeto'}
                    </Text>
                  }
                />
                
                {/* Status do CLI nocsharp */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isCheckingCli ? (
                    <Spin size="small" />
                  ) : cliStatus?.isAvailable ? (
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                  ) : (
                    <WarningOutlined style={{ color: '#faad14', fontSize: '16px' }} />
                  )}
                  
                  <Text style={{ 
                    color: isCheckingCli 
                      ? (isDarkMode ? '#94A3B8' : '#64748B')
                      : cliStatus?.isAvailable 
                        ? '#52c41a' 
                        : '#faad14',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    {isCheckingCli 
                      ? 'Verificando CLI...'
                      : cliStatus?.isAvailable 
                        ? `nocsharp CLI ${cliStatus.version ? `(${cliStatus.version})` : 'disponível'}`
                        : 'nocsharp CLI indisponível'
                    }
                  </Text>
                  
                  <Button 
                    type="text" 
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={checkCliStatus}
                    loading={isCheckingCli}
                    style={{ 
                      color: colors.primary,
                      padding: '4px'
                    }}
                    title="Verificar novamente"
                  />
                </div>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Status do Projeto */}
        {projectName && (
          <Card
            className="animate-fade-in-up shadow-soft"
            title={
              <Space>
                <CodeOutlined style={{ color: colors.primary }} />
                <Text strong style={{ color: colors.text, fontSize: '16px' }}>
                  Status do Projeto: {projectName}
                </Text>
              </Space>
            }
            style={{
              borderRadius: '12px',
              backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
              borderColor: isDarkMode ? '#374151' : '#e2e8f0'
            }}
          >
            <Row gutter={[32, 16]}>
              <Col xs={24} sm={6}>
                <Statistic
                  title={
                    <Text style={{ 
                      color: isDarkMode ? '#94A3B8' : '#64748B',
                      fontSize: '13px'
                    }}>
                      Entidades
                    </Text>
                  }
                  value={filteredEntities.length}
                  valueStyle={{ 
                    color: colors.primary,
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}
                  prefix={<DatabaseOutlined />}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title={
                    <Text style={{ 
                      color: isDarkMode ? '#94A3B8' : '#64748B',
                      fontSize: '13px'
                    }}>
                      Propriedades
                    </Text>
                  }
                  value={entityStats.totalProperties}
                  valueStyle={{ 
                    color: colors.accent,
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}
                  prefix={<SettingOutlined />}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title={
                    <Text style={{ 
                      color: isDarkMode ? '#94A3B8' : '#64748B',
                      fontSize: '13px'
                    }}>
                      Novas
                    </Text>
                  }
                  value={newEntitiesCount}
                  valueStyle={{ 
                    color: '#52c41a',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}
                  prefix={<PlusCircleOutlined />}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title={
                    <Text style={{ 
                      color: isDarkMode ? '#94A3B8' : '#64748B',
                      fontSize: '13px'
                    }}>
                      Modificadas
                    </Text>
                  }
                  value={modifiedEntitiesCount}
                  valueStyle={{ 
                    color: '#faad14',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}
                  prefix={<ApiOutlined />}
                />
              </Col>
            </Row>
          </Card>
        )}

        {/* Ações Rápidas */}
        <div>
          <Title level={3} style={{ 
            color: colors.text,
            marginBottom: '24px',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            Ações Rápidas
          </Title>

          {/* Alerta sobre CLI se não estiver disponível */}
          {cliStatus && !cliStatus.isAvailable && (
            <Alert
              message="nocsharp CLI não encontrado"
              description={
                <div>
                  <Text>
                    Para criar novos projetos, você precisa instalar o nocsharp CLI. 
                    {cliStatus.error && ` Erro: ${cliStatus.error}`}
                  </Text>
                  <div style={{ marginTop: '12px' }}>
                    <Text strong>Instruções de instalação:</Text>
                    <ul style={{ marginTop: '8px', marginBottom: '0' }}>
                      <li>Baixe o nocsharp CLI do repositório oficial</li>
                      <li>Adicione o executável ao PATH do sistema</li>
                      <li>Reinicie o terminal e teste com: <code>nocsharp --version</code></li>
                      <li>Clique no botão de recarregar acima para verificar novamente</li>
                    </ul>
                  </div>
                </div>
              }
              type="warning"
              showIcon
              style={{
                marginBottom: '24px',
                backgroundColor: isDarkMode ? '#1e293b' : '#fff7e6',
                borderColor: isDarkMode ? '#374151' : '#ffd591'
              }}
            />
          )}
          
          <Row gutter={[24, 24]}>
            {quickActions.map((action, index) => {
              const isCreateProject = action.key === 'create-project';
              const isDisabled = isCreateProject && !cliStatus?.isAvailable;
              
              return (
                <Col xs={24} sm={12} lg={6} key={action.key}>
                  <Card
                    hoverable={!isDisabled}
                    onClick={() => {
                      if (isDisabled) return;
                      action.onClick ? action.onClick() : onMenuChange(action.key);
                    }}
                    style={{
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      borderRadius: '12px',
                      height: '220px',
                      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                      borderColor: isDarkMode ? '#374151' : '#e2e8f0',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      opacity: isDisabled ? 0.6 : 1,
                    }}
                    className="quick-action-card"
                  >
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    width: '60px',
                    height: '60px',
                    background: action.gradient,
                    borderRadius: '0 12px 0 100%',
                    opacity: 0.1
                  }} />
                  
                  <div>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: action.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      boxShadow: `0 4px 16px ${action.color}30`
                    }}>
                      {React.cloneElement(action.icon, {
                        style: { fontSize: '24px', color: 'white' }
                      })}
                    </div>
                    
                    <Title level={5} style={{ 
                      margin: '0 0 8px 0',
                      color: colors.text,
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      {action.title}
                    </Title>
                    
                    <Text style={{ 
                      color: isDarkMode ? '#94A3B8' : '#64748B',
                      fontSize: '13px',
                      lineHeight: '1.5'
                    }}>
                      {action.description}
                    </Text>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: '16px',
                  }}>
                    <Badge 
                      color={action.color}
                      text={
                        <Text style={{ 
                          color: isDarkMode ? '#94A3B8' : '#64748B',
                          fontSize: '12px'
                        }}>
                          {isDisabled ? 'CLI Necessário' : action.tag}
                        </Text>
                      }
                    />
                    {isDisabled ? (
                      <WarningOutlined style={{ 
                        color: '#faad14',
                        fontSize: '16px'
                      }} />
                    ) : (
                      <ThunderboltOutlined style={{ 
                        color: action.color,
                        fontSize: '16px'
                      }} />
                    )}
                  </div>
                </Card>
              </Col>
            );
            })}
          </Row>
        </div>
      </Space>

      {/* Modal de Criação de Projeto */}
      <Modal
        title={
          <Space>
            <ProjectOutlined style={{ color: colors.primary }} />
            <span>Criar Novo Projeto</span>
          </Space>
        }
        open={isCreateProjectModalVisible}
        onOk={handleCreateProject}
        onCancel={handleCancelCreateProject}
        okText={isCreatingProject ? "Criando..." : "Criar Projeto"}
        cancelText="Cancelar"
        width={600}
        confirmLoading={isCreatingProject}
        style={{
          borderRadius: '12px'
        }}
      >
        <div style={{ padding: '20px 0' }}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              projectName: '',
              directoryPath: ''
            }}
          >
            <Form.Item
              label={
                <Text strong style={{ color: colors.text }}>
                  Nome do Projeto
                </Text>
              }
              name="projectName"
              rules={[
                { required: true, message: 'Por favor, insira o nome do projeto' },
                { min: 3, message: 'O nome deve ter pelo menos 3 caracteres' },
                { 
                  pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, 
                  message: 'Nome deve começar com letra e conter apenas letras, números e underscores' 
                }
              ]}
            >
              <Input
                placeholder="Ex: MeuProjetoAPI"
                size="large"
                prefix={<EditOutlined style={{ color: colors.primary }} />}
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item
              label={
                <Text strong style={{ color: colors.text }}>
                  Diretório do Projeto
                </Text>
              }
              name="directoryPath"
              rules={[
                { required: true, message: 'Por favor, selecione o diretório do projeto' }
              ]}
            >
              <Input
                placeholder="Selecione o diretório onde o projeto será criado"
                size="large"
                readOnly
                value={selectedDirectory}
                suffix={
                  <Button 
                    type="primary" 
                    icon={<FolderOpenOutlined />}
                    onClick={handleSelectDirectory}
                    style={{
                      background: colors.primary,
                      borderColor: colors.primary,
                      borderRadius: '6px'
                    }}
                  >
                    Selecionar
                  </Button>
                }
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default HomePage;
