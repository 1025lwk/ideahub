import fs from 'fs';
import path from 'path';

// 文件存储工具 - 本地存储模式
// 生产环境可替换为 MinIO/S3 实现

const STORAGE_DIR = process.env.STORAGE_DIR || 'storage';

export const storageService = {
  // 确保存储目录存在
  ensureDir() {
    const dir = path.resolve(process.cwd(), STORAGE_DIR);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  },

  // 保存文件并返回下载路径
  saveFile(filename: string, buffer: Buffer): string {
    const dir = this.ensureDir();
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, buffer);
    return `/storage/${filename}`;
  },

  // 获取文件绝对路径
  getFilePath(downloadUrl: string): string {
    const filename = downloadUrl.replace('/storage/', '');
    return path.resolve(process.cwd(), STORAGE_DIR, filename);
  },

  // 文件是否存在
  exists(downloadUrl: string): boolean {
    try {
      return fs.existsSync(this.getFilePath(downloadUrl));
    } catch {
      return false;
    }
  },
};
