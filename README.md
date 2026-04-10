# PhotoSort

PhotoSort is a React + TypeScript mock image-sharing site with an Events-first information architecture.  
It focuses on browsing, filtering, and organizing photos by tags and event context.

## Information Architecture

- **Primary entry point:** `Events` page (default home screen)
- **Top-level event groups:** Wedding, Graduation, Family Reunion
- **Secondary organization:** tags for people, actions, moments, and social interactions
- **Cross-cutting behavior:** one photo can belong to multiple tag groupings
- **Social actions:** share/comment/add-to-album/delete are simulated with toasts

This structure reflects card-sort findings: users naturally grouped content around events first, then people/actions/memories.

## Local Development

```bash
npm install
npm run dev
```

Open the app at `http://localhost:5173`.

## GitHub Pages

**Live site:** https://datumweb.github.io/CS356-PhotoSharing/

**One-time setup (repo admin):**

1. **Settings** → **Pages** → **Build and deployment** → **Source:** **GitHub Actions** (not “Deploy from a branch”).
2. Push to `main` or open **Actions** → **Deploy to GitHub Pages** → **Run workflow**.

The workflow (`.github/workflows/deploy-pages.yml`) runs `npm ci` and `npm run build`, then publishes the `dist/` folder. The Vite `base` path is `/CS356-PhotoSharing/` in production builds only.
