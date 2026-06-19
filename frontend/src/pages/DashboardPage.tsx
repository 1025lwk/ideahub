import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Tabs,
  Card,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
  Modal,
  InputNumber,
  message,
  Empty,
  List,
  Avatar,
} from 'antd';
import {
  WalletOutlined,
  BulbOutlined,
  ShoppingOutlined,
  CodeOutlined,
  PlusOutlined,
  ReloadOutlined,
  DollarOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { getBalance, recharge, getTransactions } from '../api/wallet';
import { getMyIdeas, deleteIdea } from '../api/ideas';
import { getMyPurchases, getMySales, getMyEarnings } from '../api/orders';
import { getMyAIRequests, downloadCode } from '../api/ai';
import type {
  WalletTransaction,
  Idea,
  Order,
  AIRequest,
  TransactionType,
  AIRequestStatus,
  IdeaStatus,
} from '../types';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

  // 钱包
  const [balance, setBalance] = useState('0');
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(50);

  // 我的创意
  const [myIdeas, setMyIdeas] = useState<Idea[]>([]);
  const [myIdeasTotal, setMyIdeasTotal] = useState(0);

  // 购买记录
  const [purchases, setPurchases] = useState<Order[]>([]);
  const [purchasesTotal, setPurchasesTotal] = useState(0);

  // 销售记录
  const [sales, setSales] = useState<Order[]>([]);
  const [salesTotal, setSalesTotal] = useState(0);
  const [earnings, setEarnings] = useState({ totalEarning: 0, totalSales: 0, totalPlatformFee: 0 });

  // AI 任务
  const [aiRequests, setAiRequests] = useState<AIRequest[]>([]);
  const [aiTotal, setAiTotal] = useState(0);

  const loadWallet = useCallback(async () => {
    const [balRes, txRes] = await Promise.all([getBalance(), getTransactions()]);
    setBalance(String(balRes.balance));
    setTransactions(txRes.list);
  }, []);

  const loadMyIdeas = useCallback(async () => {
    const res = await getMyIdeas();
    setMyIdeas(res.list);
    setMyIdeasTotal(res.total);
  }, []);

  const loadPurchases = useCallback(async () => {
    const res = await getMyPurchases();
    setPurchases(res.list);
    setPurchasesTotal(res.total);
  }, []);

  const loadSales = useCallback(async () => {
    const [salesRes, earnRes] = await Promise.all([getMySales(), getMyEarnings()]);
    setSales(salesRes.list);
    setSalesTotal(salesRes.total);
    setEarnings(earnRes);
  }, []);

  const loadAITasks = useCallback(async () => {
    const res = await getMyAIRequests();
    setAiRequests(res.list);
    setAiTotal(res.total);
  }, []);

  useEffect(() => {
    loadWallet();
    loadMyIdeas();
    loadPurchases();
    loadSales();
    loadAITasks();
  }, [loadWallet, loadMyIdeas, loadPurchases, loadSales, loadAITasks]);

  const handleRecharge = async () => {
    if (rechargeAmount <= 0) {
      message.warning('充值金额必须大于 0');
      return;
    }
    try {
      const res = await recharge(rechargeAmount);
      setBalance(String(res.balance));
      setTransactions((prev) => [res.transaction, ...prev]);
      setRechargeOpen(false);
      await refreshUser();
      message.success(`充值成功！当前余额 ¥${res.balance}`);
    } catch (err) {
      void err;
    }
  };

  const handleDeleteIdea = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这个创意吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        await deleteIdea(id);
        setMyIdeas((prev) => prev.filter((i) => i.id !== id));
        setMyIdeasTotal((prev) => prev - 1);
        message.success('已删除');
      },
    });
  };

  const handleDownload = async (requestId: string) => {
    try {
      await downloadCode(requestId);
      message.success('开始下载...');
    } catch (err) {
      void err;
    }
  };

  const transactionTypeMap: Record<TransactionType, { color: string; label: string }> = {
    RECHARGE: { color: 'green', label: '充值' },
    PURCHASE: { color: 'orange', label: '消费' },
    EARNING: { color: 'blue', label: '收益' },
    REFUND: { color: 'purple', label: '退款' },
  };

  const ideaStatusMap: Record<IdeaStatus, { color: string; label: string }> = {
    PUBLISHED: { color: 'green', label: '已上架' },
    PENDING: { color: 'orange', label: '审核中' },
    REJECTED: { color: 'red', label: '已拒绝' },
  };

  const aiStatusMap: Record<AIRequestStatus, { color: string; label: string }> = {
    COMPLETED: { color: 'green', label: '已完成' },
    FAILED: { color: 'red', label: '失败' },
    PROCESSING: { color: 'blue', label: '生成中' },
    PENDING: { color: 'orange', label: '排队中' },
  };

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <WalletOutlined /> 总览
        </span>
      ),
      children: (
        <div>
          <Row gutter={[16, 16]}>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title="钱包余额"
                  value={balance}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ color: '#1677ff' }}
                />
                <Button type="link" icon={<PlusOutlined />} onClick={() => setRechargeOpen(true)} style={{ padding: 0, marginTop: 8 }}>
                  充值
                </Button>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic title="我的创意" value={myIdeasTotal} prefix={<BulbOutlined />} />
                <Button type="link" onClick={() => navigate('/publish')} style={{ padding: 0, marginTop: 8 }}>
                  发布新创意
                </Button>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic title="累计购买" value={purchasesTotal} prefix={<ShoppingOutlined />} />
                <Button type="link" onClick={() => setActiveTab('purchases')} style={{ padding: 0, marginTop: 8 }}>
                  查看记录
                </Button>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title="累计收益"
                  value={earnings.totalEarning}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ color: '#52c41a' }}
                />
                <Button type="link" onClick={() => setActiveTab('sales')} style={{ padding: 0, marginTop: 8 }}>
                  销售明细
                </Button>
              </Card>
            </Col>
          </Row>

          <Card title="最近交易" style={{ marginTop: 24 }}>
            <Table
              dataSource={transactions.slice(0, 5)}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: '类型',
                  dataIndex: 'type',
                  render: (t: TransactionType) => (
                    <Tag color={transactionTypeMap[t].color}>{transactionTypeMap[t].label}</Tag>
                  ),
                },
                { title: '描述', dataIndex: 'description', ellipsis: true },
                {
                  title: '金额',
                  dataIndex: 'amount',
                  render: (v: string) => `¥${v}`,
                },
                {
                  title: '交易后余额',
                  dataIndex: 'balanceAfter',
                  render: (v: string) => `¥${v}`,
                },
                {
                  title: '时间',
                  dataIndex: 'createdAt',
                  render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
                },
              ]}
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'wallet',
      label: (
        <span>
          <WalletOutlined /> 我的钱包
        </span>
      ),
      children: (
        <Card
          title={
            <Space>
              <Text>当前余额：</Text>
              <Text strong style={{ color: '#1677ff', fontSize: 20 }}>
                ¥{balance}
              </Text>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setRechargeOpen(true)}>
                充值
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadWallet}>
                刷新
              </Button>
            </Space>
          }
        >
          <Table
            dataSource={transactions}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: '类型',
                dataIndex: 'type',
                render: (t: TransactionType) => (
                  <Tag color={transactionTypeMap[t].color}>{transactionTypeMap[t].label}</Tag>
                ),
              },
              { title: '描述', dataIndex: 'description', ellipsis: true },
              {
                title: '金额',
                dataIndex: 'amount',
                render: (v: string, record) => {
                  const num = parseFloat(v);
                  const isIncome = num >= 0;
                  return (
                    <Text style={{ color: isIncome ? '#52c41a' : '#ff4d4f' }}>
                      {isIncome ? '+' : ''}¥{num.toFixed(2)}
                    </Text>
                  );
                },
              },
              {
                title: '交易后余额',
                dataIndex: 'balanceAfter',
                render: (v: string) => `¥${v}`,
              },
              {
                title: '时间',
                dataIndex: 'createdAt',
                render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm:ss'),
              },
            ]}
          />
        </Card>
      ),
    },
    {
      key: 'ideas',
      label: (
        <span>
          <BulbOutlined /> 我的创意
        </span>
      ),
      children: (
        <Card
          title={
            <Space>
              <Text>我发布的创意（{myIdeasTotal}）</Text>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/publish')}>
                发布新创意
              </Button>
            </Space>
          }
        >
          {myIdeas.length === 0 ? (
            <Empty description="还没有发布任何创意">
              <Button type="primary" onClick={() => navigate('/publish')}>
                立即发布
              </Button>
            </Empty>
          ) : (
            <List
              dataSource={myIdeas}
              renderItem={(idea) => (
                <List.Item
                  actions={[
                    <Button type="link" onClick={() => navigate(`/ideas/${idea.id}`)}>
                      查看
                    </Button>,
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteIdea(idea.id)}
                    >
                      删除
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: '#1677ff' }}>
                        {idea.title.slice(0, 1)}
                      </Avatar>
                    }
                    title={
                      <Space>
                        <Text strong>{idea.title}</Text>
                        <Tag color={ideaStatusMap[idea.status]?.color || 'default'}>
                          {ideaStatusMap[idea.status]?.label || idea.status}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space split={<span style={{ color: '#d9d9d9' }}>|</span>}>
                        <Text type="secondary">¥{idea.price}</Text>
                        <Text type="secondary">{idea.purchaseCount} 次购买</Text>
                        <Text type="secondary">
                          {dayjs(idea.createdAt).format('YYYY-MM-DD')}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      ),
    },
    {
      key: 'purchases',
      label: (
        <span>
          <ShoppingOutlined /> 购买记录
        </span>
      ),
      children: (
        <Card title={`我的购买记录（${purchasesTotal}）`}>
          {purchases.length === 0 ? (
            <Empty description="还没有购买任何创意">
              <Button type="primary" onClick={() => navigate('/marketplace')}>
                去市场逛逛
              </Button>
            </Empty>
          ) : (
            <Table
              dataSource={purchases}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              columns={[
                {
                  title: '创意标题',
                  dataIndex: ['idea', 'title'],
                  render: (v: string, record: Order) => (
                    <Button type="link" onClick={() => navigate(`/ideas/${record.ideaId!}`)}>
                      {v || '已删除'}
                    </Button>
                  ),
                },
                {
                  title: '类型',
                  dataIndex: 'type',
                  render: (t: string) =>
                    t === 'IDEA_PURCHASE' ? (
                      <Tag color="blue">创意购买</Tag>
                    ) : (
                      <Tag color="purple">AI 生成</Tag>
                    ),
                },
                {
                  title: '金额',
                  dataIndex: 'totalAmount',
                  render: (v: string) => `¥${v}`,
                },
                {
                  title: '时间',
                  dataIndex: 'createdAt',
                  render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
                },
              ]}
            />
          )}
        </Card>
      ),
    },
    {
      key: 'sales',
      label: (
        <span>
          <DollarOutlined /> 销售明细
        </span>
      ),
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={12} md={8}>
              <Card>
                <Statistic
                  title="累计收益"
                  value={earnings.totalEarning}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} md={8}>
              <Card>
                <Statistic title="累计订单" value={earnings.totalSales} />
              </Card>
            </Col>
            <Col xs={12} md={8}>
              <Card>
                <Statistic
                  title="平台抽成总计"
                  value={earnings.totalPlatformFee}
                  precision={2}
                  prefix="¥"
                />
              </Card>
            </Col>
          </Row>
          <Card title={`销售记录（${salesTotal}）`}>
            {sales.length === 0 ? (
              <Empty description="还没有销售记录">
                <Button type="primary" onClick={() => navigate('/publish')}>
                  发布创意开始赚钱
                </Button>
              </Empty>
            ) : (
              <Table
                dataSource={sales}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                columns={[
                  {
                    title: '创意',
                    dataIndex: ['idea', 'title'],
                    render: (v: string) => v || '已删除',
                  },
                  {
                    title: '买家',
                    dataIndex: ['buyer', 'username'],
                    render: (v: string) => v || '匿名',
                  },
                  {
                    title: '总金额',
                    dataIndex: 'totalAmount',
                    render: (v: string) => `¥${v}`,
                  },
                  {
                    title: '平台抽成',
                    dataIndex: 'platformFee',
                    render: (v: string) => (
                      <Text type="secondary">¥{v}</Text>
                    ),
                  },
                  {
                    title: '我的收益',
                    dataIndex: 'sellerEarning',
                    render: (v: string) => (
                      <Text strong style={{ color: '#52c41a' }}>
                        ¥{v}
                      </Text>
                    ),
                  },
                  {
                    title: '时间',
                    dataIndex: 'createdAt',
                    render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
                  },
                ]}
              />
            )}
          </Card>
        </div>
      ),
    },
    {
      key: 'ai',
      label: (
        <span>
          <CodeOutlined /> AI 任务
        </span>
      ),
      children: (
        <Card title={`我的 AI 生成任务（${aiTotal}）`}>
          {aiRequests.length === 0 ? (
            <Empty description="还没有 AI 生成任务">
              <Button type="primary" onClick={() => navigate('/marketplace')}>
                浏览创意并体验 AI 生成
              </Button>
            </Empty>
          ) : (
            <List
              dataSource={aiRequests}
              renderItem={(req) => (
                <List.Item
                  actions={
                    req.status === 'COMPLETED' && req.downloadUrl
                      ? [
                          <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownload(req.id)}
                          >
                            下载代码包
                          </Button>,
                        ]
                      : undefined
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor:
                            req.status === 'COMPLETED'
                              ? '#52c41a'
                              : req.status === 'FAILED'
                              ? '#ff4d4f'
                              : '#1677ff',
                        }}
                        icon={<CodeOutlined />}
                      />
                    }
                    title={
                      <Space>
                        <Text strong>{req.idea?.title || '已删除创意'}</Text>
                        <Tag color={aiStatusMap[req.status]?.color || 'default'}>
                          {aiStatusMap[req.status]?.label || req.status}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          技术栈：{req.techStack || '未指定'}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          创建时间：{dayjs(req.createdAt).format('YYYY-MM-DD HH:mm')}
                        </Text>
                        {req.errorMessage && (
                          <Text type="danger" style={{ fontSize: 12 }}>
                            错误：{req.errorMessage}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      ),
    },
  ];

  return (
    <div className="page-container">
      <Title level={2} style={{ marginBottom: 24 }}>
        我的仪表盘
      </Title>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          setSearchParams({ tab: key });
        }}
        items={tabItems}
      />

      {/* 充值弹窗 */}
      <Modal
        title="钱包充值"
        open={rechargeOpen}
        onCancel={() => setRechargeOpen(false)}
        onOk={handleRecharge}
        okText="确认充值"
        cancelText="取消"
      >
        <Paragraph type="secondary">MVP 阶段为模拟充值，实际生产环境将对接支付宝/微信支付。</Paragraph>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>当前余额：¥{balance}</Text>
          <Text>充值金额：</Text>
          <InputNumber
            min={1}
            max={10000}
            value={rechargeAmount}
            onChange={(v) => setRechargeAmount(v || 0)}
            style={{ width: '100%' }}
            prefix="¥"
          />
          <Space>
            {[10, 50, 100, 500].map((amt) => (
              <Button key={amt} size="small" onClick={() => setRechargeAmount(amt)}>
                ¥{amt}
              </Button>
            ))}
          </Space>
        </Space>
      </Modal>
    </div>
  );
}
