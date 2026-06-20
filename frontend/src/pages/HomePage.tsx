import { useEffect, useState } from 'react';
import { Button, Typography, Row, Col, Spin, Card, Space, Statistic } from 'antd';
import {
  RocketOutlined,
  BulbOutlined,
  CodeOutlined,
  WalletOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import IdeaCard from '../components/IdeaCard';
import { listIdeas } from '../api/ideas';
import type { Idea } from '../types';

const { Title, Paragraph, Text } = Typography;

export default function HomePage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    listIdeas({ sort: 'popular', pageSize: 8 })
      .then((res) => setIdeas(res.list))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero 区 */}
      <section
        className="hero-gradient"
        style={{
          padding: '80px 24px',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Title level={1} style={{ color: '#fff', fontSize: 48, marginBottom: 16 }}>
            买卖创意点子，AI 一键生成代码
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, marginBottom: 32 }}>
            IdeaHub 是创意交易与AI代码生成平台。在这里发现优质创意、出售你的灵感，
            并通过AI将创意一键转化为可运行的项目代码。
          </Paragraph>
          <Space size="large" wrap>
            <Button
              type="primary"
              size="large"
              icon={<RocketOutlined />}
              onClick={() => navigate('/marketplace')}
              style={{ background: '#fff', color: '#1677ff', border: 'none', fontWeight: 600 }}
            >
              探索创意市场
            </Button>
            <Button
              size="large"
              ghost
              icon={<BulbOutlined />}
              onClick={() => navigate('/publish')}
              style={{ borderColor: '#fff', color: '#fff' }}
            >
              发布我的创意
            </Button>
          </Space>
        </div>
      </section>

      {/* 平台数据 */}
      <section style={{ padding: '40px 24px', background: '#fff' }}>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={12} md={6}>
            <Statistic title="创意点子" value={1200} prefix={<BulbOutlined />} />
          </Col>
          <Col xs={12} md={6}>
            <Statistic title="AI 生成项目" value={580} prefix={<CodeOutlined />} />
          </Col>
          <Col xs={12} md={6}>
            <Statistic title="活跃创作者" value={320} prefix={<RocketOutlined />} />
          </Col>
          <Col xs={12} md={6}>
            <Statistic title="累计交易额" value={89200} prefix="¥" />
          </Col>
        </Row>
      </section>

      {/* 平台特色 */}
      <section style={{ padding: '60px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
          为什么选择 IdeaHub
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card hoverable style={{ height: '100%' }}>
              <RocketOutlined style={{ fontSize: 36, color: '#1677ff', marginBottom: 16 }} />
              <Title level={4}>创意交易市场</Title>
              <Paragraph type="secondary">
                浏览海量创意点子，按分类、标签、价格筛选。购买后即可解锁完整方案，
                卖家获得 90% 收益分成。
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card hoverable style={{ height: '100%' }}>
              <CodeOutlined style={{ fontSize: 36, color: '#52c41a', marginBottom: 16 }} />
              <Title level={4}>AI 一键生成代码</Title>
              <Paragraph type="secondary">
                购买创意后，补充需求与技术偏好，AI 自动构造 Prompt 并异步生成
                多文件代码项目，打包 ZIP 下载即用。
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card hoverable style={{ height: '100%' }}>
              <SafetyCertificateOutlined
                style={{ fontSize: 36, color: '#faad14', marginBottom: 16 }}
              />
              <Title level={4}>钱包余额安全</Title>
              <Paragraph type="secondary">
                平台钱包系统基于数据库事务，资金变动全程流水可追溯。充值、消费、
                收益分配原子化执行，杜绝资金错账。
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </section>

      {/* 流程说明 */}
      <section style={{ padding: '60px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
        三步将创意变成可运行项目
          </Title>
          <Row gutter={[24, 24]}>
            {[
              {
                icon: <WalletOutlined />,
                title: '1. 充值钱包',
                desc: '注册账号后，向平台钱包充值，余额可用于购买创意和AI生成服务。',
                color: '#1677ff',
              },
              {
                icon: <BulbOutlined />,
                title: '2. 购买创意',
                desc: '在创意市场找到心仪的点子，支付解锁完整内容，包括技术方案与实现细节。',
                color: '#52c41a',
              },
              {
                icon: <ThunderboltOutlined />,
                title: '3. AI 生成代码',
                desc: '在创意详情页点击「AI一键开发」，补充需求后异步生成可运行代码包。',
                color: '#722ed1',
              },
            ].map((step, idx) => (
              <Col xs={24} md={8} key={idx}>
                <Card style={{ height: '100%', textAlign: 'center' }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: `${step.color}15`,
                      color: step.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      margin: '0 auto 16px',
                    }}
                  >
                    {step.icon}
                  </div>
                  <Title level={4}>{step.title}</Title>
                  <Paragraph type="secondary">{step.desc}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* 热门创意 */}
      <section style={{ padding: '60px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            热门创意
          </Title>
          <Link to="/marketplace">
            <Button type="link" icon={<ArrowRightOutlined />} iconPosition="end">
              查看全部
            </Button>
          </Link>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {ideas.map((idea) => (
              <Col xs={24} sm={12} md={8} lg={6} key={idea.id}>
                <IdeaCard idea={idea} />
              </Col>
            ))}
          </Row>
        )}
      </section>

      {/* CTA */}
      <section
        className="hero-gradient"
        style={{ padding: '60px 24px', textAlign: 'center', color: '#fff' }}
      >
        <Title level={2} style={{ color: '#fff', marginBottom: 16 }}>
          立即开始你的创意之旅
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, marginBottom: 32 }}>
          加入 IdeaHub，让创意被看见，让灵感变成现实
        </Paragraph>
        <Space size="large">
          <Button
            size="large"
            onClick={() => navigate('/register')}
            style={{ background: '#fff', color: '#1677ff', border: 'none', fontWeight: 600 }}
          >
            免费注册
          </Button>
          <Button size="large" ghost onClick={() => navigate('/marketplace')} style={{ color: '#fff', borderColor: '#fff' }}>
            浏览市场
          </Button>
        </Space>
      </section>
    </div>
  );
}
