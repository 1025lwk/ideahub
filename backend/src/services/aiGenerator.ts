// AI 代码生成器
// 本地开发使用 Mock 模式（基于模板生成），生产环境可接入 OpenAI / 智谱GLM
// 参考 GPT-Engineer 的实现思路

import { buildSystemPrompt, parseGeneratedFiles } from '../prompts/builder.js';

export interface GenerateInput {
  ideaTitle: string;
  ideaDescription: string;
  ideaFullContent: string;
  extraRequirements?: string;
  techStack?: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
}

// Mock 生成器 - 根据创意内容生成基础项目结构
function mockGenerate(input: GenerateInput): GeneratedFile[] {
  const { ideaTitle, ideaDescription, extraRequirements, techStack } = input;
  const projectName = ideaTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'my-project';
  const isReact = !techStack || techStack.toLowerCase().includes('react');

  if (isReact) {
    return [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: projectName,
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview',
          },
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0',
          },
          devDependencies: {
            '@types/react': '^18.2.43',
            '@types/react-dom': '^18.2.17',
            '@vitejs/plugin-react': '^4.2.1',
            typescript: '^5.2.2',
            vite: '^5.0.8',
          },
        }, null, 2),
      },
      {
        path: 'README.md',
        content: `# ${ideaTitle}\n\n${ideaDescription}\n\n## 功能特性\n\n${extraRequirements || '基于创意描述实现的核心功能'}\n\n## 快速开始\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\n## 技术栈\n\n- React 18\n- TypeScript\n- Vite\n\n## 项目结构\n\n\`\`\`\nsrc/\n  App.tsx       # 主应用组件\n  main.tsx      # 入口文件\n  index.css     # 全局样式\n\`\`\`\n\n---\n由 IdeaHub AI 生成`,
      },
      {
        path: 'index.html',
        content: `<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>${ideaTitle}</title>\n</head>\n<body>\n  <div id="root"></div>\n  <script type="module" src="/src/main.tsx"></script>\n</body>\n</html>`,
      },
      {
        path: 'vite.config.ts',
        content: `import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n  server: { port: 3000 }\n})`,
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'ES2020',
            useDefineForClassFields: true,
            lib: ['ES2020', 'DOM', 'DOM.Iterable'],
            module: 'ESNext',
            skipLibCheck: true,
            moduleResolution: 'bundler',
            jsx: 'react-jsx',
            strict: true,
          },
          include: ['src'],
        }, null, 2),
      },
      {
        path: 'src/main.tsx',
        content: `import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App'\nimport './index.css'\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n)`,
      },
      {
        path: 'src/App.tsx',
        content: `import { useState } from 'react'\n\n/**\n * ${ideaTitle}\n * ${ideaDescription}\n */\nfunction App() {\n  const [count, setCount] = useState(0)\n\n  return (\n    <div style={{\n      minHeight: '100vh',\n      display: 'flex',\n      flexDirection: 'column',\n      alignItems: 'center',\n      justifyContent: 'center',\n      fontFamily: 'system-ui, sans-serif',\n      background: '#f5f5f5',\n    }}>\n      <h1>${ideaTitle}</h1>\n      <p style={{ color: '#666', maxWidth: '500px', textAlign: 'center' }}>\n        ${ideaDescription}\n      </p>\n      ${extraRequirements ? `<p style={{ color: '#999', fontSize: '14px' }}>需求: ${extraRequirements}</p>` : ''}\n      <button\n        onClick={() => setCount(c => c + 1)}\n        style={{\n          marginTop: '20px',\n          padding: '10px 30px',\n          fontSize: '16px',\n          border: 'none',\n          borderRadius: '8px',\n          background: '#4f46e5',\n          color: 'white',\n          cursor: 'pointer',\n        }}\n      >\n        点击次数: {count}\n      </button>\n      <footer style={{ marginTop: '40px', color: '#ccc', fontSize: '12px' }}>\n        Powered by IdeaHub AI\n      </footer>\n    </div>\n  )\n}\n\nexport default App`,
      },
      {
        path: 'src/index.css',
        content: `* { margin: 0; padding: 0; box-sizing: border-box; }\nbody { font-family: system-ui, -apple-system, sans-serif; }`,
      },
    ];
  }

  // Python 项目模板
  return [
    {
      path: 'README.md',
      content: `# ${ideaTitle}\n\n${ideaDescription}\n\n## 快速开始\n\n\`\`\`bash\npip install -r requirements.txt\npython main.py\n\`\`\`\n\n---\n由 IdeaHub AI 生成`,
    },
    {
      path: 'requirements.txt',
      content: 'flask==3.0.0\npython-dotenv==1.0.0',
    },
    {
      path: 'main.py',
      content: `"""${ideaTitle}\n${ideaDescription}\n"""\nfrom flask import Flask, jsonify, request\n\napp = Flask(__name__)\n\n@app.route('/')\ndef index():\n    return jsonify({\n        'name': '${ideaTitle}',\n        'description': '${ideaDescription}',\n        'status': 'running'\n    })\n\n@app.route('/api/process', methods=['POST'])\ndef process():\n    data = request.json or {}\n    # TODO: 实现核心业务逻辑\n    return jsonify({'result': 'success', 'input': data})\n\nif __name__ == '__main__':\n    app.run(debug=True, port=5000)`,
    },
  ];
}

// 真实LLM调用（预留接口，生产环境启用）
async function llmGenerate(input: GenerateInput): Promise<GeneratedFile[]> {
  const systemPrompt = buildSystemPrompt(input);

  const provider = process.env.AI_PROVIDER || 'mock';

  if (provider === 'openai') {
    // 生产环境：调用 OpenAI API
    // const response = await fetch('https://api.openai.com/v1/chat/completions', { ... });
    // const content = response.choices[0].message.content;
    // return parseGeneratedFiles(content);
    throw new Error('OpenAI provider not configured. Set AI_PROVIDER=mock for local dev.');
  }

  if (provider === 'zhipu') {
    // 生产环境：调用智谱GLM API
    throw new Error('Zhipu provider not configured. Set AI_PROVIDER=mock for local dev.');
  }

  // 默认 Mock 模式
  return mockGenerate(input);
}

export const aiGenerator = {
  async generate(input: GenerateInput): Promise<{ files: GeneratedFile[]; prompt: string }> {
    const prompt = buildSystemPrompt(input);
    const files = await llmGenerate(input);
    return { files, prompt };
  },
};
