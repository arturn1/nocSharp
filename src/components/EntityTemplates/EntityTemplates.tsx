import React, { useState } from 'react';
import { Card, Button, Modal, List, Typography, Tag, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Entity } from '../../models/Entity';

const { Title, Text } = Typography;

interface EntityTemplate {
  id: string;
  name: string;
  description: string;
  entities: Entity[];
  tags: string[];
}

interface EntityTemplatesProps {
  onApplyTemplate: (entities: Entity[]) => void;
}

const defaultTemplates: EntityTemplate[] = [
  {
    id: '1',
    name: 'E-commerce Basic',
    description: 'Basic entities for an e-commerce system',
    entities: [
      {
        name: 'User',
        properties: [
          { name: 'Name', type: 'string', collectionType: 'none' },
          { name: 'Email', type: 'string', collectionType: 'none' },
          { name: 'Password', type: 'string', collectionType: 'none' },
          { name: 'CreatedAt', type: 'DateTime', collectionType: 'none' }
        ]
      },
      {
        name: 'Product',
        properties: [
          { name: 'Name', type: 'string', collectionType: 'none' },
          { name: 'Description', type: 'string', collectionType: 'none' },
          { name: 'Price', type: 'decimal', collectionType: 'none' },
          { name: 'Stock', type: 'int', collectionType: 'none' }
        ]
      },
      {
        name: 'Order',
        properties: [
          { name: 'UserId', type: 'int', collectionType: 'none' },
          { name: 'Total', type: 'decimal', collectionType: 'none' },
          { name: 'Status', type: 'string', collectionType: 'none' },
          { name: 'CreatedAt', type: 'DateTime', collectionType: 'none' }
        ]
      }
    ],
    tags: ['e-commerce', 'basic', 'web']
  },
  {
    id: '2',
    name: 'Blog System',
    description: 'Entities for a blog/content management system',
    entities: [
      {
        name: 'Author',
        properties: [
          { name: 'Name', type: 'string', collectionType: 'none' },
          { name: 'Email', type: 'string', collectionType: 'none' },
          { name: 'Bio', type: 'string', collectionType: 'none' }
        ]
      },
      {
        name: 'Post',
        properties: [
          { name: 'Title', type: 'string', collectionType: 'none' },
          { name: 'Content', type: 'string', collectionType: 'none' },
          { name: 'AuthorId', type: 'int', collectionType: 'none' },
          { name: 'PublishedAt', type: 'DateTime', collectionType: 'none' },
          { name: 'Tags', type: 'string', collectionType: 'List' }
        ]
      },
      {
        name: 'Comment',
        properties: [
          { name: 'Content', type: 'string', collectionType: 'none' },
          { name: 'PostId', type: 'int', collectionType: 'none' },
          { name: 'AuthorName', type: 'string', collectionType: 'none' },
          { name: 'CreatedAt', type: 'DateTime', collectionType: 'none' }
        ]
      }
    ],
    tags: ['blog', 'cms', 'content']
  }
];

const EntityTemplates: React.FC<EntityTemplatesProps> = ({ onApplyTemplate }) => {
  const [templates, setTemplates] = useState<EntityTemplate[]>(defaultTemplates);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EntityTemplate | null>(null);

  const handleApplyTemplate = (template: EntityTemplate) => {
    onApplyTemplate(template.entities);
    setIsModalVisible(false);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const showTemplateDetails = (template: EntityTemplate) => {
    setSelectedTemplate(template);
    setIsModalVisible(true);
  };

  return (
    <Card
      title="Entity Templates"
      extra={
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          size="small"
        >
          Create Template
        </Button>
      }
    >
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
        dataSource={templates}
        renderItem={(template) => (
          <List.Item>
            <Card
              size="small"
              hoverable
              actions={[
                <Button 
                  type="text" 
                  size="small"
                  onClick={() => showTemplateDetails(template)}
                >
                  View
                </Button>,
                <Button 
                  type="text" 
                  size="small"
                  onClick={() => handleApplyTemplate(template)}
                >
                  Apply
                </Button>,
                <Popconfirm
                  title="Delete this template?"
                  onConfirm={() => handleDeleteTemplate(template.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button 
                    type="text" 
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              ]}
            >
              <Card.Meta
                title={template.name}
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {template.description}
                    </Text>
                    <div style={{ marginTop: '8px' }}>
                      {template.tags.map(tag => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {template.entities.length} entities
                    </Text>
                  </div>
                }
              />
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title={selectedTemplate?.name}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="apply" 
            type="primary" 
            onClick={() => selectedTemplate && handleApplyTemplate(selectedTemplate)}
          >
            Apply Template
          </Button>
        ]}
        width={700}
      >
        {selectedTemplate && (
          <div>
            <Text>{selectedTemplate.description}</Text>
            <div style={{ margin: '16px 0' }}>
              {selectedTemplate.tags.map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
            
            <Title level={5}>Entities ({selectedTemplate.entities.length}):</Title>
            <List
              dataSource={selectedTemplate.entities}
              renderItem={(entity) => (
                <List.Item>
                  <Card size="small" style={{ width: '100%' }}>
                    <Card.Meta
                      title={entity.name}
                      description={
                        <div>
                          <Text type="secondary">
                            Properties: {entity.properties.map(p => p.name).join(', ')}
                          </Text>
                        </div>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default EntityTemplates;
