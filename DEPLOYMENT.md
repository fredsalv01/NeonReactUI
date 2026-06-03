# Deployment Guide

## GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages from the `dev` branch.

### Setup

1. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` (will be created automatically on first deploy)
   - Folder: `/ (root)`

2. **First Deploy:**
   ```bash
   git push origin dev
   ```
   GitHub Actions will automatically build and deploy the site.

### How It Works

- **Trigger**: Pushes to the `dev` branch or manual workflow dispatch
- **Build**: Runs `npm run build` with `GITHUB_PAGES=true`
- **Deploy**: Uploads `dist/` folder to `gh-pages` branch
- **URL**: `https://[username].github.io/NeonReactUI/`

### Base URL

The app is configured to work at `/NeonReactUI/` on GitHub Pages.

For local development:
```bash
npm run dev  # Uses base: '/'
```

For GitHub Pages build:
```bash
GITHUB_PAGES=true npm run build  # Uses base: '/NeonReactUI/'
```

### Workflow Files

- `.github/workflows/ci.yml` - Runs tests & lint on all branches
- `.github/workflows/gh-pages.yml` - Deploys to GitHub Pages from `dev`

### Manual Deploy

Trigger deployment without pushing:
1. Go to Actions tab
2. Select "Deploy to GitHub Pages"
3. Click "Run workflow"
4. Select branch: `dev`

### Troubleshooting

**Page not loading after deploy:**
- Check Actions tab for build errors
- Verify `gh-pages` branch exists and has content
- Clear browser cache and refresh

**CSS/JS files not loading:**
- Make sure base URL is `/NeonReactUI/` in production
- Check browser console for 404 errors

**Deploy failed:**
- Check Actions logs for build errors
- Run `npm run build` locally to verify it builds
