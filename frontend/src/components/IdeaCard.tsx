import { Card, Tag, Typography, Space, Avatar, Button } from 'antd';
import { UserOutlined, EyeOutlined, ShoppingOutlined, CrownOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { Idea } from '../types';

const { Text, Paragraph } = Typography;

interface Props {
  idea: Idea;
}

// 创意卡片：用于市场页和首页展示
export default function IdeaCard({ idea }: Props) {
  const price = parseFloat(idea.price);
  const isFree = price === 0;

  return (
    <Card
      className="idea-card-hover"
      hoverable
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%', padding: 16 } }}
      cover={
        <div
          style={{
            height: 120,
            background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 36,
            fontWeight: 700,
          }}
        >
          {idea.title.slice(0, 2)}
        </div>
      }
    >
      <Link to={`/ideas/${idea.id}`}>
        <Paragraph
          ellipsis={{ rows: 2 }}
          style={{ marginBottom: 8, fontWeight: 600, fontSize: 16 }}
        >
          {idea.title}
        </Paragraph>
      </Link>
      <Paragraph
        ellipsis={{ rows: 3 }}
        type="secondary"
        style={{ marginBottom: 12, fontSize: 13, flex: 1 }}
      >
        {idea.description}
      </Paragraph>

      <div style={{ marginBottom: 8 }}>
        {idea.tags?.slice(0, 3).map((tag) => (
          <Tag key={tag} color="blue" style={{ marginBottom: 4 }}>
            {tag}
          </Tag>
        ))}
      </div>

      <Space
        size="small"
        style={{ marginBottom: 12, color: 'rgba(0,0,0,0.45)', fontSize: 12 }}
      >
        <EyeOutlined />
        <span>{idea.purchaseCount} 人购买</span>
        {idea.category && (
          <>
            <span>·</span>
            <span>{idea.category.name}</span>
          </>
        )}
      </Space>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 12,
          borderTop: '1px solid #f0f0f0',
        }}
      >
        <Space size="small">
          <Avatar size="small" icon={<UserOutlined />} src={idea.seller?.avatar || undefined} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {idea.seller?.username || '匿名卖家'}
          </Text>
        </Space>
        {isFree ? (
          <Tag color="green" icon={<CrownOutlined />}>
            免费
          </Tag>
        ) : (
          <Text strong style={{ color: '#fa541c', fontSize: 16 }}>
            ¥{idea.price}
          </Text>
        )}
      </div>
    </Card>
  );
}
