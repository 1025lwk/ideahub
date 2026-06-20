import { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Typography,
  Space,
  Divider,
  Tag,
  message,
  Row,
  Col,
} from 'antd';
import { PlusOutlined, BulbOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { createIdea, getCategories } from '../api/ideas';
import type { Category } from '../types';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

export default function PublishIdeaPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  // 扁平化分类
  const flatCategories: { label: string; value: string }[] = [];
  categories.forEach((cat) => {
    flatCategories.push({ label: cat.name, value: cat.id });
    cat.children?.forEach((sub) => {
      flatCategories.push({ label: `—— ${sub.name}`, value: sub.id });
    });
  });

  const handleAddTag = () => {
    const v = tagInput.trim();
    if (v && !tags.includes(v) && tags.length < 5) {
      setTags([...tags, v]);
      setTagInput('');
    }
  };

  const handleSubmit = async (values: {
    title: string;
    description: string;
    previewContent: string;
    fullContent: string;
    price: number;
    categoryId?: string;
  }) => {
    setSubmitting(true);
    try {
      const idea = await createIdea({
        title: values.title,
        description: values.description,
        previewContent: values.previewContent,
        fullContent: values.fullContent,
        price: values.price,
        categoryId: values.categoryId,
        tags,
      });
      message.success('创意发布成功！等待平台审核');
      navigate(`/ideas/${idea.id}`);
    } catch (err) {
      void err;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <Title level={2}>
        <BulbOutlined style={{ color: '#1677ff', marginRight: 8 }} />
        发布创意点子
      </Title>
      <Paragraph type="secondary">
        分享你的创意，设置价格，买家购买后你将获得 90% 收益分成。
        请认真填写预览内容（吸引买家）和完整内容（购买后解锁）。
      </Paragraph>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ price: 9.9 }}
            >
              <Form.Item
                name="title"
                label="创意标题"
                rules={[
                  { required: true, message: '请输入标题' },
                  { min: 5, max: 80, message: '标题长度 5-80 字符' },
                ]}
              >
                <Input placeholder="例如：AI 简历优化助手 - 帮求职者一键优化简历" />
              </Form.Item>

              <Form.Item
                name="description"
                label="一句话描述"
                rules={[
                  { required: true, message: '请输入描述' },
                  { max: 200, message: '描述不超过 200 字' },
                ]}
              >
                <TextArea
                  rows={2}
                  placeholder="简短描述你的创意解决什么问题、面向什么用户"
                  showCount
                  maxLength={200}
                />
              </Form.Item>

              <Form.Item label="分类" name="categoryId">
                <Select
                  placeholder="选择创意所属分类"
                  allowClear
                  options={flatCategories}
                />
              </Form.Item>

              <Form.Item label="标签（最多5个）">
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    placeholder="输入标签后回车添加"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onPressEnter={handleAddTag}
                  />
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTag}>
                    添加
                  </Button>
                </Space.Compact>
                {tags.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {tags.map((tag) => (
                      <Tag
                        key={tag}
                        closable
                        onClose={() => setTags(tags.filter((t) => t !== tag))}
                        color="blue"
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                )}
              </Form.Item>

              <Form.Item
                name="previewContent"
                label="预览内容（公开可见）"
                rules={[{ required: true, message: '请输入预览内容' }]}
                extra="买家在购买前可以看到的内容，用于吸引买家"
              >
                <TextArea
                  rows={6}
                  placeholder="介绍创意的核心功能、目标用户、使用场景、技术亮点等，让买家产生购买欲望"
                  showCount
                  maxLength={2000}
                />
              </Form.Item>

              <Form.Item
                name="fullContent"
                label="完整内容（购买后解锁）"
                rules={[{ required: true, message: '请输入完整内容' }]}
                extra="买家支付后才能查看的完整方案，包括技术实现细节、架构设计、关键代码片段等"
              >
                <TextArea
                  rows={12}
                  placeholder="详细的技术方案、架构图说明、数据库设计、API 设计、关键算法、部署方案等"
                  showCount
                  maxLength={10000}
                />
              </Form.Item>

              <Form.Item
                name="price"
                label="价格（元）"
                rules={[
                  { required: true, message: '请输入价格' },
                  { type: 'number', min: 0, max: 9999, message: '价格 0-9999 元' },
                ]}
                extra="设为 0 表示免费创意"
              >
                <InputNumber min={0} max={9999} step={0.1} precision={2} style={{ width: 200 }} />
              </Form.Item>

              <Divider />
              <Space>
                <Button type="primary" htmlType="submit" loading={submitting} size="large">
                  发布创意
                </Button>
                <Button size="large" onClick={() => navigate(-1)}>
                  取消
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="发布提示" style={{ position: 'sticky', top: 80 }}>
            <Paragraph>
              <Text strong>预览内容</Text>是吸引买家的关键，建议包含：
            </Paragraph>
            <ul style={{ paddingLeft: 20, color: 'rgba(0,0,0,0.65)' }}>
              <li>核心功能与价值</li>
              <li>目标用户与场景</li>
              <li>技术亮点</li>
              <li>预期效果</li>
            </ul>
            <Divider />
            <Paragraph>
              <Text strong>完整内容</Text>需提供可落地的方案：
            </Paragraph>
            <ul style={{ paddingLeft: 20, color: 'rgba(0,0,0,0.65)' }}>
              <li>系统架构图</li>
              <li>数据库设计</li>
              <li>API 接口定义</li>
              <li>关键算法/代码</li>
              <li>部署与运维方案</li>
            </ul>
            <Divider />
            <Paragraph type="secondary" style={{ fontSize: 12 }}>
              · 平台抽成 10%，卖家实得 90%
              <br />· 创意发布后状态为 pending，管理员审核通过后才会展示在市场
              <br />· 严禁发布违法、抄袭或低质量内容
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
