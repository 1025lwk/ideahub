import { Layout, Menu, Button, Dropdown, Avatar, Space, Badge } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  PlusOutlined,
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  WalletOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Content, Footer } = Layout;

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
    { key: '/marketplace', icon: <AppstoreOutlined />, label: <Link to="/marketplace">创意市场</Link> },
  ];

  const userMenuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '我的仪表盘',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: 'wallet',
      icon: <WalletOutlined />,
      label: '我的钱包',
      onClick: () => navigate('/dashboard?tab=wallet'),
    },
    {
      key: 'publish',
      icon: <PlusOutlined />,
      label: '发布创意',
      onClick: () => navigate('/publish'),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout();
        navigate('/');
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', marginRight: 40 }}>
          <BulbOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          <span style={{ fontSize: 20, fontWeight: 700, color: '#1677ff', marginLeft: 8 }}>
            IdeaHub
          </span>
        </Link>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ flex: 1, minWidth: 0, border: 'none' }}
        />
        <Space size="middle">
          {isAuthenticated ? (
            <>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/publish')}>
                发布创意
              </Button>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Space style={{ cursor: 'pointer' }}>
                  <Badge count={0} showZero={false}>
                    <Avatar
                      size="small"
                      icon={<UserOutlined />}
                      src={user?.avatar || undefined}
                      style={{ backgroundColor: '#1677ff' }}
                    />
                  </Badge>
                  <span>{user?.username}</span>
                </Space>
              </Dropdown>
            </>
          ) : (
            <>
              <Button type="text" onClick={() => navigate('/login')}>
                登录
              </Button>
              <Button type="primary" onClick={() => navigate('/register')}>
                注册
              </Button>
            </>
          )}
        </Space>
      </Header>
      <Content>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: 'center', background: '#001529', color: 'rgba(255,255,255,0.65)' }}>
        <div>
          <p style={{ margin: 0 }}>IdeaHub ©{new Date().getFullYear()} · 创意交易平台</p>
          <p style={{ margin: '4px 0 0', fontSize: 12 }}>
            买卖创意点子 · AI一键生成代码项目 · 让创意变成现实
          </p>
        </div>
      </Footer>
    </Layout>
  );
}
