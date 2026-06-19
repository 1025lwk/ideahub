// 内存任务队列 - 模拟 BullMQ 接口
// 本地开发无需Redis，生产环境可替换为真正的BullMQ实现

type JobHandler<T> = (data: T) => Promise<void>;

interface Job<T> {
  id: string;
  data: T;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  result?: any;
  error?: string;
  createdAt: Date;
  processedAt?: Date;
}

class InMemoryQueue<T = any> {
  private jobs: Map<string, Job<T>> = new Map();
  private handler?: JobHandler<T>;
  private processing = false;
  private jobCounter = 0;

  constructor(private name: string) {}

  // 注册处理函数
  process(handler: JobHandler<T>) {
    this.handler = handler;
    this.startProcessing();
  }

  // 添加任务到队列
  async add(data: T): Promise<{ id: string }> {
    const id = `${this.name}-${++this.jobCounter}-${Date.now()}`;
    const job: Job<T> = {
      id,
      data,
      status: 'waiting',
      createdAt: new Date(),
    };
    this.jobs.set(id, job);
    console.log(`[${this.name}] 任务已加入队列: ${id}`);
    return { id };
  }

  // 获取任务状态
  getJob(id: string): Job<T> | undefined {
    return this.jobs.get(id);
  }

  // 开始处理队列
  private async startProcessing() {
    if (this.processing) return;
    this.processing = true;

    // 异步轮询处理
    const poll = async () => {
      const waitingJob = Array.from(this.jobs.values()).find(j => j.status === 'waiting');
      if (waitingJob && this.handler) {
        waitingJob.status = 'active';
        try {
          await this.handler(waitingJob.data);
          waitingJob.status = 'completed';
          waitingJob.processedAt = new Date();
          console.log(`[${this.name}] 任务完成: ${waitingJob.id}`);
        } catch (err: any) {
          waitingJob.status = 'failed';
          waitingJob.error = err.message;
          waitingJob.processedAt = new Date();
          console.error(`[${this.name}] 任务失败: ${waitingJob.id}`, err.message);
        }
      }
      // 继续轮询
      setTimeout(poll, 500);
    };
    poll();
  }
}

// 导出AI生成队列单例
export const aiQueue = new InMemoryQueue('ai-generation');

export default InMemoryQueue;
