import React, { useState } from 'react';
import { Upload, Button, Alert, Typography, Card, Space } from 'antd';
import { FileTextOutlined, UploadOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';
import { Entity } from '../../models/Entity';
import { DBDiagramParser } from '../../services/DBDiagramParser';

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

      // Parse do conteúdo usando o novo serviço
      const parseResult = DBDiagramParser.parseWithValidation(content);
      
      if (!parseResult.success || !parseResult.entities) {
        throw new Error(parseResult.error || 'Erro ao processar o arquivo DBDiagram');
      }

      const entities = parseResult.entities;

      // Callback com as entidades carregadas
      const projectName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      onEntitiesLoaded(entities, projectName);
      setSuccess(`${entities.length} entidades carregadas com sucesso! Configure-as em "Configuração de Entidades" e clique em "Update Project".`);

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

        {success && (
          <Alert
            message="Sucesso!"
            description={success}
            type="success"
            showIcon
            closable
            onClose={() => setSuccess(null)}
          />
        )}

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
