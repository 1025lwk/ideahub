import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Divider, Alert } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, BulbOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text, Paragraph } = Typography;

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onFinish = async (values: {
    email: string;
    username: string;
    password: string;
  }) => {
    setLoading(true);
    setError('');
    try {
      await register(values);
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; error?: string } } };
      setError(e.response?.data?.message || e.response?.data?.error || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
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
      <Card style={{ width: '100%', maxWidth: 480, boxShadow: '0 8px 32px rgba(0,0,0,0.16)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <BulbOutlined style={{ fontSize: 40, color: '#1677ff' }} />
          <Title level={2} style={{ marginBottom: 4 }}>
            注册 IdeaHub
          </Title>
          <Text type="secondary">买卖创意，AI 一键生成代码</Text>
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

        <Form
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
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
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, max: 20, message: '用户名长度 2-20 字符' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少 6 位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              注册
            </Button>
          </Form.Item>
        </Form>

        <Divider />
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">已有账号？</Text> <Link to="/login">立即登录</Link>
        </div>
        <Paragraph style={{ textAlign: 'center', marginTop: 12, fontSize: 12 }} type="secondary">
          注册即表示同意 IdeaHub 服务条款与隐私政策
        </Paragraph>
      </Card>
    </div>
  );
}
