import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Divider, Alert, Space } from 'antd';
import { MailOutlined, LockOutlined, BulbOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Paragraph, Text } = Typography;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError('');
    try {
      await login(values.email, values.password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email: string) => {
    // 通过 DOM 设置表单值
    const emailInput = document.getElementById('login_email') as HTMLInputElement;
    const pwdInput = document.getElementById('login_password') as HTMLInputElement;
    if (emailInput) emailInput.value = email;
    if (pwdInput) pwdInput.value = '123456';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
        padding: 24,
      }}
    >
      <Card style={{ width: '100%', maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.16)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <BulbOutlined style={{ fontSize: 40, color: '#1677ff' }} />
          <Title level={2} style={{ marginBottom: 4 }}>
            IdeaHub
          </Title>
          <Text type="secondary">登录创意交易平台</Text>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            showIcon
            style={{ marginBottom: 16 }}
            closable
            onClose={() => setError('')}
          />
        )}

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="请输入邮箱" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider>演示账号</Divider>
        <Space wrap style={{ justifyContent: 'center', width: '100%' }}>
          <Button size="small" onClick={() => fillDemo('buyer@ideahub.com')}>
            买家
          </Button>
          <Button size="small" onClick={() => fillDemo('creator@ideahub.com')}>
            卖家1
          </Button>
          <Button size="small" onClick={() => fillDemo('dev@ideahub.com')}>
            卖家2
          </Button>
          <Button size="small" onClick={() => fillDemo('admin@ideahub.com')}>
            管理员
          </Button>
        </Space>
        <Paragraph style={{ textAlign: 'center', marginTop: 8, fontSize: 12 }} type="secondary">
          所有演示账号密码均为 123456
        </Paragraph>

        <Divider />
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">还没有账号？</Text>{' '}
          <Link to="/register">立即注册</Link>
        </div>
      </Card>
    </div>
  );
}
