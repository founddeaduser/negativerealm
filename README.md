# Negative Realm — “At Least Until My Body Give Up On Me”

A React + Vite website with a 46-page PDF flipbook, ready for GitHub Pages.

## Add your assets
- `public/assets/zine.pdf`: your original 46-page zine
- `public/assets/profile.jpg`: your artist photograph

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Deploy
Push to the `main` branch. In the repository go to Settings → Pages and set **Source** to **GitHub Actions**. The workflow in `.github/workflows/deploy.yml` builds and publishes the site.
