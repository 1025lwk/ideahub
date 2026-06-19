import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Avatar,
  Spin,
  Result,
  Divider,
  Modal,
  Descriptions,
  Row,
  Col,
  Statistic,
  message,
} from 'antd';
import {
  UserOutlined,
  ShoppingOutlined,
  LockOutlined,
  CodeOutlined,
  WalletOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { getIdea } from '../api/ideas';
import { purchaseIdea } from '../api/orders';
import { getBalance } from '../api/wallet';
import { useAuth } from '../context/AuthContext';
import type { Idea } from '../types';

const { Title, Paragraph, Text } = Typography;

export default function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getIdea(id)
      .then(setIdea)
      .finally(() => setLoading(false));
  }, [id]);

  // 已登录用户拉取余额
  useEffect(() => {
    if (isAuthenticated) {
      getBalance().then((res) => setBalance(String(res.balance))).catch(() => {});
    }
  }, [isAuthenticated]);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setPurchasing(true);
    try {
      await purchaseIdea(idea!.id);
      message.success('购买成功！已解锁完整内容');
      // 刷新创意详情以获取 fullContent
      const updated = await getIdea(idea!.id);
      setIdea(updated);
      // 刷新余额
      const walletRes = await getBalance();
      setBalance(String(walletRes.balance));
      setPurchaseModalOpen(false);
    } catch (err) {
      // 错误已由拦截器统一提示
      void err;
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="page-container">
        <Result status="404" title="创意不存在" subTitle="该创意可能已被下架或删除" extra={<Link to="/marketplace">返回市场</Link>} />
      </div>
    );
  }

  const isOwner = user?.id === idea.sellerId;
  const hasFullContent = !!idea.fullContent;
  const price = parseFloat(idea.price);
  const balanceNum = parseFloat(balance);
  const canAfford = balanceNum >= price;

  return (
    <div className="page-container">
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ padding: '0 0 16px' }}
      >
        返回
      </Button>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          {/* 创意主信息 */}
          <Card>
            <div style={{ marginBottom: 16 }}>
              {idea.category && <Tag color="blue">{idea.category.name}</Tag>}
              {idea.tags?.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
            <Title level={2}>{idea.title}</Title>
            <Paragraph type="secondary" style={{ fontSize: 16 }}>
              {idea.description}
            </Paragraph>

            <Divider />

            {/* 卖家信息 */}
            <Space size="middle">
              <Avatar size={48} icon={<UserOutlined />} src={idea.seller?.avatar || undefined} />
              <div>
                <Text strong>{idea.seller?.username || '匿名卖家'}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  创作者
                </Text>
              </div>
            </Space>

            <Divider />

            {/* 预览内容 */}
            <Title level={4}>创意预览</Title>
            <div
              style={{
                background: '#fafafa',
                padding: 16,
                borderRadius: 8,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.8,
              }}
            >
              {idea.previewContent}
            </div>

            {/* 完整内容（已购买或本人发布可见） */}
            {hasFullContent ? (
              <>
                <Divider />
                <Title level={4}>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  完整内容（已解锁）
                </Title>
                <div
                  style={{
                    background: '#f6ffed',
                    border: '1px solid #b7eb8f',
                    padding: 16,
                    borderRadius: 8,
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.8,
                  }}
                >
                  {idea.fullContent}
                </div>
              </>
            ) : (
              <>
                <Divider />
                <div
                  style={{
                    background: '#fffbe6',
                    border: '1px solid #ffe58f',
                    padding: 24,
                    borderRadius: 8,
                    textAlign: 'center',
                  }}
                >
                  <LockOutlined style={{ fontSize: 32, color: '#faad14', marginBottom: 12 }} />
                  <Title level={5} style={{ marginBottom: 4 }}>
                    完整内容已锁定
                  </Title>
                  <Text type="secondary">购买后即可查看完整方案、技术细节与实现思路</Text>
                </div>
              </>
            )}
          </Card>
        </Col>

        {/* 侧边栏：购买/AI生成 */}
        <Col xs={24} md={8}>
          <Card style={{ position: 'sticky', top: 80 }}>
            <Statistic
              title="创意价格"
              value={price}
              precision={2}
              prefix="¥"
              valueStyle={{ color: price === 0 ? '#52c41a' : '#fa541c', fontSize: 32 }}
            />
            <Divider style={{ margin: '16px 0' }} />

            <Descriptions column={1} size="small">
              <Descriptions.Item label="购买次数">{idea.purchaseCount} 次</Descriptions.Item>
              <Descriptions.Item label="发布时间">
                {new Date(idea.createdAt).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="当前余额">¥{balance}</Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '16px 0' }} />

            {isOwner ? (
              <>
                <Button type="primary" block disabled icon={<ShoppingOutlined />}>
                  这是您发布的创意
                </Button>
                <Button
                  block
                  style={{ marginTop: 8 }}
                  icon={<CodeOutlined />}
                  onClick={() => navigate(`/ai/generate/${idea.id}`)}
                >
                  AI 一键生成代码
                </Button>
              </>
            ) : hasFullContent ? (
              <>
                <Button type="primary" block disabled icon={<CheckCircleOutlined />}>
                  已购买
                </Button>
                <Button
                  type="default"
                  block
                  style={{ marginTop: 8 }}
                  icon={<CodeOutlined />}
                  onClick={() => navigate(`/ai/generate/${idea.id}`)}
                >
                  AI 一键生成代码
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<ShoppingOutlined />}
                  loading={purchasing}
                  onClick={() => setPurchaseModalOpen(true)}
                >
                  立即购买解锁
                </Button>
                {!canAfford && (
                  <div style={{ marginTop: 8, textAlign: 'center' }}>
                    <Text type="danger" style={{ fontSize: 12 }}>
                      余额不足，请先充值
                    </Text>
                    <Button
                      type="link"
                      size="small"
                      icon={<WalletOutlined />}
                      onClick={() => navigate('/dashboard?tab=wallet')}
                    >
                      去充值
                    </Button>
                  </div>
                )}
              </>
            )}

            <Divider style={{ margin: '16px 0' }} />
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
              <p style={{ margin: '4px 0' }}>· 购买后可查看完整内容并使用AI生成代码</p>
              <p style={{ margin: '4px 0' }}>· 卖家获得 90% 收益，平台抽成 10%</p>
              <p style={{ margin: '4px 0' }}>· AI 生成服务额外扣费，平台抽成 20%</p>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 购买确认弹窗 */}
      <Modal
        title="确认购买"
        open={purchaseModalOpen}
        onCancel={() => setPurchaseModalOpen(false)}
        onOk={handlePurchase}
        confirmLoading={purchasing}
        okText="确认购买"
        cancelText="取消"
      >
        <Descriptions column={1}>
          <Descriptions.Item label="创意标题">{idea.title}</Descriptions.Item>
          <Descriptions.Item label="价格">¥{idea.price}</Descriptions.Item>
          <Descriptions.Item label="当前余额">¥{balance}</Descriptions.Item>
          <Descriptions.Item label="购买后余额">
            ¥{(balanceNum - price).toFixed(2)}
          </Descriptions.Item>
        </Descriptions>
        {!canAfford && (
          <div style={{ color: '#ff4d4f', marginTop: 8 }}>
            余额不足，请先
            <Link to="/dashboard?tab=wallet">充值</Link>
          </div>
        )}
      </Modal>
    </div>
  );
}
