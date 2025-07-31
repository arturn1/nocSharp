import React from 'react';
import { Modal, Space, Alert, Card, Form, Select, Typography } from 'antd';
import { Entity } from '../../models/Entity';

const { Text } = Typography;
const { Option } = Select;

interface ProjectModalProps {
  isModalVisible: boolean;
  projectName?: string;
  isExistingProject: boolean;
  existingEntities: Entity[];
  overwriteChoices: Record<string, boolean>;
  onConfirmCreation: () => void;
  onModalCancel: () => void;
  onOverwriteChoiceChange: (entityName: string, choice: boolean) => void;
  generateCommandsPreview: () => string[];
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  isModalVisible,
  projectName,
  isExistingProject,
  existingEntities,
  overwriteChoices,
  onConfirmCreation,
  onModalCancel,
  onOverwriteChoiceChange,
  generateCommandsPreview
}) => {
  return (
    <Modal
      title="🚀 Gerenciar Projeto e Entidades"
      open={isModalVisible}
      onOk={onConfirmCreation}
      onCancel={onModalCancel}
      width={1000}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message={isExistingProject 
            ? `Adicionar ou atualizar entidades no projeto existente: ${projectName}`
            : `Criar novo projeto: ${projectName}`
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
                    onChange={(value) => onOverwriteChoiceChange(entity.name, value)}
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
  );
};

export default ProjectModal;
