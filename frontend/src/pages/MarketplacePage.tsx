import { useEffect, useState, useCallback } from 'react';
import {
  Row,
  Col,
  Input,
  Select,
  Card,
  Spin,
  Empty,
  Pagination,
  Typography,
  Space,
  Tag,
  Divider,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import IdeaCard from '../components/IdeaCard';
import { listIdeas, getCategories } from '../api/ideas';
import type { Idea, Category, IdeaListQuery } from '../types';

const { Title, Text } = Typography;

export default function MarketplacePage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState<IdeaListQuery>({
    keyword: '',
    categoryId: undefined,
    sort: 'latest',
    page: 1,
    pageSize: 12,
  });

  // 加载分类
  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  // 加载创意列表
  const loadIdeas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listIdeas(query);
      setIdeas(res.list);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadIdeas();
  }, [loadIdeas]);

  // 扁平化分类（含父子）
  const flatCategories: { label: string; value: string }[] = [];
  categories.forEach((cat) => {
    flatCategories.push({ label: cat.name, value: cat.id });
    cat.children?.forEach((sub) => {
      flatCategories.push({ label: `—— ${sub.name}`, value: sub.id });
    });
  });

  return (
    <div className="page-container">
      <Title level={2} style={{ marginBottom: 8 }}>
        创意市场
      </Title>
      <Text type="secondary">发现优质创意点子，购买后解锁完整方案与AI生成入口</Text>

      {/* 筛选区 */}
      <Card style={{ marginTop: 24, marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Input
              placeholder="搜索创意标题、描述、标签..."
              prefix={<SearchOutlined />}
              allowClear
              value={query.keyword}
              onChange={(e) => setQuery((q) => ({ ...q, keyword: e.target.value, page: 1 }))}
              onPressEnter={() => setQuery((q) => ({ ...q, page: 1 }))}
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              placeholder="选择分类"
              allowClear
              style={{ width: '100%' }}
              value={query.categoryId}
              onChange={(v) => setQuery((q) => ({ ...q, categoryId: v || undefined, page: 1 }))}
              options={flatCategories}
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              style={{ width: '100%' }}
              value={query.sort}
              onChange={(v) => setQuery((q) => ({ ...q, sort: v, page: 1 }))}
              options={[
                { label: '最新发布', value: 'latest' },
                { label: '最受欢迎', value: 'popular' },
                { label: '价格从低到高', value: 'price_asc' },
                { label: '价格从高到低', value: 'price_desc' },
              ]}
            />
          </Col>
          <Col xs={24} md={6}>
            <Space>
              <Text type="secondary">价格区间：</Text>
              <Input
                placeholder="最低"
                type="number"
                style={{ width: 70 }}
                value={query.minPrice ?? ''}
                onChange={(e) =>
                  setQuery((q) => ({
                    ...q,
                    minPrice: e.target.value ? Number(e.target.value) : undefined,
                    page: 1,
                  }))
                }
              />
              <Text type="secondary">—</Text>
              <Input
                placeholder="最高"
                type="number"
                style={{ width: 70 }}
                value={query.maxPrice ?? ''}
                onChange={(e) =>
                  setQuery((q) => ({
                    ...q,
                    maxPrice: e.target.value ? Number(e.target.value) : undefined,
                    page: 1,
                  }))
                }
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 结果统计 */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Text type="secondary">共找到</Text>
          <Tag color="blue">{total}</Tag>
          <Text type="secondary">个创意</Text>
        </Space>
      </div>

      {/* 创意列表 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" tip="加载中..." />
        </div>
      ) : ideas.length === 0 ? (
        <Empty
          description="暂无符合条件的创意"
          style={{ padding: 80 }}
        />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {ideas.map((idea) => (
              <Col xs={24} sm={12} md={8} lg={6} key={idea.id}>
                <IdeaCard idea={idea} />
              </Col>
            ))}
          </Row>
          <Divider />
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Pagination
              current={query.page}
              pageSize={query.pageSize}
              total={total}
              onChange={(page, pageSize) => setQuery((q) => ({ ...q, page, pageSize }))}
              showSizeChanger
              showQuickJumper
              showTotal={(t) => `共 ${t} 条`}
            />
          </div>
        </>
      )}
    </div>
  );
}
