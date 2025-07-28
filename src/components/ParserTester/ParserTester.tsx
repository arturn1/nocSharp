import React, { useState } from 'react';
import { Card, Button, Input, Typography, List, Tag, Space, Divider } from 'antd';
import { CodeOutlined, PlayCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface ParsedProperty {
  name: string;
  type: string;
  collectionType: string;
}

interface ParsedEntity {
  name: string;
  properties: ParsedProperty[];
}

const ParserTester: React.FC = () => {
  const [inputCode, setInputCode] = useState(`namespace Domain.Entities
{

    public class PostsEntity : BaseEntity
    {
        public PostsEntity() { }

        public PostsEntity(string title, string body, string status, Guid UsersEntityID)
        {

            this.title = title;
            this.body = body;
            this.status = status;
            this.UsersEntityID = UsersEntityID;

        }

        public string title { get; set; }
        public string body { get; set; }
        public string status { get; set; }
        public Guid UsersEntityID { get; set; }
        public virtual UsersEntity UsersEntity { get; set; } // Navigation property to UsersEntity
        public ICollection<FollowsEntity> follows { get; set; } = new List<FollowsEntity>();

    }

    public class UsersEntity : BaseEntity
    {
        public UsersEntity() { }

        public UsersEntity(string username, string email)
        {
            this.username = username;
            this.email = email;
        }

        public string username { get; set; }
        public string email { get; set; }
        public virtual ICollection<PostsEntity> Posts { get; set; } = new List<PostsEntity>();
    }

}`);
  
  const [parsedEntities, setParsedEntities] = useState<ParsedEntity[]>([]);

  // Simulate the same parsing logic from main.ts
  const parseEntityProperties = (content: string): ParsedProperty[] => {
    const properties: ParsedProperty[] = [];
    
    // Enhanced regex to match C# properties with various patterns, including virtual
    const propertyRegex = /public\s+(?:virtual\s+)?(\w+(?:<[\w,\s]+>)?(?:\[\])?)\s+(\w+)\s*{\s*get;\s*set;\s*}(?:\s*=\s*[^;]+;)?/g;
    
    let match;
    while ((match = propertyRegex.exec(content)) !== null) {
      const [, type, name] = match;
      
      // Skip BaseEntity inherited properties
      if (name === 'Id' || name === 'CreatedAt' || name === 'UpdatedAt') {
        continue;
      }
      
      // Determine collection type and base type
      let collectionType = 'none';
      let baseType = type;
      
      if (type.includes('ICollection<')) {
        collectionType = 'ICollection';
        const collectionMatch = type.match(/ICollection<(\w+)>/);
        baseType = collectionMatch ? collectionMatch[1] : 'string';
      } else if (type.includes('List<')) {
        collectionType = 'List';
        const listMatch = type.match(/List<(\w+)>/);
        baseType = listMatch ? listMatch[1] : 'string';
      } else if (type.includes('IEnumerable<')) {
        collectionType = 'IEnumerable';
        const enumMatch = type.match(/IEnumerable<(\w+)>/);
        baseType = enumMatch ? enumMatch[1] : 'string';
      } else if (type.endsWith('[]')) {
        collectionType = 'Array';
        baseType = type.replace('[]', '');
      }
      
      // Handle navigation properties and foreign keys
      if (baseType.endsWith('Entity')) {
        if (collectionType === 'none') {
          // Check if it's a foreign key (ends with ID) or navigation property
          if (name.endsWith('ID') || name.endsWith('Id')) {
            baseType = 'Guid';
          } else {
            // Navigation property - keep the entity name but remove 'Entity' suffix
            baseType = baseType.replace('Entity', '');
          }
        } else {
          // Collection navigation property
          baseType = baseType.replace('Entity', '');
        }
      }
      
      // Map common C# types
      const typeMapping: { [key: string]: string } = {
        'string': 'string',
        'int': 'int',
        'Guid': 'Guid',
        'DateTime': 'DateTime',
        'decimal': 'decimal',
        'bool': 'bool',
        'double': 'double',
        'float': 'float',
        'long': 'long'
      };
      
      baseType = typeMapping[baseType] || baseType;
      
      properties.push({
        name: name,
        type: baseType,
        collectionType: collectionType
      });
    }
    
    return properties;
  };

  const parseEntities = (content: string): ParsedEntity[] => {
    const entities: ParsedEntity[] = [];
    
    // Enhanced regex to find entity class definitions, supporting namespace and various formatting
    const classRegex = /public\s+class\s+(\w+Entity)\s*:\s*\w+\s*\{([\s\S]*?)(?=\n\s*public\s+class|\n\s*\}[\s\S]*$)/g;
    
    let match;
    while ((match = classRegex.exec(content)) !== null) {
      const [, entityName, classBody] = match;
      const cleanEntityName = entityName.replace('Entity', '');
      
      // Only parse properties part, skip constructors
      const propertiesSection = classBody.split(/public\s+\w+Entity\s*\([^)]*\)/)[classBody.split(/public\s+\w+Entity\s*\([^)]*\)/).length - 1] || classBody;
      
      const properties = parseEntityProperties(propertiesSection);
      
      if (properties.length > 0) {
        entities.push({
          name: cleanEntityName,
          properties: properties
        });
      }
    }
    
    return entities;
  };

  const handleParse = () => {
    const entities = parseEntities(inputCode);
    setParsedEntities(entities);
  };

  const renderProperty = (property: ParsedProperty) => (
    <List.Item key={property.name}>
      <List.Item.Meta
        title={
          <Space>
            <Text strong>{property.name}</Text>
            <Tag color="blue">{property.type}</Tag>
            {property.collectionType !== 'none' && (
              <Tag color="orange">{property.collectionType}</Tag>
            )}
          </Space>
        }
      />
    </List.Item>
  );

  return (
    <Card 
      title={
        <Space>
          <CodeOutlined />
          C# Entity Parser Tester
        </Space>
      }
      size="small"
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Title level={5}>Input C# Code:</Title>
          <TextArea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            rows={20}
            style={{ fontFamily: 'monospace', fontSize: '12px' }}
          />
          <div style={{ marginTop: '8px' }}>
            <Button 
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleParse}
            >
              Parse Entities
            </Button>
          </div>
        </div>

        {parsedEntities.length > 0 && (
          <div>
            <Divider />
            <Title level={5}>Parsed Results ({parsedEntities.length} entities):</Title>
            {parsedEntities.map((entity, index) => (
              <Card 
                key={index}
                size="small" 
                title={`${entity.name} Entity`}
                style={{ marginBottom: '16px' }}
              >
                <Text type="secondary">
                  Properties: {entity.properties.length}
                </Text>
                <List
                  size="small"
                  dataSource={entity.properties}
                  renderItem={renderProperty}
                />
              </Card>
            ))}
          </div>
        )}

        {parsedEntities.length > 0 && (
          <div>
            <Divider />
            <Title level={5}>Generated nocsharp Commands:</Title>
            <div style={{ 
              background: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}>
              {parsedEntities.map((entity, index) => {
                const fields = entity.properties
                  .map(prop => {
                    let typeStr = prop.type;
                    if (prop.collectionType && prop.collectionType !== 'none') {
                      typeStr = `${prop.collectionType}<${prop.type}>`;
                    }
                    return `${prop.name}:${typeStr}`;
                  })
                  .join(' ');
                
                return (
                  <div key={index} style={{ marginBottom: '4px' }}>
                    <Text code>nocsharp s "{entity.name}" {fields}</Text>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default ParserTester;
