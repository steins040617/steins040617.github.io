# 刘瀚远的个人主页

基于 [Ryan Fitzgerald / DevPortfolio](https://github.com/RyanFitzgerald/devportfolio) 定制，使用 Astro 与 Tailwind CSS。

主页地址：https://steins040617.github.io/

## 本地运行

```sh
npm ci
npm run dev
```

## 构建与预览

```sh
npm run build
npm run preview
```

## 更新内容

修改 `src/config.ts` 中的简介、项目摘要、论文和教育信息。项目详情页内容在 `src/data/project-details.ts`，由 `src/pages/projects/[slug].astro` 生成独立页面。系统框图来自原始设计文稿，放在 `public/images/diagrams/`；论文及引用在 `public/papers/`。

首页项目区使用无图摘要，点击“查看项目详情”后查看系统架构、功能模块、工程亮点与成果。详情页框图可点击打开原图。

推送到 `main` 后，GitHub Actions 自动构建并发布到 GitHub Pages。仓库 Settings → Pages 的 Source 使用 GitHub Actions。

## 素材及许可

代码基于 MIT 许可的 DevPortfolio，原版权与许可保留在 `LICENSE.md`。项目展示照片来自本人的竞赛材料。论文 PDF 保留原文版权与许可说明；代码许可不覆盖论文及其他展示素材。
