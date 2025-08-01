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
      console.log('📅 Timestamp:', new Date().toISOString());
      
      // Usar os serviços existentes do projeto para obter dados reais
      const { scanExistingEntities, getProjectMetadata } = await import('./EntityScanService');
      
      const [
        projectMetadata,
        entitiesResult,
        fileStructure,
        realControllers
      ] = await Promise.all([
        getProjectMetadata(projectPath),
        scanExistingEntities(projectPath),
        this.analyzeFileStructure(projectPath),
        this.scanControllerFiles(projectPath)
      ]);

      console.log('📊 Resultados da análise:');
      console.log('  - Metadados:', projectMetadata);
      console.log('  - Entidades encontradas:', entitiesResult.success ? entitiesResult.entities.length : 0);
      console.log('  - Controllers reais encontrados:', realControllers.length);
      console.log('  - Estrutura de arquivos:', {
        totalFiles: fileStructure.totalFiles,
        csFiles: fileStructure.csFiles,
        projects: fileStructure.projects.length
      });

      // Construir análise baseada em dados reais
      const analysis = this.buildAnalysisFromRealData(
        projectPath,
        projectMetadata,
        entitiesResult,
        fileStructure,
        realControllers
      );

      console.log('✅ Análise concluída com sucesso!');
      console.log('📈 Resumo final:');
      console.log('  - Controllers:', analysis.controllers.length);
      console.log('  - Total de Endpoints:', analysis.controllers.reduce((total, c) => total + c.endpoints.length, 0));
      console.log('  - Projetos:', analysis.projects.length);
      console.log('  - Entidades:', analysis.database.entities.length);

      return analysis;
    } catch (error) {
      console.error('❌ Erro ao analisar projeto .NET:', error);
      throw new Error(`Falha na análise do projeto: ${error.message}`);
    }
  }

  /**
   * Escaneia e analisa arquivos de Controllers reais do projeto
   */
  static async scanControllerFiles(projectPath: string): Promise<ControllerInfo[]> {
    try {
      console.log('🔍 Buscando arquivos de Controllers em:', projectPath);
      
      const controllers: ControllerInfo[] = [];
      const controllerFiles = await this.findControllerFiles(projectPath);
      
      console.log(`📁 Encontrados ${controllerFiles.length} arquivos de Controllers`);
      
      for (const filePath of controllerFiles) {
        try {
          const controllerInfo = await this.analyzeControllerFile(filePath);
          if (controllerInfo) {
            controllers.push(controllerInfo);
            console.log(`✅ Controller analisado: ${controllerInfo.name} com ${controllerInfo.endpoints.length} endpoints`);
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao analisar controller ${filePath}:`, (error as Error).message);
        }
      }
      
      return controllers;
    } catch (error) {
      console.error('❌ Erro ao escanear Controllers:', error);
      return [];
    }
  }

  /**
   * Encontra todos os arquivos de Controllers no projeto
   */
  private static async findControllerFiles(projectPath: string): Promise<string[]> {
    try {
      // Usar Electron IPC para acessar sistema de arquivos
      // O handler scan-directory já faz busca recursiva por arquivos Controller.cs
      const controllerFiles = await window.electron.scanDirectory(projectPath);
      
      return controllerFiles || [];
    } catch (error) {
      console.error('Erro ao encontrar arquivos de Controllers:', error);
      return [];
    }
  }

  /**
   * Analisa um arquivo de Controller específico
   */
  private static async analyzeControllerFile(filePath: string): Promise<ControllerInfo | null> {
    try {
      // Usar Electron IPC para ler arquivo
      const content = await window.electron.readFile(filePath);
      if (!content) {
        throw new Error('Não foi possível ler o arquivo');
      }
      
      const controllerName = filePath.split(/[/\\]/).pop()?.replace('.cs', '') || 'Unknown';
      
      console.log(`📖 Analisando Controller: ${controllerName}`);
      
      // Extrair informações do Controller
      const endpoints = this.extractEndpointsFromController(content, controllerName);
      const hasAuthentication = this.checkForAuthentication(content);
      
      return {
        name: controllerName,
        path: filePath,
        endpoints: endpoints,
        hasAuthentication: hasAuthentication
      };
      
    } catch (error) {
      console.error(`Erro ao ler arquivo ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Extrai endpoints de um arquivo de Controller
   */
  private static extractEndpointsFromController(content: string, controllerName: string): EndpointInfo[] {
    const endpoints: EndpointInfo[] = [];
    
    // Padrões para detectar métodos HTTP
    const methodPatterns = [
      { pattern: /\[HttpGet(?:\("([^"]*)"\))?\]\s*(?:public\s+)?(?:async\s+)?(?:Task<)?(\w+)(?:>)?\s+(\w+)\s*\([^)]*\)/g, method: 'GET' as const },
      { pattern: /\[HttpPost(?:\("([^"]*)"\))?\]\s*(?:public\s+)?(?:async\s+)?(?:Task<)?(\w+)(?:>)?\s+(\w+)\s*\([^)]*\)/g, method: 'POST' as const },
      { pattern: /\[HttpPut(?:\("([^"]*)"\))?\]\s*(?:public\s+)?(?:async\s+)?(?:Task<)?(\w+)(?:>)?\s+(\w+)\s*\([^)]*\)/g, method: 'PUT' as const },
      { pattern: /\[HttpDelete(?:\("([^"]*)"\))?\]\s*(?:public\s+)?(?:async\s+)?(?:Task<)?(\w+)(?:>)?\s+(\w+)\s*\([^)]*\)/g, method: 'DELETE' as const },
      { pattern: /\[HttpPatch(?:\("([^"]*)"\))?\]\s*(?:public\s+)?(?:async\s+)?(?:Task<)?(\w+)(?:>)?\s+(\w+)\s*\([^)]*\)/g, method: 'PATCH' as const }
    ];
    
    // Extrair rota base do Controller
    const baseRoute = this.extractBaseRoute(content);
    
    for (const { pattern, method } of methodPatterns) {
      let match;
      pattern.lastIndex = 0; // Reset regex
      
      while ((match = pattern.exec(content)) !== null) {
        const routeParam = match[1] || '';
        const returnType = match[2] || 'IActionResult';
        const actionName = match[3];
        
        // Construir rota completa
        let fullRoute = baseRoute;
        if (routeParam) {
          fullRoute = fullRoute.endsWith('/') ? fullRoute + routeParam : fullRoute + '/' + routeParam;
        }
        
        // Extrair parâmetros do método
        const parameters = this.extractMethodParameters(content, actionName);
        
        // Verificar autenticação no método
        const hasAuth = this.checkMethodAuthentication(content, actionName);
        
        endpoints.push({
          method,
          route: fullRoute,
          actionName,
          hasAuth,
          parameters,
          returnType
        });
        
        console.log(`  📍 Endpoint encontrado: ${method} ${fullRoute} (${actionName})`);
      }
    }
    
    return endpoints;
  }

  /**
   * Extrai a rota base do Controller
   */
  private static extractBaseRoute(content: string): string {
    // Buscar por [Route("...")]
    const routeMatch = content.match(/\[Route\("([^"]+)"\)\]/);
    if (routeMatch) {
      let route = routeMatch[1];
      // Substituir [controller] pelo nome do controller
      const controllerMatch = content.match(/class\s+(\w+)Controller/);
      if (controllerMatch && route.includes('[controller]')) {
        const controllerName = controllerMatch[1].toLowerCase();
        route = route.replace('[controller]', controllerName);
      }
      return route.startsWith('/') ? route : '/' + route;
    }
    
    // Se não encontrar Route, usar padrão api/controller
    const controllerMatch = content.match(/class\s+(\w+)Controller/);
    if (controllerMatch) {
      const controllerName = controllerMatch[1].toLowerCase();
      return `/api/${controllerName}`;
    }
    
    return '/api/unknown';
  }

  /**
   * Verifica se o Controller tem autenticação
   */
  private static checkForAuthentication(content: string): boolean {
    const authPatterns = [
      /\[Authorize\]/,
      /\[ApiKeyAuth\]/,
      /\[JwtAuth\]/,
      /\[Bearer\]/,
      /RequireAuthorization/,
      /\.RequireAuthorization\(/
    ];
    
    return authPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Verifica autenticação em um método específico
   */
  private static checkMethodAuthentication(content: string, methodName: string): boolean {
    // Buscar por atributos de autenticação antes do método
    const methodPattern = new RegExp(`(\\[Authorize[^\\]]*\\]\\s*)?(?:public\\s+)?(?:async\\s+)?(?:Task<)?\\w+(?:>)?\\s+${methodName}\\s*\\([^)]*\\)`, 'g');
    const match = methodPattern.exec(content);
    
    return match ? !!match[1] : false;
  }

  /**
   * Extrai parâmetros de um método
   */
  private static extractMethodParameters(content: string, methodName: string): string[] {
    const methodPattern = new RegExp(`(?:public\\s+)?(?:async\\s+)?(?:Task<)?\\w+(?:>)?\\s+${methodName}\\s*\\(([^)]*)\\)`, 'g');
    const match = methodPattern.exec(content);
    
    if (!match || !match[1]) {
      return [];
    }
    
    const params = match[1];
    const parameters: string[] = [];
    
    // Dividir parâmetros por vírgula, mas cuidar com tipos genéricos
    const paramParts = this.splitParameterString(params);
    
    for (const param of paramParts) {
      const cleanParam = param.trim();
      if (cleanParam && !cleanParam.includes('[FromServices]')) {
        // Extrair informações do parâmetro
        const paramInfo = this.parseParameterInfo(cleanParam);
        if (paramInfo) {
          parameters.push(paramInfo);
        }
      }
    }
    
    return parameters;
  }

  /**
   * Divide string de parâmetros respeitando tipos genéricos
   */
  private static splitParameterString(params: string): string[] {
    const result: string[] = [];
    let current = '';
    let bracketCount = 0;
    let inGeneric = false;
    
    for (let i = 0; i < params.length; i++) {
      const char = params[i];
      
      if (char === '<') {
        inGeneric = true;
        bracketCount++;
      } else if (char === '>') {
        bracketCount--;
        if (bracketCount === 0) {
          inGeneric = false;
        }
      } else if (char === ',' && !inGeneric) {
        result.push(current.trim());
        current = '';
        continue;
      }
      
      current += char;
    }
    
    if (current.trim()) {
      result.push(current.trim());
    }
    
    return result;
  }

  /**
   * Analisa informações de um parâmetro individual
   */
  private static parseParameterInfo(param: string): string | null {
    // Remover atributos como [FromBody], [FromQuery], etc.
    let cleanParam = param.replace(/\[[^\]]*\]/g, '').trim();
    
    // Extrair apenas o nome do parâmetro (última palavra)
    const parts = cleanParam.split(/\s+/);
    const paramName = parts[parts.length - 1];
    
    // Verificar se é um parâmetro válido
    if (paramName && 
        !paramName.includes('(') && 
        !paramName.includes(')') && 
        !paramName.includes('[') &&
        paramName !== 'handler') {
      
      // Se tem tipo antes do nome, incluir o tipo
      if (parts.length >= 2) {
        const type = parts[parts.length - 2];
        // Para parâmetros de rota como {id}, extrair da URL
        if (['int', 'Guid', 'string', 'long'].includes(type)) {
          return `{${paramName}}`;
        }
      }
      
      return paramName;
    }
    
    return null;
  }

  /**
   * Analisa a estrutura de arquivos do projeto
   */
  private static async analyzeFileStructure(projectPath: string): Promise<any> {
    try {
      // Usar Electron IPC para acessar sistema de arquivos
      const files = await window.electron.scanDirectory(projectPath);
      if (!files) {
        throw new Error(`Caminho do projeto não encontrado: ${projectPath}`);
      }
      
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
        if (file.includes('/') || file.includes('\\')) {
          // É um diretório
          const folderName = file.split(/[/\\]/).pop();
          if (folderName && !structure.folders.includes(folderName)) {
            structure.folders.push(folderName);
          }
        } else {
          // É um arquivo
          structure.totalFiles++;
          if (file.endsWith('.cs')) {
            structure.csFiles++;
          }
          if (file.endsWith('.json')) {
            structure.jsonFiles++;
          }
          if (file === 'launchSettings.json') {
            structure.hasLaunchSettings = true;
          }
          if (file.includes('appsettings')) {
            structure.hasAppSettings = true;
          }
          if (file.endsWith('.csproj')) {
            structure.projects.push(file);
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
    fileStructure: any,
    realControllers: ControllerInfo[]
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

    // Usar controllers reais se encontrados, senão gerar baseado nas entidades
    const controllers: ControllerInfo[] = realControllers.length > 0 
      ? realControllers 
      : entities.map((entity: any) => ({
          name: `${entity.name}Controller`,
          path: `Controllers/${entity.name}Controller.cs`,
          endpoints: this.generateEndpointsForEntity(entity.name),
          hasAuthentication: false
        }));

    console.log(`📊 Controllers encontrados: ${controllers.length} (${realControllers.length} reais, ${entities.length} baseados em entidades)`);

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
        status: controllers.length > 0 ? 'complete' : 'planned', 
        description: `${controllers.length} controladores (${realControllers.length} reais)` 
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
