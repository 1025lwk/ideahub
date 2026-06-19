// AI Prompt 构造器
// 参考 GPT-Engineer / MetaGPT 的思路，将创意描述+用户需求+技术偏好组合为系统级Prompt

export interface PromptInput {
  ideaTitle: string;
  ideaDescription: string;
  ideaFullContent: string;
  extraRequirements?: string;
  techStack?: string;
}

export function buildSystemPrompt(input: PromptInput): string {
  const { ideaTitle, ideaDescription, ideaFullContent, extraRequirements, techStack } = input;

  const techPreference = techStack
    ? `技术栈偏好：${techStack}`
    : '技术栈：请选择最合适的技术栈（推荐 React + TypeScript + TailwindCSS）';

  return `你是一个全栈开发专家AI。请根据以下创意描述，生成一个完整可运行的项目代码。

## 创意标题
${ideaTitle}

## 创意描述
${ideaDescription}

## 创意完整内容
${ideaFullContent}

## 用户额外需求
${extraRequirements || '无特殊需求，请按创意描述实现核心功能'}

## 技术要求
${techPreference}

## 输出格式要求
请严格按照以下格式输出多个文件，每个文件用特殊标记分隔：

\`\`\`file:路径/文件名
文件内容
\`\`\`

例如：
\`\`\`file:package.json
{"name": "my-project", ...}
\`\`\`

\`\`\`file:src/index.ts
console.log("Hello World");
\`\`\`

## 注意事项
1. 必须包含 README.md 说明文件
2. 必须包含项目依赖配置文件（package.json / requirements.txt 等）
3. 代码必须完整可运行，不能有占位符
4. 包含必要的错误处理
5. 代码要有详细注释
6. 项目结构清晰规范

请开始生成项目代码：`;
}

// 从AI输出中解析多文件结构
export function parseGeneratedFiles(content: string): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = [];
  const regex = /```file:(.+?)\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    files.push({
      path: match[1].trim(),
      content: match[2].trim(),
    });
  }

  // 兼容另一种格式：```path:xxx
  if (files.length === 0) {
    const regex2 = /```(?:path|file)?:?(.+?)\n([\s\S]*?)```/g;
    while ((match = regex2.exec(content)) !== null) {
      const path = match[1].trim();
      // 跳过语言标识符（如 javascript, python）
      if (!path.includes('.') && !path.includes('/')) continue;
      files.push({ path, content: match[2].trim() });
    }
  }

  return files;
}
