// AI生成 Worker - 消费队列任务，调用AI生成代码并打包ZIP
// 生产环境可独立运行：npm run worker

import archiver from 'archiver';
import prisma from '../utils/prisma.js';
import { aiQueue } from '../utils/queue.js';
import { aiGenerator } from '../services/aiGenerator.js';
import { storageService } from '../utils/storage.js';
import { AIRequestStatus } from '../utils/constants.js';
import { createWriteStream } from 'fs';
import path from 'path';

// 处理单个AI生成任务
async function processAIJob(data: {
  requestId: string;
  ideaTitle: string;
  ideaDescription: string;
  ideaFullContent: string;
  extraRequirements?: string;
  techStack?: string;
}) {
  const { requestId, ideaTitle, ideaDescription, ideaFullContent, extraRequirements, techStack } = data;

  console.log(`[Worker] 开始处理AI生成任务: ${requestId}`);

  // 更新状态为处理中
  await prisma.aIRequest.update({
    where: { id: requestId },
    data: { status: AIRequestStatus.PROCESSING },
  });

  try {
    // 调用AI生成代码
    const { files, prompt } = await aiGenerator.generate({
      ideaTitle,
      ideaDescription,
      ideaFullContent,
      extraRequirements,
      techStack,
    });

    // 保存组合后的Prompt
    await prisma.aIRequest.update({
      where: { id: requestId },
      data: { combinedPrompt: prompt },
    });

    // 打包为ZIP
    const zipBuffer = await createZip(files, ideaTitle);

    // 保存ZIP文件
    const filename = `ai-${requestId}-${Date.now()}.zip`;
    const downloadUrl = storageService.saveFile(filename, zipBuffer);

    // 更新任务状态为完成
    await prisma.aIRequest.update({
      where: { id: requestId },
      data: {
        status: AIRequestStatus.COMPLETED,
        downloadUrl,
      },
    });

    console.log(`[Worker] AI生成任务完成: ${requestId}, 文件数: ${files.length}`);
  } catch (err: any) {
    console.error(`[Worker] AI生成任务失败: ${requestId}`, err.message);
    await prisma.aIRequest.update({
      where: { id: requestId },
      data: {
        status: AIRequestStatus.FAILED,
        errorMessage: err.message,
      },
    });
  }
}

// 将文件列表打包为ZIP
function createZip(files: { path: string; content: string }[], projectName: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    archive.on('data', (chunk: Buffer) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);

    // 添加所有文件
    for (const file of files) {
      archive.append(file.content, { name: file.path });
    }

    archive.finalize();
  });
}

// 注册队列处理器
aiQueue.process(processAIJob);

console.log('[Worker] AI生成Worker已启动，等待任务...');

export { processAIJob };
