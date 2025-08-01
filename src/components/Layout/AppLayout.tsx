import React from 'react';
import { Layout, Menu, Typography, Space, Button, Tooltip, Badge } from 'antd';
import { 
  HomeOutlined, 
  DatabaseOutlined, 
  ScanOutlined, 
  ToolOutlined, 
  DashboardOutlined, 
  BulbOutlined, 
  BulbFilled,
  CodeOutlined,
  SettingOutlined,
  PlusCircleOutlined,
  ApiOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Entity } from '../../models/Entity';
import { EntityChangeDetector } from '../../services/EntityChangeDetector';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface AppLayoutProps {
  activeMenu: string;
  projectName?: string;
  entities?: Entity[];
  originalEntities?: Entity[];
  onMenuChange: (key: string) => void;
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  activeMenu,
  projectName,
  entities = [],
  originalEntities = [],
  onMenuChange,
  children
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Usar EntityChangeDetector para detectar modificações corretamente
  const changeDetection = originalEntities.length > 0 && entities.length > 0 
    ? EntityChangeDetector.detectChanges(entities, originalEntities)
    : { 
        hasChanges: false, 
        addedEntities: [] as Entity[], 
        modifiedEntities: [] as Entity[], 
        removedEntities: [] as Entity[],
        modifiedCount: 0 
      };
  
  const hasModifications = changeDetection.hasChanges;
  const totalModifications = changeDetection.modifiedCount;

  // Cores frias e sobrias
  const colors = {
    primary: '#4A90E2',
    secondary: '#5D6D7E',
    accent: '#52648B',
    background: isDarkMode ? '#0F172A' : '#F8FAFC',
    surface: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    text: isDarkMode ? '#F1F5F9' : '#1E293B',
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B'
  };

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'import',
      icon: <DatabaseOutlined />,
      label: 'Importar',
    },
    {
      key: 'scanner',
      icon: <CodeOutlined />,
      label: 'Editor',
    },
    {
      key: 'logs',
      icon: <FileTextOutlined />,
      label: 'Logs',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: colors.background }}>
      <Header style={{ 
        background: `linear-gradient(135deg, ${colors.surface} 0%, ${isDarkMode ? '#334155' : '#F1F5F9'} 100%)`,
        borderBottom: `1px solid ${colors.border}`,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        boxShadow: isDarkMode 
          ? '0 4px 20px rgba(0, 0, 0, 0.3)'
          : '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Brand Section */}
        <Space align="center" style={{ minWidth: '200px', flex: '0 0 auto' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 2px 12px ${colors.primary}30`
          }}>
            <CodeOutlined style={{ fontSize: '18px', color: 'white' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <Title level={4} style={{ 
              margin: 0, 
              fontSize: '18px', 
              color: colors.primary,
              fontWeight: '700'
            }}>
              nocSharp
            </Title>
            {projectName && (
              <Text style={{ 
                fontSize: '11px', 
                color: colors.textSecondary,
                display: 'block',
                lineHeight: '1.2',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '150px'
              }}>
                {projectName}
              </Text>
            )}
          </div>
        </Space>
        
        {/* Navigation Menu */}
        <Menu
          mode="horizontal"
          selectedKeys={[activeMenu]}
          items={menuItems.map(item => ({
            ...item,
            style: {
              color: activeMenu === item.key ? colors.primary : colors.textSecondary,
              fontWeight: activeMenu === item.key ? '600' : '500'
            }
          }))}
          onClick={({ key }) => onMenuChange(key)}
          style={{ 
            border: 'none', 
            backgroundColor: 'transparent',
            flex: 1,
            justifyContent: 'center',
            maxWidth: '500px',
            fontSize: '13px'
          }}
        />

        {/* Theme Toggle and Project Status */}
        <Space size={12} align="center" style={{ flex: '0 0 auto' }}>
          {projectName && (
            <Badge 
              status={hasModifications ? 'processing' : 'success'} 
              text={
                <Text style={{ 
                  color: hasModifications 
                    ? (isDarkMode ? '#faad14' : '#d48806')  // Amarelo para modificações
                    : colors.primary,  // Azul para sincronizado
                  fontSize: '11px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}>
                  {hasModifications 
                    ? `${totalModifications} Modificações`
                    : 'Sincronizado'}
                </Text>
              }
            />
          )}
          
          <Tooltip title={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}>
            <Button
              type="text"
              icon={isDarkMode ? <BulbOutlined /> : <BulbFilled />}
              onClick={toggleTheme}
              style={{
                color: colors.textSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                width: '36px',
                height: '36px',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
            />
          </Tooltip>
        </Space>
      </Header>
      
      <Layout style={{ backgroundColor: colors.background }}>
        <Content style={{ 
          padding: '0',
          overflow: 'auto', 
          maxHeight: 'calc(100vh - 64px)',
          backgroundColor: colors.background
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
