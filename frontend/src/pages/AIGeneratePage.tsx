import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Button,
  Form,
  Input,
  Select,
  Space,
  Spin,
  Result,
  Tag,
  Steps,
  Divider,
  Alert,
  message,
} from 'antd';
import {
  CodeOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { getIdea } from '../api/ideas';
import { generateCode, getAIStatus, downloadCode } from '../api/ai';
import type { Idea, AIRequestStatus } from '../types';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const statusStepMap: Record<AIRequestStatus, number> = {
  PENDING: 0,
  PROCESSING: 1,
  COMPLETED: 2,
  FAILED: 2,
};

interface AIRequestInfo {
  id: string;
  status: AIRequestStatus;
  downloadUrl: string | null;
  errorMessage: string | null;
  techStack?: string;
  extraRequirements?: string;
  createdAt: string;
}

export default function AIGeneratePage() {
  const { ideaId } = useParams<{ ideaId: string }>();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aiRequest, setAiRequest] = useState<AIRequestInfo | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!ideaId) return;
    getIdea(ideaId)
      .then(setIdea)
      .finally(() => setLoading(false));
  }, [ideaId]);

  // 轮询任务状态
  useEffect(() => {
    if (!aiRequest || aiRequest.status === 'COMPLETED' || aiRequest.status === 'FAILED') {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }
    pollingRef.current = setInterval(async () => {
      try {
        const latest = await getAIStatus(aiRequest.id);
        setAiRequest({
          id: latest.id,
          status: latest.status,
          downloadUrl: latest.downloadUrl,
          errorMessage: latest.errorMessage,
          techStack: latest.techStack,
          extraRequirements: latest.extraRequirements,
          createdAt: latest.createdAt,
        });
        if (latest.status === 'COMPLETED') {
          message.success('代码生成完成！可以下载了');
        } else if (latest.status === 'FAILED') {
          message.error('代码生成失败：' + (latest.errorMessage || '未知错误'));
        }
      } catch (err) {
        void err;
      }
    }, 2000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [aiRequest?.id, aiRequest?.status]);

  const handleGenerate = async (values: {
    extraRequirements: string;
    techStack: string;
  }) => {
    setSubmitting(true);
    try {
      const res = await generateCode({
        ideaId: ideaId!,
        extraRequirements: values.extraRequirements || '',
        techStack: values.techStack,
      });
      setAiRequest({
        id: res.requestId,
        status: 'PENDING',
        downloadUrl: null,
        errorMessage: null,
        techStack: values.techStack,
        extraRequirements: values.extraRequirements || '',
        createdAt: new Date().toISOString(),
      });
      message.success('任务已提交，正在生成中...');
    } catch (err) {
      void err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async () => {
    if (aiRequest) {
      try {
        await downloadCode(aiRequest.id);
        message.success('开始下载...');
      } catch (err) {
        void err;
      }
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
        <Result status="404" title="创意不存在" extra={<Button onClick={() => navigate('/marketplace')}>返回市场</Button>} />
      </div>
    );
  }

  const hasAccess = !!idea.fullContent;

  if (!hasAccess) {
    return (
      <div className="page-container">
        <Result
          status="warning"
          title="需要先购买此创意"
          subTitle="AI 代码生成仅对已购买该创意的用户开放"
          extra={
            <Button type="primary" onClick={() => navigate(`/ideas/${idea.id}`)}>
              去购买创意
            </Button>
          }
        />
      </div>
    );
  }

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

      <Title level={2}>
        <CodeOutlined style={{ color: '#722ed1', marginRight: 8 }} />
        AI 一键生成代码
      </Title>
      <Paragraph type="secondary">
        基于创意「{idea.title}」的完整内容，结合你的额外需求与技术偏好，
        AI 将异步生成多文件代码项目并打包为 ZIP 下载。
      </Paragraph>

      <Divider />

      {!aiRequest ? (
        <Card title="填写生成需求">
          <Alert
            type="info"
            showIcon
            message="AI 生成服务说明"
            description="平台对 AI 生成服务抽成 20%，费用将从您的钱包余额扣除。生成过程为异步执行，提交后可在此页面查看进度。"
            style={{ marginBottom: 24 }}
          />

          <Form
            layout="vertical"
            onFinish={handleGenerate}
            initialValues={{
              techStack: 'react',
              extraRequirements: '',
            }}
          >
            <Form.Item
              name="techStack"
              label="技术栈偏好"
              rules={[{ required: true, message: '请选择技术栈' }]}
            >
              <Select
                options={[
                  { label: 'React + TypeScript + Vite（前端项目）', value: 'react' },
                  { label: 'Vue 3 + Vite + TypeScript（前端项目）', value: 'vue' },
                  { label: 'Node.js + Express + TypeScript（后端项目）', value: 'node' },
                  { label: 'Python + FastAPI（后端项目）', value: 'python' },
                  { label: 'Next.js 全栈项目', value: 'nextjs' },
                  { label: 'Taro 多端小程序', value: 'taro' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="extraRequirements"
              label="额外需求（可选）"
              extra="补充你对项目的具体要求，例如：增加用户登录、对接某个API、特定UI风格等"
            >
              <TextArea
                rows={6}
                placeholder={"例如：\n1. 增加用户注册登录功能\n2. 使用 TailwindCSS 美化界面\n3. 增加数据导出为 Excel 的功能\n4. 部署到 Vercel"}
                maxLength={2000}
                showCount
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<RocketOutlined />}
                  loading={submitting}
                >
                  开始生成代码
                </Button>
                <Button size="large" onClick={() => navigate(-1)}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      ) : (
        <Card title="生成进度">
          <Steps
            current={statusStepMap[aiRequest.status]}
            status={aiRequest.status === 'FAILED' ? 'error' : aiRequest.status === 'COMPLETED' ? 'finish' : 'process'}
            items={[
              {
                title: '任务已提交',
                description: '已创建生成任务并入队',
                icon: <CheckCircleOutlined />,
              },
              {
                title: 'AI 生成中',
                description: '调用 LLM 构造 Prompt 并生成代码',
                icon:
                  aiRequest.status === 'PROCESSING' ? (
                    <LoadingOutlined />
                  ) : aiRequest.status === 'COMPLETED' ? (
                    <CheckCircleOutlined />
                  ) : aiRequest.status === 'FAILED' ? (
                    <CloseCircleOutlined />
                  ) : (
                    <CodeOutlined />
                  ),
              },
              {
                title: aiRequest.status === 'FAILED' ? '生成失败' : '生成完成',
                description:
                  aiRequest.status === 'COMPLETED'
                    ? '代码已打包为 ZIP，可下载使用'
                    : aiRequest.status === 'FAILED'
                    ? aiRequest.errorMessage || '生成失败'
                    : '等待生成完成',
                icon:
                  aiRequest.status === 'COMPLETED' ? (
                    <CheckCircleOutlined />
                  ) : aiRequest.status === 'FAILED' ? (
                    <CloseCircleOutlined />
                  ) : (
                    <DownloadOutlined />
                  ),
              },
            ]}
          />

          <Divider />

          <div>
            <Title level={5}>任务详情</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">任务ID：</Text>
                <Text code>{aiRequest.id}</Text>
              </div>
              <div>
                <Text type="secondary">状态：</Text>
                <Tag
                  color={
                    aiRequest.status === 'COMPLETED'
                      ? 'green'
                      : aiRequest.status === 'FAILED'
                      ? 'red'
                      : aiRequest.status === 'PROCESSING'
                      ? 'blue'
                      : 'orange'
                  }
                >
                  {aiRequest.status === 'COMPLETED'
                    ? '已完成'
                    : aiRequest.status === 'FAILED'
                    ? '失败'
                    : aiRequest.status === 'PROCESSING'
                    ? '生成中...'
                    : '排队中...'}
                </Tag>
              </div>
              <div>
                <Text type="secondary">技术栈：</Text>
                <Text>{aiRequest.techStack}</Text>
              </div>
              {aiRequest.extraRequirements && (
                <div>
                  <Text type="secondary">额外需求：</Text>
                  <Paragraph style={{ marginTop: 4, marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                    {aiRequest.extraRequirements}
                  </Paragraph>
                </div>
              )}
              <div>
                <Text type="secondary">创建时间：</Text>
                <Text>{new Date(aiRequest.createdAt).toLocaleString()}</Text>
              </div>
            </Space>
          </div>

          {aiRequest.status === 'COMPLETED' && aiRequest.downloadUrl && (
            <>
              <Divider />
              <Result
                status="success"
                title="代码生成完成！"
                subTitle="AI 已根据创意内容生成多文件代码项目，点击下方按钮下载 ZIP 包"
                extra={[
                  <Button
                    type="primary"
                    size="large"
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                    key="download"
                  >
                    下载代码包 (ZIP)
                  </Button>,
                  <Button
                    size="large"
                    onClick={() => navigate('/dashboard?tab=ai')}
                    key="tasks"
                  >
                    查看所有任务
                  </Button>,
                ]}
              />
            </>
          )}

          {aiRequest.status === 'FAILED' && (
            <>
              <Divider />
              <Result
                status="error"
                title="代码生成失败"
                subTitle={aiRequest.errorMessage || '生成过程中出现错误，请重试'}
                extra={[
                  <Button
                    type="primary"
                    key="retry"
                    onClick={() => setAiRequest(null)}
                  >
                    重新提交
                  </Button>,
                ]}
              />
            </>
          )}

          {(aiRequest.status === 'PENDING' || aiRequest.status === 'PROCESSING') && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Spin size="large" tip="正在生成代码，请耐心等待..." />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
