import React, { useState } from 'react';
import { 
  Button, 
  Modal, 
  List, 
  Typography, 
  Tag, 
  Popconfirm, 
  Space, 
  Row, 
  Col, 
  Card,
  Input,
  Select,
  Tooltip,
  Statistic
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  ThunderboltOutlined,
  SearchOutlined,
  FilterOutlined,
  ShoppingCartOutlined,
  EditOutlined,
  DollarOutlined,
  ProjectOutlined,
  BookOutlined,
  ContainerOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { Entity } from '../../models/Entity';
import { TemplateService, EntityTemplate as Template } from '../../services/TemplateService';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface EntityTemplatesProps {
  onApplyTemplate: (entities: Entity[]) => void;
}

const getTemplateIcon = (iconName: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    ShoppingCartOutlined: <ShoppingCartOutlined />,
    EditOutlined: <EditOutlined />,
    DollarOutlined: <DollarOutlined />,
    ProjectOutlined: <ProjectOutlined />,
    BookOutlined: <BookOutlined />,
    ContainerOutlined: <ContainerOutlined />,
    HeartOutlined: <HeartOutlined />
  };
  return iconMap[iconName] || <ThunderboltOutlined />;
};

const EntityTemplates: React.FC<EntityTemplatesProps> = ({ onApplyTemplate }) => {
  const { isDarkMode } = useTheme();
  const [templates] = useState<Template[]>(TemplateService.getAllTemplates());
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(templates);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const colors = {
    background: isDarkMode 
      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    surface: isDarkMode ? '#1e293b' : '#ffffff',
    primary: '#4A90E2',
    secondary: '#5D6D7E',
    accent: '#52648B',
    text: isDarkMode ? '#f1f5f9' : '#1e293b',
    textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
    success: '#22c55e'
  };

  const categories = ['all', ...TemplateService.getCategories()];

  React.useEffect(() => {
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    setFilteredTemplates(filtered);
  }, [searchTerm, selectedCategory, templates]);

  const handleApplyTemplate = (template: Template) => {
    onApplyTemplate(template.entities);
    setIsModalVisible(false);
  };

  const handleDeleteTemplate = (templateId: string) => {
    TemplateService.deleteTemplate(templateId);
    // Atualizar a lista localmente
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    setFilteredTemplates(updatedTemplates.filter(template => {
      const matchesSearch = !searchTerm || 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    }));
  };

  const showTemplateDetails = (template: Template) => {
    setSelectedTemplate(template);
    setIsModalVisible(true);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header with Search and Filters */}
      <Card
        className="animate-fade-in-up"
        style={{
          backgroundColor: colors.surface,
          borderColor: isDarkMode ? '#374151' : '#e2e8f0',
          borderRadius: '12px',
          marginBottom: '24px'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} sm={12} lg={8}>
            <Space size="middle" style={{ width: '100%' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ThunderboltOutlined style={{ fontSize: '24px', color: 'white' }} />
              </div>
              <div>
                <Title level={4} style={{ margin: 0, color: colors.text }}>
                  Templates Disponíveis
                </Title>
                <Text style={{ color: colors.textSecondary }}>
                  {filteredTemplates.length} de {templates.length} templates
                </Text>
              </div>
            </Space>
          </Col>
          
          <Col xs={24} sm={12} lg={8}>
            <Search
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
              prefix={<SearchOutlined style={{ color: colors.textSecondary }} />}
            />
          </Col>
          
          <Col xs={24} lg={8}>
            <Row gutter={12}>
              <Col flex={1}>
                <Select
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  style={{ width: '100%' }}
                  placeholder="Filtrar por categoria"
                  suffixIcon={<FilterOutlined style={{ color: colors.textSecondary }} />}
                >
                  {categories.map(category => (
                    <Option key={category} value={category}>
                      {category === 'all' ? 'Todas as Categorias' : category}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Templates Grid */}
      <List
        grid={{ 
          gutter: [24, 24], 
          xs: 1, 
          sm: 1, 
          md: 2, 
          lg: 2, 
          xl: 3, 
          xxl: 3 
        }}
        dataSource={filteredTemplates}
        renderItem={(template, index) => (
          <List.Item>
            <Card
              className="animate-fade-in-up hover-lift"
              hoverable
              style={{
                backgroundColor: colors.surface,
                borderColor: isDarkMode ? '#374151' : '#e2e8f0',
                borderRadius: '16px',
                height: '100%',
                animationDelay: `${index * 0.1}s`
              }}
              bodyStyle={{ padding: '24px' }}
              actions={[
                <Tooltip title="Visualizar detalhes">
                  <Button 
                    type="text" 
                    icon={<EyeOutlined />}
                    onClick={() => showTemplateDetails(template)}
                    style={{ color: colors.primary }}
                  />
                </Tooltip>,
                <Tooltip title="Aplicar template">
                  <Button 
                    type="text" 
                    icon={<ThunderboltOutlined />}
                    onClick={() => handleApplyTemplate(template)}
                    style={{ color: colors.success }}
                  />
                </Tooltip>,
                <Popconfirm
                  title="Excluir este template?"
                  description="Esta ação não pode ser desfeita."
                  onConfirm={() => handleDeleteTemplate(template.id)}
                  okText="Sim"
                  cancelText="Não"
                >
                  <Tooltip title="Excluir template">
                    <Button 
                      type="text" 
                      icon={<DeleteOutlined />}
                      danger
                      style={{ color: '#ef4444' }}
                    />
                  </Tooltip>
                </Popconfirm>
              ]}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {/* Header */}
                <Row align="middle" gutter={16}>
                  <Col>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getTemplateIcon(template.icon)}
                    </div>
                  </Col>
                  <Col flex={1}>
                    <Title level={5} style={{ margin: 0, color: colors.text }}>
                      {template.name}
                    </Title>
                    <Tag
                      style={{
                        background: `${colors.primary}20`,
                        border: `1px solid ${colors.primary}40`,
                        borderRadius: '12px',
                        color: colors.primary,
                        fontSize: '11px',
                        marginTop: '4px'
                      }}
                    >
                      {template.category}
                    </Tag>
                  </Col>
                </Row>

                {/* Description */}
                <Text 
                  style={{ 
                    color: colors.textSecondary,
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}
                >
                  {template.description}
                </Text>

                {/* Stats */}
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title={
                        <Text style={{ color: colors.textSecondary, fontSize: '12px' }}>
                          Entidades
                        </Text>
                      }
                      value={template.entities.length}
                      valueStyle={{ 
                        color: colors.text, 
                        fontSize: '18px',
                        fontWeight: '600'
                      }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title={
                        <Text style={{ color: colors.textSecondary, fontSize: '12px' }}>
                          Tags
                        </Text>
                      }
                      value={template.tags.length}
                      valueStyle={{ 
                        color: colors.text, 
                        fontSize: '18px',
                        fontWeight: '600'
                      }}
                    />
                  </Col>
                </Row>

                {/* Tags */}
                <div>
                  {template.tags.slice(0, 3).map(tag => (
                    <Tag 
                      key={tag}
                      style={{
                        background: `${colors.secondary}20`,
                        border: `1px solid ${colors.secondary}40`,
                        borderRadius: '8px',
                        color: colors.secondary,
                        fontSize: '11px',
                        margin: '2px'
                      }}
                    >
                      {tag}
                    </Tag>
                  ))}
                  {template.tags.length > 3 && (
                    <Tag 
                      style={{
                        background: `${colors.textSecondary}20`,
                        border: `1px solid ${colors.textSecondary}40`,
                        borderRadius: '8px',
                        color: colors.textSecondary,
                        fontSize: '11px',
                        margin: '2px'
                      }}
                    >
                      +{template.tags.length - 3}
                    </Tag>
                  )}
                </div>
              </Space>
            </Card>
          </List.Item>
        )}
      />

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            {selectedTemplate && getTemplateIcon(selectedTemplate.icon)}
            <span>{selectedTemplate?.name}</span>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancelar
          </Button>,
          <Button 
            key="apply" 
            type="primary" 
            onClick={() => selectedTemplate && handleApplyTemplate(selectedTemplate)}
            style={{
              background: `linear-gradient(135deg, ${colors.success} 0%, #16a34a 100%)`,
              border: 'none'
            }}
          >
            Aplicar Template
          </Button>
        ]}
        width={800}
        style={{
          top: 20
        }}
      >
        {selectedTemplate && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text style={{ fontSize: '16px', color: colors.text }}>
                {selectedTemplate.description}
              </Text>
              <div style={{ margin: '16px 0' }}>
                {selectedTemplate.tags.map(tag => (
                  <Tag 
                    key={tag}
                    style={{
                      background: `${colors.primary}20`,
                      border: `1px solid ${colors.primary}40`,
                      borderRadius: '12px',
                      color: colors.primary,
                      margin: '4px'
                    }}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>
            
            <div>
              <Title level={5} style={{ color: colors.text }}>
                Entidades ({selectedTemplate.entities.length})
              </Title>
              <List
                dataSource={selectedTemplate.entities}
                renderItem={(entity) => (
                  <List.Item>
                    <Card 
                      size="small" 
                      style={{ 
                        width: '100%',
                        backgroundColor: colors.surface,
                        borderColor: isDarkMode ? '#374151' : '#e2e8f0'
                      }}
                    >
                      <Card.Meta
                        title={
                          <Text style={{ color: colors.text }}>
                            {entity.name}
                          </Text>
                        }
                        description={
                          <div>
                            <Text style={{ color: colors.textSecondary }}>
                              <strong>Propriedades:</strong> {entity.properties.map(p => p.name).join(', ')}
                            </Text>
                          </div>
                        }
                      />
                    </Card>
                  </List.Item>
                )}
              />
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default EntityTemplates;
