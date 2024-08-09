import React from 'react';
import { Collapse, Form, Input, Space, Select, Button } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { Entity } from '../../models/Entity';
import { collectionTypes, csharpTypes, getTypeOptions } from '../../utils/typeOptions';

const { Panel } = Collapse;

interface EntityFormProps {
  entities: Entity[];
  addEntity: () => void;
  updateEntityName: (index: number, name: string) => void;
  addProperty: (entityIndex: number) => void;
  updateProperty: (entityIndex: number, propertyIndex: number, field: keyof Entity['properties'][number], value: string) => void;
  removeProperty: (entityIndex: number, propertyIndex: number) => void;
  removeEntity: (index: number) => void;
}

const EntityForm: React.FC<EntityFormProps> = ({
  entities,
  addEntity,
  updateEntityName,
  addProperty,
  updateProperty,
  removeProperty,
  removeEntity,
}) => {
  return (
    <>
      <Button type="dashed" onClick={addEntity} style={{ marginBottom: '20px' }}>Add Entity</Button>
      <Collapse accordion>
        {entities.map((entity, entityIndex) => (
          <Panel 
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {entity.name === '' ? `Entity ${entityIndex + 1}` : entity.name}
                <Button
                  size='small'
                  type="link"
                  icon={<MinusOutlined />}
                  onClick={() => removeEntity(entityIndex)}
                />
              </div>
            }
            key={entityIndex}
          >
            <Form.Item label="Entity Name">
              <Input value={entity.name} onChange={(e) => updateEntityName(entityIndex, e.target.value)} />
            </Form.Item>
            {entity.properties.map((property, propertyIndex) => (
              <Space key={propertyIndex} style={{ display: 'flex', marginBottom: 8, alignItems: 'center' }} align="start">
                <Form.Item label="Collection Type" style={{ marginRight: '8px' }}>
                  <Select value={property.collectionType} onChange={(value) => updateProperty(entityIndex, propertyIndex, 'collectionType', value)} style={{ width: 150 }}>
                    <Select.Option value="">None</Select.Option>
                    {collectionTypes.map((type) => (
                      <Select.Option key={type} value={type}>{type}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Property Type" style={{ marginRight: '8px' }}>
                  <Select value={property.type} onChange={(value) => updateProperty(entityIndex, propertyIndex, 'type', value)} style={{ width: 200 }}>
                    {getTypeOptions(entities, entityIndex).map((type) => (
                      <Select.Option key={type} value={type}>{type}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Property Name" style={{ marginRight: '8px' }}>
                  <Input value={property.name} onChange={(e) => updateProperty(entityIndex, propertyIndex, 'name', e.target.value)} />
                </Form.Item>
                {propertyIndex === entity.properties.length - 1 && (
                  <Button type="dashed" onClick={() => addProperty(entityIndex)} icon={<PlusOutlined />} style={{ color: 'green', marginRight: '8px', marginTop: 6 }} />
                )}
                <Button type="dashed" onClick={() => removeProperty(entityIndex, propertyIndex)} icon={<MinusOutlined />} style={{ color: 'red', marginTop: 6 }} />
              </Space>
            ))}
          </Panel>
        ))}
      </Collapse>
    </>
  );
};

export default EntityForm;
