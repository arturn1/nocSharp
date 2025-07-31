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
  SettingOutlined 
} from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface AppLayoutProps {
  activeMenu: string;
  projectName?: string;
  onMenuChange: (key: string) => void;
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  activeMenu,
  projectName,
  onMenuChange,
  children
}) => {
  const { isDarkMode, toggleTheme } = useTheme();

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
      key: 'templates',
      icon: <ToolOutlined />,
      label: 'Templates',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: colors.background }}>
      <Header style={{ 
        background: `linear-gradient(135deg, ${colors.surface} 0%, ${isDarkMode ? '#334155' : '#F1F5F9'} 100%)`,
        borderBottom: `1px solid ${colors.border}`,
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
        boxShadow: isDarkMode 
          ? '0 4px 20px rgba(0, 0, 0, 0.3)'
          : '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Brand Section */}
        <Space align="center" style={{ minWidth: '250px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 16px ${colors.primary}30`
          }}>
            <CodeOutlined style={{ fontSize: '20px', color: 'white' }} />
          </div>
          <div>
            <Title level={4} style={{ 
              margin: 0, 
              fontSize: '20px', 
              color: colors.primary,
              fontWeight: '700'
            }}>
              nocSharp
            </Title>
            {projectName && (
              <Text style={{ 
                fontSize: '12px', 
                color: colors.textSecondary,
                display: 'block',
                lineHeight: '1.2'
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
            maxWidth: '600px',
            fontSize: '14px'
          }}
        />

        {/* Theme Toggle and Project Status */}
        <Space size="large" align="center">
          {projectName && (
            <Badge 
              status="processing" 
              text={
                <Text style={{ 
                  color: colors.primary,
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  Projeto Ativo
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
                borderRadius: '8px',
                width: '40px',
                height: '40px',
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
          maxHeight: 'calc(100vh - 72px)',
          backgroundColor: colors.background
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
