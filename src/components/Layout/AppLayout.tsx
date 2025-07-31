import React from 'react';
import { Layout, Menu, Typography, Space } from 'antd';
import { HomeOutlined, DatabaseOutlined, ScanOutlined, ToolOutlined } from '@ant-design/icons';

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
  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: 'import',
      icon: <DatabaseOutlined />,
      label: 'DBDiagram',
    },
    {
      key: 'scanner',
      icon: <ScanOutlined />,
      label: 'Editor',
    },
    {
      key: 'templates',
      icon: <ToolOutlined />,
      label: 'Templates',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        backgroundColor: '#fff', 
        borderBottom: '1px solid #f0f0f0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px'
      }}>
        <Space align="center" style={{ minWidth: '200px' }}>
          <Title level={4} style={{ margin: 0, fontSize: '18px', color: '#1890ff' }}>
            nocSharp
          </Title>
          {projectName && (
            <Text strong style={{ fontSize: '14px', color: '#666', whiteSpace: 'nowrap' }}>
              | {projectName}
            </Text>
          )}
        </Space>
        
        <Menu
          mode="horizontal"
          selectedKeys={[activeMenu]}
          items={menuItems}
          onClick={({ key }) => onMenuChange(key)}
          style={{ 
            border: 'none', 
            backgroundColor: 'transparent',
            flex: 1,
            justifyContent: 'center',
            maxWidth: '600px'
          }}
        />
      </Header>
      
      <Layout>
        <Content style={{ 
          padding: '24px', 
          overflow: 'auto', 
          maxHeight: 'calc(100vh - 64px)' 
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
