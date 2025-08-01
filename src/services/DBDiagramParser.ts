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
    const enums = new Set<string>();
    const foreignKeys = new Set<string>();

    // 1. First pass: Parse Enums and standalone Refs
    let insideEnum = false;
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.match(/^enum\s+\w+\s*{/i)) {
        const enumName = trimmedLine.replace(/enum\s+/i, '').replace(/\s*{.*/, '').trim();
        enums.add(enumName);
        insideEnum = true;
      } else if (insideEnum && trimmedLine === '}') {
        insideEnum = false;
      } else if (trimmedLine.match(/^Ref:/i)) {
        const fkMatch = trimmedLine.match(/Ref:\s*\w+\.(\w+)\s*>/);
        if (fkMatch) {
          foreignKeys.add(fkMatch[1]);
        }
      }
    }

    // 2. Second pass: Parse Tables
    let currentEntity: Entity | null = null;
    let insideTable = false;
    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.match(/^table\s+\w+\s*{/i)) {
        const tableName = trimmedLine.replace(/table\s+/i, '').replace(/\s*{.*/, '').trim();
        currentEntity = {
          name: tableName,
          properties: [],
          baseSkip: false
        };
        insideTable = true;
        continue;
      }

      if (trimmedLine === '}' && insideTable && currentEntity) {
        entities.push(currentEntity);
        currentEntity = null;
        insideTable = false;
        continue;
      }

      if (insideTable && currentEntity && trimmedLine && !trimmedLine.startsWith('//')) {
        const property = this.parseProperty(trimmedLine, enums, foreignKeys);
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
   * @param enums A set of previously parsed enum names
   * @param foreignKeys A set of foreign key column names from Ref definitions
   * @returns Parsed property or null if invalid
   */
  private static parseProperty(line: string, enums: Set<string>, foreignKeys: Set<string>): Property | null {
    const propertyMatch = line.match(/^(\w+)\s+([\w\d_]+(?:\([^)]+\))?)\s*(?:\[([^\]]*)\])?/);
    if (!propertyMatch) {
      return null;
    }

    const [, name, type, attributesStr] = propertyMatch;
    const attributes = attributesStr || '';
    const baseType = type.replace(/\(.*\)/, '').toLowerCase();

    let csharpType: string;
    const isPrimaryKey = attributes.includes('pk') || attributes.includes('primary key');
    const isForeignKeyRef = attributes.includes('ref:');
    const isStandaloneForeignKey = foreignKeys.has(name);
    const isIdByName = name.toLowerCase() === 'id' || name.toLowerCase().endsWith('_id');

    if (isPrimaryKey || isForeignKeyRef || isStandaloneForeignKey || isIdByName) {
      csharpType = 'Guid';
    } else if (enums.has(baseType)) {
      csharpType = baseType;
    } else {
      csharpType = this.typeMapping[baseType] || 'string';
    }

    return {
      name: name,
      type: csharpType,
      collectionType: ''
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

    // Verificar se contém pelo menos uma tabela ou enum
    const hasTable = /Table\s+\w+|table\s+\w+/i.test(content);
    const hasEnum = /Enum\s+\w+|enum\s+\w+/i.test(content);
    
    if (!hasTable && !hasEnum) {
      return { isValid: false, error: 'Nenhuma definição de tabela ou enum encontrada no formato DBDiagram' };
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
