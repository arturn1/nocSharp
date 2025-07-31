import { Entity } from '../models/Entity';
import { Property } from '../models/Property';

export class DBDiagramParser {
  private static typeMapping: { [key: string]: string } = {
    'int': 'int',
    'integer': 'int',
    'bigint': 'long',
    'varchar': 'string',
    'text': 'string',
    'char': 'string',
    'boolean': 'bool',
    'bool': 'bool',
    'decimal': 'decimal',
    'float': 'float',
    'double': 'double',
    'datetime': 'DateTime',
    'timestamp': 'DateTime',
    'date': 'DateTime',
    'time': 'TimeSpan',
    'uuid': 'Guid',
    'json': 'string',
    'jsonb': 'string'
  };

  /**
   * Parse DBDiagram content and extract entities
   * @param content The DBDiagram file content
   * @returns Array of parsed entities
   */
  public static parseDBDiagram(content: string): Entity[] {
    const entities: Entity[] = [];
    const lines = content.split('\n');
    let currentEntity: Entity | null = null;
    let insideTable = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detectar início de tabela
      if (line.startsWith('Table ') || line.match(/^table\s+/i)) {
        const tableName = line.replace(/Table\s+/i, '').replace(/\s*{.*/, '').trim();
        currentEntity = {
          name: tableName,
          properties: [],
          baseSkip: false
        };
        insideTable = true;
        continue;
      }

      // Detectar fim de tabela
      if (line === '}' && insideTable && currentEntity) {
        entities.push(currentEntity);
        currentEntity = null;
        insideTable = false;
        continue;
      }

      // Processar propriedades dentro da tabela
      if (insideTable && currentEntity && line && !line.startsWith('//') && !line.startsWith('/*')) {
        const property = this.parseProperty(line);
        if (property) {
          currentEntity.properties.push(property);
        }
      }
    }

    return entities;
  }

  /**
   * Parse a single property line from DBDiagram format
   * @param line The property line to parse
   * @returns Parsed property or null if invalid
   */
  private static parseProperty(line: string): Property | null {
    // Formato típico: id int [pk, increment]
    // ou: name varchar(255) [not null]
    const propertyMatch = line.match(/^(\w+)\s+(\w+(?:\([^)]+\))?)\s*(?:\[([^\]]+)\])?/);
    
    if (!propertyMatch) {
      return null;
    }

    const [, name, type, attributes] = propertyMatch;
    
    // Extrair tipo base (sem parênteses)
    const baseType = type.replace(/\([^)]+\)/, '').toLowerCase();
    const csharpType = this.typeMapping[baseType] || 'string';

    // Verificar se é nullable ou primary key
    const isNullable = !attributes?.includes('not null') && !attributes?.includes('pk');
    const isPrimaryKey = attributes?.includes('pk') || attributes?.includes('primary key');

    return {
      name: name,
      type: isPrimaryKey ? 'int' : csharpType,
      collectionType: '' // Propriedades normais não são coleções
    };
  }

  /**
   * Validate DBDiagram content format
   * @param content The content to validate
   * @returns Validation result with success flag and error message
   */
  public static validateContent(content: string): { isValid: boolean; error?: string } {
    if (!content || content.trim().length === 0) {
      return { isValid: false, error: 'Conteúdo do arquivo está vazio' };
    }

    // Verificar se contém pelo menos uma tabela
    const hasTable = /Table\s+\w+|table\s+\w+/i.test(content);
    if (!hasTable) {
      return { isValid: false, error: 'Nenhuma definição de tabela encontrada no formato DBDiagram' };
    }

    return { isValid: true };
  }

  /**
   * Parse content and return entities with validation
   * @param content The DBDiagram file content
   * @returns Parse result with entities or error
   */
  public static parseWithValidation(content: string): { 
    success: boolean; 
    entities?: Entity[]; 
    error?: string 
  } {
    try {
      // Validar conteúdo
      const validation = this.validateContent(content);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Parse das entidades
      const entities = this.parseDBDiagram(content);

      if (entities.length === 0) {
        return { 
          success: false, 
          error: 'Nenhuma entidade encontrada no arquivo. Verifique o formato DBDiagram.' 
        };
      }

      return { success: true, entities };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao processar arquivo';
      return { success: false, error: errorMessage };
    }
  }
}
