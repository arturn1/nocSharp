import React, { useState } from 'react';
import { Card, Input, Button, Space, Select, Table, Form, Popconfirm, Row, Col, Statistic, Switch, Collapse } from 'antd';
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
  collapsible = false,
}) => {
  const [newEntityName, setNewEntityName] = useState('');
  const [newProperty, setNewProperty] = useState<{ [key: number]: Property }>({});
  const [editingEntity, setEditingEntity] = useState<number | null>(null);

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
    const property = newProperty[entityIndex];
    if (property && property.name && property.type) {
      addProperty(entityIndex, property);
      setNewProperty(prev => ({ ...prev, [entityIndex]: { name: '', type: 'string', collectionType: '' } }));
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
      {/* Statistics Dashboard */}
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Entities"
              value={entities.length}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Properties"
              value={entities.reduce((sum, entity) => sum + entity.properties.length, 0)}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Avg Props/Entity"
              value={entities.length > 0 ? 
                (entities.reduce((sum, entity) => sum + entity.properties.length, 0) / entities.length).toFixed(1) : 
                '0'
              }
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

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
      {collapsible ? (
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
                    </span>
                  )}
                </span>
                <div onClick={(e) => e.stopPropagation()}>
                  <Popconfirm
                    title="Remove this entity?"
                    onConfirm={() => removeEntity(entityIndex)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button icon={<DeleteOutlined />} size="small" danger />
                  </Popconfirm>
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
                      value={newProperty[entityIndex]?.name || ''}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setNewProperty(prev => ({
                        ...prev,
                        [entityIndex]: { ...prev[entityIndex], name: e.target.value, type: prev[entityIndex]?.type || 'string', collectionType: prev[entityIndex]?.collectionType || '' }
                      }))}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Select
                      placeholder="Type"
                      value={newProperty[entityIndex]?.type || 'string'}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(value) => setNewProperty(prev => ({
                        ...prev,
                        [entityIndex]: { ...prev[entityIndex], name: prev[entityIndex]?.name || '', type: value, collectionType: prev[entityIndex]?.collectionType || '' }
                      }))}
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
                      value={newProperty[entityIndex]?.collectionType || 'none'}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(value) => setNewProperty(prev => ({
                        ...prev,
                        [entityIndex]: { ...prev[entityIndex], name: prev[entityIndex]?.name || '', type: prev[entityIndex]?.type || 'string', collectionType: value === 'none' ? '' : value }
                      }))}
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
      ) : (
        entities.map((entity, entityIndex) => (
          <Card
            key={entityIndex}
            title={
              editingEntity === entityIndex ? (
                <Input
                  value={entity.name}
                  onChange={(e) => updateEntityName(entityIndex, e.target.value)}
                  onPressEnter={() => setEditingEntity(null)}
                  onBlur={() => setEditingEntity(null)}
                  autoFocus
                />
              ) : (
                <span onClick={() => setEditingEntity(entityIndex)} style={{ cursor: 'pointer' }}>
                  {entity.name} ({entity.properties.length} properties)
                </span>
              )
            }
            size="small"
            extra={
              <Popconfirm
                title="Remove this entity?"
                onConfirm={() => removeEntity(entityIndex)}
                okText="Yes"
                cancelText="No"
              >
                <Button icon={<DeleteOutlined />} size="small" danger />
              </Popconfirm>
            }
          >
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
                  value={newProperty[entityIndex]?.name || ''}
                  onChange={(e) => setNewProperty(prev => ({
                    ...prev,
                    [entityIndex]: { ...prev[entityIndex], name: e.target.value, type: prev[entityIndex]?.type || 'string', collectionType: prev[entityIndex]?.collectionType || '' }
                  }))}
                />
              </Form.Item>
              <Form.Item>
                <Select
                  placeholder="Type"
                  value={newProperty[entityIndex]?.type || 'string'}
                  onChange={(value) => setNewProperty(prev => ({
                    ...prev,
                    [entityIndex]: { ...prev[entityIndex], name: prev[entityIndex]?.name || '', type: value, collectionType: prev[entityIndex]?.collectionType || '' }
                  }))}
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
                  value={newProperty[entityIndex]?.collectionType || 'none'}
                  onChange={(value) => setNewProperty(prev => ({
                    ...prev,
                    [entityIndex]: { ...prev[entityIndex], name: prev[entityIndex]?.name || '', type: prev[entityIndex]?.type || 'string', collectionType: value === 'none' ? '' : value }
                  }))}
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
          </Card>
        ))
      )}
    </Space>
  );
};

export default EntityForm;
