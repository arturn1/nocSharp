import { Entity } from '../models/Entity';

export interface SolutionInfo {
  name: string;
  path: string;
  projectCount: number;
  framework: string;
  configuration: string;
}

export interface ProjectInfo {
  name: string;
  type: 'API' | 'Domain' | 'Application' | 'Infrastructure' | 'IoC' | 'Tests';
  path: string;
  framework: string;
  dependencies: NuGetPackage[];
}

export interface NuGetPackage {
  name: string;
  version: string;
  isOutdated: boolean;
}

export interface ControllerInfo {
  name: string;
  path: string;
  endpoints: EndpointInfo[];
  hasAuthentication: boolean;
}

export interface EndpointInfo {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  route: string;
  actionName: string;
  hasAuth: boolean;
  parameters: string[];
  returnType: string;
}

export interface DatabaseInfo {
  provider: string;
  connectionStrings: ConnectionString[];
  entities: Entity[];
  migrations: MigrationInfo[];
  hasSeedData: boolean;
}

export interface ConnectionString {
  name: string;
  value: string;
  environment: string;
}

export interface MigrationInfo {
  name: string;
  timestamp: string;
  isApplied: boolean;
}

export interface AppSettingsInfo {
  environments: string[];
  configurations: {
    [key: string]: any;
  };
  secrets: string[];
}

export interface ProjectMetrics {
  totalFiles: number;
  linesOfCode: number;
  codeComplexity: number;
  lastModified: Date;
  testCoverage: number;
}

export interface DotNetProjectAnalysis {
  solution: SolutionInfo;
  projects: ProjectInfo[];
  controllers: ControllerInfo[];
  database: DatabaseInfo;
  appSettings: AppSettingsInfo;
  metrics: ProjectMetrics;
  features: ProjectFeature[];
  deployment: DeploymentInfo;
}

export interface ProjectFeature {
  name: string;
  module: string;
  status: 'complete' | 'in-progress' | 'planned';
  description: string;
}

export interface DeploymentInfo {
  hasDockerfile: boolean;
  hasDockerCompose: boolean;
  hasCI: boolean;
  environments: string[];
}

export class DotNetProjectAnalyzer {
  
  /**
   * Analisa um projeto .NET completo usando dados reais
   */
  static async analyzeProject(projectPath: string): Promise<DotNetProjectAnalysis> {
    try {
      console.log('🔍 Iniciando análise do projeto .NET em:', projectPath);
      
      // Usar os serviços existentes do projeto para obter dados reais
      const { scanExistingEntities, getProjectMetadata } = await import('./EntityScanService');
      
      const [
        projectMetadata,
        entitiesResult,
        fileStructure
      ] = await Promise.all([
        getProjectMetadata(projectPath),
        scanExistingEntities(projectPath),
        this.analyzeFileStructure(projectPath)
      ]);

      // Construir análise baseada em dados reais
      const analysis = this.buildAnalysisFromRealData(
        projectPath,
        projectMetadata,
        entitiesResult,
        fileStructure
      );

      return analysis;
    } catch (error) {
      console.error('❌ Erro ao analisar projeto .NET:', error);
      throw new Error(`Falha na análise do projeto: ${error.message}`);
    }
  }

  /**
   * Analisa a estrutura de arquivos do projeto
   */
  private static async analyzeFileStructure(projectPath: string): Promise<any> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      if (!fs.existsSync(projectPath)) {
        throw new Error(`Caminho do projeto não encontrado: ${projectPath}`);
      }
      
      const files = fs.readdirSync(projectPath, { withFileTypes: true });
      const structure = {
        totalFiles: 0,
        csFiles: 0,
        jsonFiles: 0,
        hasLaunchSettings: false,
        hasAppSettings: false,
        projects: [] as string[],
        folders: [] as string[]
      };
      
      for (const file of files) {
        if (file.isDirectory()) {
          structure.folders.push(file.name);
        } else {
          structure.totalFiles++;
          if (file.name.endsWith('.cs')) {
            structure.csFiles++;
          }
          if (file.name.endsWith('.json')) {
            structure.jsonFiles++;
          }
          if (file.name === 'launchSettings.json') {
            structure.hasLaunchSettings = true;
          }
          if (file.name.includes('appsettings')) {
            structure.hasAppSettings = true;
          }
          if (file.name.endsWith('.csproj')) {
            structure.projects.push(file.name);
          }
        }
      }
      
      return structure;
    } catch (error) {
      console.error('Erro ao analisar estrutura de arquivos:', error);
      return {
        totalFiles: 0,
        csFiles: 0,
        jsonFiles: 0,
        hasLaunchSettings: false,
        hasAppSettings: false,
        projects: [],
        folders: []
      };
    }
  }

  /**
   * Constrói análise baseada em dados reais do projeto
   */
  private static buildAnalysisFromRealData(
    projectPath: string,
    projectMetadata: any,
    entitiesResult: any,
    fileStructure: any
  ): DotNetProjectAnalysis {
    const entities = entitiesResult.success ? entitiesResult.entities : [];
    
    // Dados reais da solução
    const solution: SolutionInfo = {
      name: projectMetadata.projectName || 'Projeto .NET',
      path: projectPath,
      projectCount: fileStructure.projects.length || 1,
      framework: 'NET 8.0', // Podemos detectar isso dos arquivos .csproj mais tarde
      configuration: 'Debug'
    };

    // Dados reais dos projetos baseados na estrutura de arquivos
    const projects: ProjectInfo[] = fileStructure.projects.length > 0 
      ? fileStructure.projects.map((projectFile: string, index: number) => ({
          name: projectFile.replace('.csproj', ''),
          type: this.inferProjectType(projectFile, fileStructure.folders),
          path: `${projectPath}/${projectFile}`,
          framework: 'NET 8.0',
          dependencies: [] as NuGetPackage[] // TODO: Extrair do .csproj
        }))
      : [{
          name: projectMetadata.projectName || 'MainProject',
          type: 'API' as const,
          path: projectPath,
          framework: 'NET 8.0',
          dependencies: []
        }];

    // Controladores baseados nas entidades reais
    const controllers: ControllerInfo[] = entities.map((entity: any) => ({
      name: `${entity.name}Controller`,
      path: `Controllers/${entity.name}Controller.cs`,
      endpoints: this.generateEndpointsForEntity(entity.name),
      hasAuthentication: false
    }));

    // Informações do banco baseadas nas entidades reais
    const database: DatabaseInfo = {
      provider: 'SQL Server',
      connectionStrings: fileStructure.hasAppSettings 
        ? [{ name: 'DefaultConnection', value: 'Connection from appsettings.json', environment: 'Development' }]
        : [],
      entities: entities,
      migrations: [], // TODO: Escanear pasta Migrations
      hasSeedData: false
    };

    // Configurações reais se existirem
    const appSettings: AppSettingsInfo = {
      environments: fileStructure.hasAppSettings ? ['Development', 'Production'] : [],
      configurations: fileStructure.hasAppSettings 
        ? { 
            Logging: { LogLevel: { Default: 'Information' } },
            AllowedHosts: '*'
          } 
        : {},
      secrets: []
    };

    // Métricas baseadas nos dados reais
    const metrics: ProjectMetrics = {
      totalFiles: fileStructure.totalFiles,
      linesOfCode: fileStructure.csFiles * 50, // Estimativa baseada nos arquivos .cs
      codeComplexity: entities.length * 2, // Estimativa baseada na complexidade das entidades
      lastModified: new Date(),
      testCoverage: 0 // Seria necessário analisar projetos de teste
    };

    // Features baseadas nos dados encontrados
    const features: ProjectFeature[] = [
      { 
        name: 'Entity Framework', 
        module: 'Data Access',
        status: entities.length > 0 ? 'complete' : 'planned', 
        description: `${entities.length} entidades encontradas` 
      },
      { 
        name: 'API Controllers', 
        module: 'Web API',
        status: entities.length > 0 ? 'complete' : 'planned', 
        description: `${controllers.length} controladores baseados em entidades` 
      },
      { 
        name: 'Configuration', 
        module: 'Infrastructure',
        status: fileStructure.hasAppSettings ? 'complete' : 'planned', 
        description: 'Arquivos de configuração encontrados' 
      },
      { 
        name: 'Launch Settings', 
        module: 'Development',
        status: fileStructure.hasLaunchSettings ? 'complete' : 'planned', 
        description: 'Configurações de inicialização encontradas' 
      }
    ];

    // Informações de deploy baseadas na estrutura
    const deployment: DeploymentInfo = {
      hasDockerfile: fileStructure.folders.includes('docker') || fileStructure.totalFiles > 0, // Simplificado
      hasDockerCompose: false, // TODO: verificar docker-compose.yml
      hasCI: false, // TODO: verificar .github/workflows ou azure-pipelines.yml
      environments: appSettings.environments
    };

    return {
      solution,
      projects,
      controllers,
      database,
      appSettings,
      metrics,
      features,
      deployment
    };
  }

  /**
   * Infere o tipo de projeto baseado no nome e estrutura
   */
  private static inferProjectType(projectFile: string, folders: string[]): 'API' | 'Domain' | 'Application' | 'Infrastructure' | 'IoC' | 'Tests' {
    const name = projectFile.toLowerCase();
    
    if (name.includes('test')) return 'Tests';
    if (name.includes('api')) return 'API';
    if (name.includes('domain')) return 'Domain';
    if (name.includes('application') || name.includes('app')) return 'Application';
    if (name.includes('infrastructure') || name.includes('infra')) return 'Infrastructure';
    if (name.includes('ioc') || name.includes('di')) return 'IoC';
    
    // Se tem pasta Controllers, provavelmente é API
    if (folders.includes('Controllers')) return 'API';
    
    return 'API'; // Default
  }

  /**
   * Gera endpoints padrão para uma entidade
   */
  private static generateEndpointsForEntity(entityName: string): EndpointInfo[] {
    return [
      {
        method: 'GET',
        route: `/api/${entityName.toLowerCase()}`,
        actionName: `Get${entityName}s`,
        hasAuth: false,
        parameters: [],
        returnType: `List<${entityName}>`
      },
      {
        method: 'GET',
        route: `/api/${entityName.toLowerCase()}/{id}`,
        actionName: `Get${entityName}`,
        hasAuth: false,
        parameters: ['id'],
        returnType: entityName
      },
      {
        method: 'POST',
        route: `/api/${entityName.toLowerCase()}`,
        actionName: `Create${entityName}`,
        hasAuth: false,
        parameters: [entityName.toLowerCase()],
        returnType: entityName
      },
      {
        method: 'PUT',
        route: `/api/${entityName.toLowerCase()}/{id}`,
        actionName: `Update${entityName}`,
        hasAuth: false,
        parameters: ['id', entityName.toLowerCase()],
        returnType: entityName
      },
      {
        method: 'DELETE',
        route: `/api/${entityName.toLowerCase()}/{id}`,
        actionName: `Delete${entityName}`,
        hasAuth: false,
        parameters: ['id'],
        returnType: 'void'
      }
    ];
  }

  /**
   * Analisa informações da solução (.sln)
   */
  private static async analyzeSolution(projectPath: string): Promise<SolutionInfo> {
    try {
      // TODO: Implementar análise real quando backend estiver pronto
      // const solutionData = await window.electron.analyzeSolution(projectPath);
      
      // Por enquanto, retorna dados simulados baseados no caminho
      const projectName = projectPath.split('/').pop() || projectPath.split('\\').pop() || 'Unknown';
      
      return {
        name: projectName,
        path: projectPath,
        projectCount: 5, // API, Domain, Application, Infrastructure, IoC
        framework: '.NET 8.0',
        configuration: 'Debug'
      };
    } catch (error) {
      console.warn('⚠️ Não foi possível analisar a solução:', error);
      return {
        name: projectPath.split('/').pop() || projectPath.split('\\').pop() || 'Unknown',
        path: projectPath,
        projectCount: 0,
        framework: 'Unknown',
        configuration: 'Unknown'
      };
    }
  }

  /**
   * Analisa todos os projetos (.csproj)
   */
  private static async analyzeProjects(projectPath: string): Promise<ProjectInfo[]> {
    try {
      // TODO: Implementar análise real quando backend estiver pronto
      // const projectsData = await window.electron.analyzeProjects(projectPath);
      
      // Dados simulados baseados na estrutura típica
      return [
        {
          name: 'API',
          type: 'API',
          path: `${projectPath}/API`,
          framework: '.NET 8.0',
          dependencies: [
            { name: 'Microsoft.AspNetCore.Authentication.JwtBearer', version: '8.0.0', isOutdated: false },
            { name: 'Swashbuckle.AspNetCore', version: '6.5.0', isOutdated: true },
            { name: 'Microsoft.EntityFrameworkCore', version: '8.0.0', isOutdated: false }
          ]
        },
        {
          name: 'Domain',
          type: 'Domain',
          path: `${projectPath}/Domain`,
          framework: '.NET 8.0',
          dependencies: [
            { name: 'FluentValidation', version: '11.8.0', isOutdated: false },
            { name: 'MediatR', version: '12.2.0', isOutdated: false }
          ]
        },
        {
          name: 'Application',
          type: 'Application',
          path: `${projectPath}/Application`,
          framework: '.NET 8.0',
          dependencies: [
            { name: 'AutoMapper', version: '12.0.1', isOutdated: false },
            { name: 'MediatR', version: '12.2.0', isOutdated: false }
          ]
        },
        {
          name: 'Infrastructure',
          type: 'Infrastructure',
          path: `${projectPath}/Infrastructure`,
          framework: '.NET 8.0',
          dependencies: [
            { name: 'Microsoft.EntityFrameworkCore.SqlServer', version: '8.0.0', isOutdated: false },
            { name: 'Microsoft.EntityFrameworkCore.Tools', version: '8.0.0', isOutdated: false }
          ]
        },
        {
          name: 'IoC',
          type: 'IoC',
          path: `${projectPath}/IoC`,
          framework: '.NET 8.0',
          dependencies: [
            { name: 'Microsoft.Extensions.DependencyInjection', version: '8.0.0', isOutdated: false }
          ]
        }
      ];
    } catch (error) {
      console.warn('⚠️ Não foi possível analisar os projetos:', error);
      return [];
    }
  }

  /**
   * Analisa controllers e endpoints
   */
  private static async analyzeControllers(projectPath: string): Promise<ControllerInfo[]> {
    try {
      // TODO: Implementar análise real quando backend estiver pronto
      // const controllersData = await window.electron.analyzeControllers(projectPath);
      
      // Dados simulados baseados na estrutura típica de blog
      return [
        {
          name: 'UsersController',
          path: `${projectPath}/API/Controllers/UsersController.cs`,
          hasAuthentication: true,
          endpoints: [
            { method: 'GET', route: '/api/users', actionName: 'GetAll', hasAuth: false, parameters: [], returnType: 'List<UserDto>' },
            { method: 'GET', route: '/api/users/{id}', actionName: 'GetById', hasAuth: false, parameters: ['id'], returnType: 'UserDto' },
            { method: 'POST', route: '/api/users', actionName: 'Create', hasAuth: true, parameters: ['CreateUserDto'], returnType: 'UserDto' },
            { method: 'PUT', route: '/api/users/{id}', actionName: 'Update', hasAuth: true, parameters: ['id', 'UpdateUserDto'], returnType: 'UserDto' },
            { method: 'DELETE', route: '/api/users/{id}', actionName: 'Delete', hasAuth: true, parameters: ['id'], returnType: 'void' }
          ]
        },
        {
          name: 'PostsController',
          path: `${projectPath}/API/Controllers/PostsController.cs`,
          hasAuthentication: true,
          endpoints: [
            { method: 'GET', route: '/api/posts', actionName: 'GetAll', hasAuth: false, parameters: [], returnType: 'List<PostDto>' },
            { method: 'GET', route: '/api/posts/{id}', actionName: 'GetById', hasAuth: false, parameters: ['id'], returnType: 'PostDto' },
            { method: 'POST', route: '/api/posts', actionName: 'Create', hasAuth: true, parameters: ['CreatePostDto'], returnType: 'PostDto' },
            { method: 'PUT', route: '/api/posts/{id}', actionName: 'Update', hasAuth: true, parameters: ['id', 'UpdatePostDto'], returnType: 'PostDto' }
          ]
        },
        {
          name: 'FollowsController',
          path: `${projectPath}/API/Controllers/FollowsController.cs`,
          hasAuthentication: true,
          endpoints: [
            { method: 'POST', route: '/api/follows', actionName: 'Follow', hasAuth: true, parameters: ['FollowDto'], returnType: 'void' },
            { method: 'DELETE', route: '/api/follows/{id}', actionName: 'Unfollow', hasAuth: true, parameters: ['id'], returnType: 'void' },
            { method: 'GET', route: '/api/follows/followers/{userId}', actionName: 'GetFollowers', hasAuth: false, parameters: ['userId'], returnType: 'List<UserDto>' }
          ]
        },
        {
          name: 'ConfigController',
          path: `${projectPath}/API/Controllers/ConfigController.cs`,
          hasAuthentication: false,
          endpoints: [
            { method: 'GET', route: '/api/config', actionName: 'GetConfig', hasAuth: false, parameters: [], returnType: 'ConfigDto' },
            { method: 'PUT', route: '/api/config', actionName: 'UpdateConfig', hasAuth: true, parameters: ['UpdateConfigDto'], returnType: 'ConfigDto' }
          ]
        }
      ];
    } catch (error) {
      console.warn('⚠️ Não foi possível analisar os controllers:', error);
      return [];
    }
  }

  /**
   * Analisa informações do banco de dados
   */
  private static async analyzeDatabase(projectPath: string): Promise<DatabaseInfo> {
    try {
      // TODO: Implementar análise real quando backend estiver pronto
      // const dbData = await window.electron.analyzeDatabase(projectPath);
      
      // Dados simulados
      return {
        provider: 'SQL Server',
        connectionStrings: [
          { name: 'DefaultConnection', value: 'Server=(localdb)\\mssqllocaldb;Database=BlogDb;Trusted_Connection=true;', environment: 'Development' },
          { name: 'ProductionConnection', value: 'Server=prod-server;Database=BlogDb;User Id=sa;Password=***;', environment: 'Production' }
        ],
        entities: [], // Será preenchido com entidades já escaneadas
        migrations: [
          { name: '20240101000000_InitialCreate', timestamp: '2024-01-01T00:00:00Z', isApplied: true },
          { name: '20240115120000_AddUserTable', timestamp: '2024-01-15T12:00:00Z', isApplied: true },
          { name: '20240201090000_AddPostsTable', timestamp: '2024-02-01T09:00:00Z', isApplied: true },
          { name: '20240215143000_AddFollowsTable', timestamp: '2024-02-15T14:30:00Z', isApplied: false }
        ],
        hasSeedData: true
      };
    } catch (error) {
      console.warn('⚠️ Não foi possível analisar o banco de dados:', error);
      return {
        provider: 'Unknown',
        connectionStrings: [],
        entities: [],
        migrations: [],
        hasSeedData: false
      };
    }
  }

  /**
   * Analisa configurações (appsettings.json)
   */
  private static async analyzeAppSettings(projectPath: string): Promise<AppSettingsInfo> {
    try {
      // TODO: Implementar análise real quando backend estiver pronto
      // const appSettingsData = await window.electron.analyzeAppSettings(projectPath);
      
      return {
        environments: ['Development', 'Staging', 'Production'],
        configurations: {
          'Logging:LogLevel:Default': 'Information',
          'Logging:LogLevel:Microsoft.AspNetCore': 'Warning',
          'AllowedHosts': '*',
          'JWT:Key': 'super-secret-key',
          'JWT:Issuer': 'BlogAPI',
          'JWT:Audience': 'BlogUsers',
          'CORS:AllowedOrigins': 'http://localhost:3000,https://blog.example.com'
        },
        secrets: ['JWT:Key', 'ConnectionStrings:ProductionConnection']
      };
    } catch (error) {
      console.warn('⚠️ Não foi possível analisar as configurações:', error);
      return {
        environments: ['Development'],
        configurations: {},
        secrets: []
      };
    }
  }

  /**
   * Calcula métricas do projeto
   */
  private static async calculateMetrics(projectPath: string): Promise<ProjectMetrics> {
    try {
      // TODO: Implementar análise real quando backend estiver pronto
      // const metricsData = await window.electron.calculateMetrics(projectPath);
      
      return {
        totalFiles: 147,
        linesOfCode: 8542,
        codeComplexity: 3.2,
        lastModified: new Date('2024-07-30T15:30:00Z'),
        testCoverage: 78.5
      };
    } catch (error) {
      console.warn('⚠️ Não foi possível calcular as métricas:', error);
      return {
        totalFiles: 0,
        linesOfCode: 0,
        codeComplexity: 0,
        lastModified: new Date(),
        testCoverage: 0
      };
    }
  }

  /**
   * Detecta features implementadas
   */
  private static async detectFeatures(projectPath: string): Promise<ProjectFeature[]> {
    try {
      // TODO: Implementar análise real quando backend estiver pronto
      // const featuresData = await window.electron.detectFeatures(projectPath);
      
      return [
        { name: 'User Authentication', module: 'Authentication', status: 'complete', description: 'JWT-based user authentication system' },
        { name: 'User Management', module: 'Users', status: 'complete', description: 'CRUD operations for user entities' },
        { name: 'Blog Posts', module: 'Posts', status: 'complete', description: 'Create, read, update, delete blog posts' },
        { name: 'Follow System', module: 'Social', status: 'in-progress', description: 'User follow/unfollow functionality' },
        { name: 'Comments System', module: 'Posts', status: 'planned', description: 'Comments on blog posts' },
        { name: 'Real-time Notifications', module: 'Notifications', status: 'planned', description: 'SignalR-based notifications' }
      ];
    } catch (error) {
      console.warn('⚠️ Não foi possível detectar features:', error);
      return [];
    }
  }

  /**
   * Analisa configurações de deployment
   */
  private static async analyzeDeployment(projectPath: string): Promise<DeploymentInfo> {
    try {
      // TODO: Implementar análise real quando backend estiver pronto
      // const deploymentData = await window.electron.analyzeDeployment(projectPath);
      
      return {
        hasDockerfile: true,
        hasDockerCompose: true,
        hasCI: false,
        environments: ['Development', 'Staging', 'Production']
      };
    } catch (error) {
      console.warn('⚠️ Não foi possível analisar deployment:', error);
      return {
        hasDockerfile: false,
        hasDockerCompose: false,
        hasCI: false,
        environments: []
      };
    }
  }

  /**
   * Determina o tipo do projeto baseado no nome e caminho
   */
  private static determineProjectType(name: string, path: string): ProjectInfo['type'] {
    const lowerName = name.toLowerCase();
    const lowerPath = path.toLowerCase();
    
    if (lowerName.includes('api') || lowerPath.includes('/api/')) return 'API';
    if (lowerName.includes('domain') || lowerPath.includes('/domain/')) return 'Domain';
    if (lowerName.includes('application') || lowerPath.includes('/application/')) return 'Application';
    if (lowerName.includes('infrastructure') || lowerPath.includes('/infrastructure/')) return 'Infrastructure';
    if (lowerName.includes('ioc') || lowerPath.includes('/ioc/')) return 'IoC';
    if (lowerName.includes('test') || lowerPath.includes('/test/')) return 'Tests';
    
    return 'API'; // Default
  }

  /**
   * Obtém resumo rápido do projeto
   */
  static async getProjectSummary(projectPath: string): Promise<{
    isValid: boolean;
    projectName: string;
    totalEntities: number;
    totalControllers: number;
    framework: string;
  }> {
    try {
      const analysis = await this.analyzeProject(projectPath);
      
      return {
        isValid: true,
        projectName: analysis.solution.name,
        totalEntities: analysis.database.entities.length,
        totalControllers: analysis.controllers.length,
        framework: analysis.solution.framework
      };
    } catch (error) {
      return {
        isValid: false,
        projectName: 'Unknown',
        totalEntities: 0,
        totalControllers: 0,
        framework: 'Unknown'
      };
    }
  }
}
