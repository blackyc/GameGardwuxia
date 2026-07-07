# ghostMUD

ghostMUD 是一个基于 Vite 和原生 JavaScript 的文字 MUD。项目运行入口是 `index.html`，游戏主逻辑在 `src/`，运行时数据在 `public/data/`。

## 环境要求

- Node.js 18 或以上，推荐 Node.js 20 LTS
- npm 9 或以上
- 现代浏览器：Chrome、Edge、Firefox 均可

## 安装依赖

```bash
npm install
```

## 启动游戏

```bash
npm run dev
```

默认访问地址为 `http://localhost:5173`。如果端口被占用，以终端实际输出为准。

## 常用命令

```bash
npm test
npm run build
npm run preview
```

- `npm test`：运行 `temp/*.test.cjs` 中的项目健康检查。
- `npm run build`：生成生产构建到 `dist/`。
- `npm run preview`：本地预览生产构建。

## 目录说明

- `src/`：游戏主要源码，会参与打包。
- `public/data/`：运行时全局数据，由 `index.html` 通过经典脚本加载。
- `public/ui/`：运行时 UI 图片资源。
- `docs/`：仅保留两份人工维护设计文档：剧情文案、游戏主要设计。
- `aidoc/`：历史 AI 产物、旧设计稿和审计记录归档，仅作参考。
- `temp/`：临时脚本、一次性任务、测试、调试输出和历史迁移材料。

## 开发约束

调试脚本、一次性转换脚本、临时测试和任务规划不要放入 `src/`。新增可运行工具优先放入 `temp/`，稳定后再决定是否整理为项目配置或正式源码。
