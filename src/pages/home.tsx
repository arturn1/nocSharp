import React, { useState } from 'react';
import { Button, Input, Form, Space, Select, Typography, Collapse, message } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Panel } = Collapse;

interface Property {
  name: string;
  type: string;
  collectionType: string;
}

interface Entity {
  name: string;
  properties: Property[];
}

const Home: React.FC = () => {
  const [projectName, setProjectName] = useState('');
  const [entities, setEntities] = useState<Entity[]>([]);

  const handleAddEntity = () => setEntities([...entities, { name: '', properties: [] }]);

  const handleAddProperty = (entityIndex: number) => {
    const newEntities = [...entities];
    newEntities[entityIndex].properties.push({ name: '', type: '', collectionType: '' });
    setEntities(newEntities);
  };

  const handleRemoveProperty = (entityIndex: number, propertyIndex: number) => {
    const newEntities = [...entities];
    newEntities[entityIndex].properties.splice(propertyIndex, 1);
    setEntities(newEntities);
  };

  const handleEntityChange = (index: number, name: string) => {
    const newEntities = [...entities];
    newEntities[index].name = name;
    if (newEntities[index].properties.length === 0) {
      newEntities[index].properties.push({ name: '', type: '', collectionType: '' });
    }
    setEntities(newEntities);
  };

  const handlePropertyChange = (entityIndex: number, propertyIndex: number, field: keyof Property, value: string) => {
    const newEntities = [...entities];
    newEntities[entityIndex].properties[propertyIndex][field] = value;
    setEntities(newEntities);
  };

  const csharpTypes = [
    'bool', 'byte', 'char', 'DateTime', 'decimal', 'double', 'dynamic', 'float', 'Guid', 
    'int', 'long', 'object', 'sbyte', 'short', 'string', 'TimeSpan', 'uint', 'ulong', 'ushort'
  ];

  const collectionTypes = [
    'BlockingCollection', 'ConcurrentDictionary', 'ConcurrentQueue', 'ConcurrentStack', 'Dictionary', 'HashSet', 
    'ICollection', 'IDictionary', 'IEnumerable', 'IList', 'KeyedCollection', 'LinkedList', 'List', 
    'ObservableCollection', 'ReadOnlyCollection', 'ReadOnlyDictionary', 'SortedDictionary', 'SortedList'
  ];

  const getTypeOptions = (entityIndex: number) => {
    const previousEntities = entities.slice(0, entityIndex).map(e => e.name).filter(name => name !== '');
    return [...csharpTypes, ...previousEntities];
  };

  const handleCreateProject = async () => {
    if (!projectName) {
      message.error('Project name is required');
      return;
    }
    try {
      await window.electron.executeCommand(`nc new ${projectName}`);
      message.success('Project created successfully');
      for (const entity of entities) {
        if (entity.name) {
          const fields = entity.properties.map(prop => {
            const collectionPrefix = prop.collectionType ? `${prop.collectionType}<` : '';
            const collectionSuffix = prop.collectionType ? '>' : '';
            return `${prop.name}:${collectionPrefix}${prop.type}${collectionSuffix}`;
          }).join(' ');
          await window.electron.executeCommand(`nc g e ${entity.name} ${fields}`);
          message.success(`Entity ${entity.name} created successfully`);
        }
      }
    } catch (error) {
      message.error(`Failed to create project: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Create Project</Title>
      <Form layout="vertical">
        <Form.Item label="Project Name">
          <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
        </Form.Item>
        <Button type="dashed" onClick={handleAddEntity} style={{ marginBottom: '20px' }}>Add Entity</Button>
        <Collapse accordion>
          {entities.map((entity, entityIndex) => (
            <Collapse.Panel header={entity.name === '' ? `Entity ${entityIndex + 1}` : entity.name} key={entityIndex}>
              <Form.Item label="Entity Name">
                <Input value={entity.name} onChange={(e) => handleEntityChange(entityIndex, e.target.value)} />
              </Form.Item>
              {entity.properties.map((property, propertyIndex) => (
                <Space key={propertyIndex} style={{ display: 'flex', marginBottom: 8 , alignItems: 'center'}} align="start">
                  <Form.Item label="Collection Type" style={{ marginRight: '8px' }}>
                    <Select value={property.collectionType} onChange={(value) => handlePropertyChange(entityIndex, propertyIndex, 'collectionType', value)} style={{ width: 150 }}>
                      <Select.Option value="">None</Select.Option>
                      {collectionTypes.map((type) => (
                        <Select.Option key={type} value={type}>{type}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item label="Property Type" style={{ marginRight: '8px' }}>
                    <Select value={property.type} onChange={(value) => handlePropertyChange(entityIndex, propertyIndex, 'type', value)} style={{ width: 200 }}>
                      {getTypeOptions(entityIndex).map((type) => (
                        <Select.Option key={type} value={type}>{type}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item label="Property Name" style={{ marginRight: '8px' }}>
                    <Input value={property.name} onChange={(e) => handlePropertyChange(entityIndex, propertyIndex, 'name', e.target.value)} />
                  </Form.Item>
                  {propertyIndex === entity.properties.length - 1 && (
                    <Button type="dashed" onClick={() => handleAddProperty(entityIndex)} icon={<PlusOutlined />} style={{ color: 'green', marginRight: '8px', marginTop:6 }} />
                  )}
                  <Button type="dashed" onClick={() => handleRemoveProperty(entityIndex, propertyIndex)} icon={<MinusOutlined />} style={{ color: 'red', marginTop:6 }} />
                </Space>
              ))}
            </Collapse.Panel>
          ))}
        </Collapse>
        {projectName && entities.length > 0 && (
          <Button type="primary" onClick={handleCreateProject} style={{ marginTop: '20px' }}>
            Create Project
          </Button>
        )}
      </Form>
    </div>
  );
};

export default Home;
