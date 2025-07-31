import React, { useState } from 'react';
import { Card, Input, Button, Space, Select, Table, Form, Popconfirm, Row, Col, Statistic, Switch, Collapse, Badge } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Entity } from '../../models/Entity';
import { Property } from '../../models/Property';

const { Option } = Select;

interface EntityFormProps {
  entities: Entity[];
  addEntity: (entity: Entity) => void;
  updateEntityName: (index: number, name: string) => void;
  updateEntityBaseSkip?: (index: number, baseSkip: boolean) => void;
  addProperty: (entityIndex: number, property: Property) => void;
  updateProperty: (entityIndex: number, propertyIndex: number, field: keyof Property, value: string) => void;
  removeProperty: (entityIndex: number, propertyIndex: number) => void;
  removeEntity: (index: number) => void;
  hideAddButton?: boolean;
  collapsible?: boolean;
  onCleanEntities?: (entityNames: string[]) => void;
  projectPath?: string;
  pendingDeletions?: string[];
  scannedEntities?: Entity[]; // Para identificar entidades "new"
}

const EntityForm: React.FC<EntityFormProps> = ({
  entities,
  addEntity,
  updateEntityName,
  updateEntityBaseSkip,
  addProperty,
  updateProperty,
  removeProperty,
  removeEntity,
  hideAddButton = false,
  collapsible = true,
  onCleanEntities,
  projectPath,
  pendingDeletions = [],
  scannedEntities = [],
}) => {
  const [newEntityName, setNewEntityName] = useState('');
  const [newProperty, setNewProperty] = useState<{ [key: number]: Property }>({});
  const [editingEntity, setEditingEntity] = useState<number | null>(null);

  // Função para verificar se uma entidade é nova (não existe no projeto escaneado)
  const isNewEntity = (entityName: string): boolean => {
    // Se não há entidades escaneadas, não podemos determinar o que é novo
    if (!scannedEntities || scannedEntities.length === 0) {
      return false;
    }
    // Uma entidade é nova se não existe nas entidades escaneadas do projeto
    return !scannedEntities.some(scanned => scanned.name === entityName);
  };

  // Função para garantir valores padrão no estado newProperty
  const getNewPropertyForEntity = (entityIndex: number): Property => {
    return newProperty[entityIndex] || { name: '', type: 'string', collectionType: '' };
  };

  // Função para atualizar propriedade com valores padrão garantidos
  const updateNewProperty = (entityIndex: number, updates: Partial<Property>) => {
    const currentProperty = getNewPropertyForEntity(entityIndex);
    setNewProperty(prev => ({
      ...prev,
      [entityIndex]: { ...currentProperty, ...updates }
    }));
  };

  const handleAddEntity = () => {
    if (newEntityName.trim()) {
      addEntity({
        name: newEntityName.trim(),
        properties: [],
        baseSkip: false,
      });
      setNewEntityName('');
    }
  };

  const handleAddProperty = (entityIndex: number) => {
    const property = getNewPropertyForEntity(entityIndex);
    if (property && property.name && property.type) {
      addProperty(entityIndex, property);
      // Reset para valores padrão após adicionar
      setNewProperty(prev => ({ 
        ...prev, 
        [entityIndex]: { name: '', type: 'string', collectionType: '' } 
      }));
    }
  };

  const getPropertyColumns = (entityIndex: number) => {
    // Get available entity types (other entities that can be used as types)
    const getEntityTypeOptions = () => {
      const basicTypes = [
        { value: "string", label: "String" },
        { value: "int", label: "Int" },
        { value: "bool", label: "Bool" },
        { value: "DateTime", label: "DateTime" },
        { value: "decimal", label: "Decimal" },
        { value: "double", label: "Double" },
        { value: "float", label: "Float" },
        { value: "long", label: "Long" },
        { value: "Guid", label: "Guid" }
      ];

      const entityTypes = entities
        .filter((entity, index) => index !== entityIndex && entity.name.trim())
        .map(entity => ({
          value: entity.name,
          label: `${entity.name} (Entity)`
        }));

      return [...basicTypes, ...entityTypes];
    };

    const typeOptions = getEntityTypeOptions();

    return [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: Property, index: number) => (
          <Input
            value={text}
            onChange={(e) => updateProperty(entityIndex, index, 'name', e.target.value)}
            autoFocus
          />
        ),
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (text: string, record: Property, index: number) => (
          <Select
            value={text}
            onChange={(value) => updateProperty(entityIndex, index, 'type', value)}
            style={{ width: '100%' }}
            showSearch
            filterOption={(input, option) =>
              String(option?.label || '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {typeOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        ),
      },
      {
        title: 'Collection',
        dataIndex: 'collectionType',
        key: 'collectionType',
        render: (text: string, record: Property, index: number) => (
          <Select
            value={text || 'none'}
            onChange={(value) => updateProperty(entityIndex, index, 'collectionType', value === 'none' ? '' : value)}
            style={{ width: '100%' }}
          >
            <Option value="none">None</Option>
            <Option value="List">List</Option>
            <Option value="ICollection">ICollection</Option>
            <Option value="IEnumerable">IEnumerable</Option>
          </Select>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_: any, record: Property, index: number) => (
          <Popconfirm
            title="Remove this property?"
            onConfirm={() => removeProperty(entityIndex, index)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        ),
      },
    ];
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {/* Add New Entity */}
      {!hideAddButton && (
        <Card title="Add New Entity" size="small">
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="Entity name (e.g., User, Product)"
              value={newEntityName}
              onChange={(e) => setNewEntityName(e.target.value)}
              onPressEnter={handleAddEntity}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddEntity}>
              Add Entity
            </Button>
          </Space.Compact>
        </Card>
      )}

      {/* Entity List */}
        <Collapse
          size="small"
          items={entities.map((entity, entityIndex) => ({
            key: entityIndex,
            label: (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span>
                  {editingEntity === entityIndex ? (
                    <Input
                      value={entity.name}
                      onChange={(e) => updateEntityName(entityIndex, e.target.value)}
                      onPressEnter={() => setEditingEntity(null)}
                      onBlur={() => setEditingEntity(null)}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span onClick={(e) => { e.stopPropagation(); setEditingEntity(entityIndex); }}>
                      {entity.name} ({entity.properties.length} properties)
                      {isNewEntity(entity.name) && (
                        <Badge 
                          count="NEW" 
                          style={{ 
                            marginLeft: 8, 
                            backgroundColor: '#52c41a',
                            fontSize: '10px',
                            height: '18px',
                            lineHeight: '18px'
                          }} 
                        />
                      )}
                    </span>
                  )}
                </span>
                <div onClick={(e) => e.stopPropagation()}>
                  {onCleanEntities ? (
                    <Popconfirm
                      title={`Confirmar exclusão da entidade "${entity.name}"?`}
                      description="Esta ação irá remover a entidade do projeto permanentemente."
                      onConfirm={() => onCleanEntities([entity.name])}
                      okText="Sim, excluir"
                      cancelText="Cancelar"
                      okButtonProps={{ danger: true }}
                    >
                      <Button 
                        icon={<DeleteOutlined />} 
                        size="small" 
                        danger 
                        title={`Remover entidade ${entity.name} do projeto`}
                        disabled={pendingDeletions.includes(entity.name)}
                        loading={pendingDeletions.includes(entity.name)}
                      />
                    </Popconfirm>
                  ) : (
                    <Popconfirm
                      title="Remove this entity?"
                      onConfirm={() => removeEntity(entityIndex)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button icon={<DeleteOutlined />} size="small" danger />
                    </Popconfirm>
                  )}
                </div>
              </div>
            ),
            children: (
              <div>
                {/* Base Skip Toggle */}
                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Switch
                    checked={entity.baseSkip || false}
                    onChange={(checked) => updateEntityBaseSkip?.(entityIndex, checked)}
                    size="small"
                  />
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    Use --baseSkip parameter (skip base entity methods)
                  </span>
                </div>

                {/* Add Property Form */}
                <Form layout="inline" style={{ marginBottom: 16 }}>
                  <Form.Item>
                    <Input
                      placeholder="Property name"
                      value={getNewPropertyForEntity(entityIndex).name}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateNewProperty(entityIndex, { name: e.target.value })}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Select
                      placeholder="Type"
                      value={getNewPropertyForEntity(entityIndex).type}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(value) => updateNewProperty(entityIndex, { type: value })}
                      style={{ width: 140 }}
                      showSearch
                      filterOption={(input, option) =>
                        String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      <Option value="string">String</Option>
                      <Option value="int">Int</Option>
                      <Option value="bool">Bool</Option>
                      <Option value="DateTime">DateTime</Option>
                      <Option value="decimal">Decimal</Option>
                      <Option value="double">Double</Option>
                      <Option value="float">Float</Option>
                      <Option value="long">Long</Option>
                      <Option value="Guid">Guid</Option>
                      {entities
                        .filter((entity, index) => index !== entityIndex && entity.name.trim())
                        .map(entity => (
                          <Option key={entity.name} value={entity.name}>
                            {entity.name} (Entity)
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                  <Form.Item>
                    <Select
                      placeholder="Collection"
                      value={getNewPropertyForEntity(entityIndex).collectionType || 'none'}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(value) => updateNewProperty(entityIndex, { collectionType: value === 'none' ? '' : value })}
                      style={{ width: 120 }}
                    >
                      <Option value="none">None</Option>
                      <Option value="List">List</Option>
                      <Option value="ICollection">ICollection</Option>
                      <Option value="IEnumerable">IEnumerable</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />} 
                      onClick={() => handleAddProperty(entityIndex)}
                      size="small"
                    >
                      Add Property
                    </Button>
                  </Form.Item>
                </Form>

                {/* Properties Table */}
                <Table
                  dataSource={entity.properties}
                  columns={getPropertyColumns(entityIndex)}
                  pagination={false}
                  size="small"
                  rowKey={(record, index) => `${entityIndex}-${index}`}
                  locale={{ emptyText: 'No properties yet' }}
                />
              </div>
            )
          }))}
        />
      
    </Space>
  );
};

export default EntityForm;
