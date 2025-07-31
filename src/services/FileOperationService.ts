import { Entity } from '../models/Entity';

export interface FileOperationResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Service responsável por operações de arquivo e importação
 * Implementa o princípio de Responsabilidade Única (SRP)
 */
export class FileOperationService {
  
  /**
   * Lê conteúdo de um arquivo de projeto
   */
  static async readProjectFile(filePath: string): Promise<FileOperationResult> {
    try {
      const fileContent = await window.electron.executeCommand(`cat ${filePath}`);
      const projectName = fileContent.split('\n')[0].trim();
      
      return {
        success: true,
        data: { projectName, filePath }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao ler arquivo';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Processa entidades importadas do DBDiagram
   */
  static processDBDiagramImport(
    loadedEntities: Entity[],
    fileName: string,
    existingEntities: Entity[]
  ): {
    projectName: string;
    hasConflicts: boolean;
    conflictingEntities: Entity[];
    newEntities: Entity[];
  } {
    const projectName = fileName.replace(/\.[^/.]+$/, "") || 'DBDiagram Project';
    
    // Detectar conflitos
    const conflictingEntities = loadedEntities.filter(loaded => 
      existingEntities.some(existing => existing.name === loaded.name)
    );
    
    const newEntities = loadedEntities.filter(loaded => 
      !existingEntities.some(existing => existing.name === loaded.name)
    );
    
    return {
      projectName,
      hasConflicts: conflictingEntities.length > 0,
      conflictingEntities,
      newEntities
    };
  }

  /**
   * Valida estrutura de projeto
   */
  static validateProjectStructure(directoryPath: string): {
    isValid: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];
    
    if (!directoryPath || directoryPath.trim() === '') {
      reasons.push('Caminho do diretório não fornecido');
      return { isValid: false, reasons };
    }
    
    // Aqui poderiam ser adicionadas outras validações específicas do nocSharp
    // Por exemplo, verificar se existe .csproj, etc.
    
    return { isValid: true, reasons: [] };
  }

  /**
   * Gera nome de projeto a partir do caminho
   */
  static extractProjectNameFromPath(directoryPath: string): string {
    if (!directoryPath) return 'Projeto Sem Nome';
    
    const pathParts = directoryPath.split(/[/\\]/);
    const lastPart = pathParts[pathParts.length - 1];
    
    return lastPart || 'Projeto';
  }

  /**
   * Formata caminho para exibição
   */
  static formatPathForDisplay(path: string, maxLength: number = 50): string {
    if (!path || path.length <= maxLength) return path;
    
    const start = path.substring(0, 15);
    const end = path.substring(path.length - (maxLength - 18));
    
    return `${start}...${end}`;
  }
}
