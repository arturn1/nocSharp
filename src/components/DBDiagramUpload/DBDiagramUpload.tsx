import React, { useState } from 'react';
import { Upload, Button, Alert, Typography, Card, Space } from 'antd';
import { FileTextOutlined, UploadOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';
import { Entity } from '../../models/Entity';
import { Property } from '../../models/Property';

const { Text } = Typography;

interface DBDiagramUploadProps {
  onEntitiesLoaded: (entities: Entity[], fileName?: string) => void;
  title?: string;
  description?: string;
  onEntityComparison?: (newEntities: Entity[], existingEntities: Entity[]) => boolean;
  existingEntities?: Entity[];
}

const DBDiagramUpload: React.FC<DBDiagramUploadProps> = ({ 
  onEntitiesLoaded, 
  title = "Carregar DBDiagram",
  description = "Faça upload de um arquivo .dbml ou .txt para carregar as entidades automaticamente",
  onEntityComparison,
  existingEntities = []
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const parseDBDiagram = (content: string): Entity[] => {
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
        // Formato típico: id int [pk, increment]
        // ou: name varchar(255) [not null]
        const propertyMatch = line.match(/^(\w+)\s+(\w+(?:\([^)]+\))?)\s*(?:\[([^\]]+)\])?/);
        
        if (propertyMatch) {
          const [, name, type, attributes] = propertyMatch;
          
          // Mapear tipos do DBDiagram para tipos C#
          const typeMapping: { [key: string]: string } = {
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

          // Extrair tipo base (sem parênteses)
          const baseType = type.replace(/\([^)]+\)/, '').toLowerCase();
          const csharpType = typeMapping[baseType] || 'string';

          // Verificar se é nullable ou primary key
          const isNullable = !attributes?.includes('not null') && !attributes?.includes('pk');
          const isPrimaryKey = attributes?.includes('pk') || attributes?.includes('primary key');

          const property: Property = {
            name: name,
            type: isPrimaryKey ? 'int' : csharpType,
            collectionType: '' // Propriedades normais não são coleções
          };

          currentEntity.properties.push(property);
        }
      }
    }

    return entities;
  };

  const handleFileUpload = async (file: RcFile) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Verificar extensão do arquivo
      const fileNameLower = file.name.toLowerCase();
      if (!fileNameLower.endsWith('.dbml') && !fileNameLower.endsWith('.txt')) {
        throw new Error('Por favor, selecione um arquivo .dbml ou .txt');
      }

      // Ler conteúdo do arquivo
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
        reader.readAsText(file);
      });

      // Parse do conteúdo
      const entities = parseDBDiagram(content);

      if (entities.length === 0) {
        throw new Error('Nenhuma entidade encontrada no arquivo. Verifique o formato DBDiagram.');
      }

      // Verificar duplicatas automaticamente antes de carregar as entidades
      if (onEntityComparison && existingEntities.length > 0) {
        const hasDuplicates = onEntityComparison(entities, existingEntities);
        if (hasDuplicates) {
          setSuccess(`${entities.length} entidades carregadas. Duplicatas detectadas - resolva no modal.`);
          return false; // Prevent default upload
        }
      }

      // Callback com as entidades carregadas
      const projectName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      onEntitiesLoaded(entities, projectName);
      setSuccess(`${entities.length} entidades carregadas com sucesso!`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao processar arquivo';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }

    return false; // Prevent default upload
  };

  return (
    <Card title={title} size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {description}
        </Text>

        <Upload 
          beforeUpload={handleFileUpload} 
          showUploadList={false}
          accept=".dbml,.txt"
        >
          <Button 
            icon={<UploadOutlined />} 
            loading={loading}
            type="dashed"
            block
          >
            <FileTextOutlined /> Selecionar Arquivo DBDiagram
          </Button>
        </Upload>

        {error && (
          <Alert
            message="Erro ao processar arquivo"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}

        <div style={{ fontSize: '11px', color: '#666' }}>
          <Text type="secondary">
            <strong>Formato suportado:</strong> DBDiagram (.dbml) ou arquivo de texto com sintaxe DBDiagram
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default DBDiagramUpload;
