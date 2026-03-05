# Git Visualizer

High-end interactive Git learning platform built with Next.js 14, TypeScript, TailwindCSS, Framer Motion, and D3-driven graph rendering.

## Features

- Animated commit graph with branch/merge visualization
- Client-side Git repository simulation engine
- Live terminal sandbox for command execution
- Gamified learning path and Git challenge mode
- Interactive rebase simulator (pick/reword/edit/squash/fixup/drop)
- Git time machine with timeline slider
- GitHub Pages-ready static export

## Development

```bash
npm install
npm run dev
```

## Build for GitHub Pages

```bash
npm run build
```

`next.config.js` is preconfigured for:

- `output: 'export'`
- `basePath: '/git-visualizer'`
- `assetPrefix: '/git-visualizer/'`
- `images.unoptimized = true`
