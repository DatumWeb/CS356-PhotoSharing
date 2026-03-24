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

## GitHub Pages URL

Configured for deployment at:

`https://datumweb.github.io/CS356-PhotoSharing/`
