# Negative Realm — all source files
Create each file at the exact path shown and paste its contents.

## `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
        env:
          # Automatically uses your repository name, e.g. /negative-realm/
          # If your repo is named <username>.github.io, change this to "/"
          VITE_BASE: /${{ github.event.repository.name }}/
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## `.gitignore`

```
node_modules
dist
.DS_Store
```

## `README.md`

````markdown
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
````

## `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="“At Least Until My Body Give Up On Me” — a zine of post-poetic writing and collected anatomy graphics by Negative Realm." />
    <meta name="theme-color" content="#000000" />
    <title>Negative Realm — “At Least Until My Body Give Up On Me”</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## `package.json`

```json
{
  "name": "negative-realm",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "pdfjs-dist": "4.4.168",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-pageflip": "2.0.3"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "4.3.4",
    "vite": "5.4.11"
  }
}
```

## `public/favicon.svg`

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#000"/><text x="32" y="43" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="34" fill="#eae6de">N</text></svg>
```

## `src/App.jsx`

```jsx
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import ProjectIntroduction from './components/ProjectIntroduction.jsx'
import Flipbook from './components/Flipbook.jsx'
import ArtistProfile from './components/ArtistProfile.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProjectIntroduction />
        <Flipbook />
        <ArtistProfile />
      </main>
      <Footer />
    </>
  )
}
```

## `src/components/ArtistProfile.jsx`

```jsx
import { useState } from 'react'

// EDIT THIS: replace the text with your own biography.
const profile = {
  name: 'Negative Realm',
  role: 'Poet and collector of anatomical graphics',
  bio: [
    'Negative Realm writes the poems and gathers the anatomical engravings that make up “At Least Until My Body Give Up On Me”.',
    'Add your own biography here: where you work from, what you make, how to get in touch.',
  ],
}

const PHOTO = `${import.meta.env.BASE_URL}assets/profile.jpg`

export default function ArtistProfile() {
  const [failed, setFailed] = useState(false)
  return (
    <section id="artist" className="section artist">
      <h2 className="section-title">The artist</h2>
      <div className="artist-grid">
        <figure className="artist-photo">
          {failed ? (
            <div className="artist-photo-missing">
              Add your photo at<br /><code>public/assets/profile.jpg</code>
            </div>
          ) : (
            <img src={PHOTO} alt={`Portrait of ${profile.name}`} onError={() => setFailed(true)} />
          )}
        </figure>
        <div className="artist-copy">
          <h3>{profile.name}</h3>
          <p className="artist-role">{profile.role}</p>
          {profile.bio.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
```

## `src/components/Flipbook.jsx`

```jsx
import { forwardRef, useEffect, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

// The worker file is bundled by Vite, so its URL respects the GitHub Pages base path.
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

// BASE_URL makes this path correct locally and under /<repo-name>/ on GitHub Pages.
const PDF_URL = `${import.meta.env.BASE_URL}assets/zine.pdf`
const RENDER_WIDTH = 1000 // pixel width each PDF page is rendered at

const Page = forwardRef(function Page({ src, number }, ref) {
  return (
    <div className="fb-page" ref={ref}>
      {src ? <img src={src} alt={`Page ${number}`} draggable={false} /> : null}
    </div>
  )
})

export default function Flipbook() {
  const shellRef = useRef(null)
  const stageRef = useRef(null)
  const bookRef = useRef(null)
  const currentRef = useRef(0)

  const [pages, setPages] = useState([])
  const [total, setTotal] = useState(0)
  const [ratio, setRatio] = useState(1.414)
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [rendered, setRendered] = useState(0)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [current, setCurrent] = useState(0)
  const [nativeFs, setNativeFs] = useState(false)
  const [pseudoFs, setPseudoFs] = useState(false)
  const isFull = nativeFs || pseudoFs

  // 1. Load the PDF and turn each page into an image
  useEffect(() => {
    let cancelled = false
    const urls = []
    let doc = null

    ;(async () => {
      try {
        doc = await pdfjsLib.getDocument(PDF_URL).promise
        if (cancelled) return
        setTotal(doc.numPages)
        setPages(new Array(doc.numPages).fill(null))

        const first = await doc.getPage(1)
        const v1 = first.getViewport({ scale: 1 })
        setRatio(v1.height / v1.width)
        setStatus('ready')

        for (let i = 1; i <= doc.numPages; i++) {
          if (cancelled) return
          const page = i === 1 ? first : await doc.getPage(i)
          const base = page.getViewport({ scale: 1 })
          const viewport = page.getViewport({ scale: RENDER_WIDTH / base.width })
          const canvas = document.createElement('canvas')
          canvas.width = Math.floor(viewport.width)
          canvas.height = Math.floor(viewport.height)
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
          const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.9))
          canvas.width = canvas.height = 0
          if (cancelled || !blob) return
          const url = URL.createObjectURL(blob)
          urls.push(url)
          setPages((prev) => {
            const next = prev.slice()
            next[i - 1] = url
            return next
          })
          setRendered(i)
          page.cleanup()
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Could not load the zine PDF:', err)
          setStatus('error')
        }
      }
    })()

    return () => {
      cancelled = true
      urls.forEach((u) => URL.revokeObjectURL(u))
      if (doc) doc.destroy()
    }
  }, [])

  // 2. Measure the available space
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: Math.floor(width), h: Math.floor(height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // 3. Fullscreen handling (native, with a CSS fallback for iPhones)
  useEffect(() => {
    const onChange = () => setNativeFs(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  useEffect(() => {
    document.body.style.overflow = pseudoFs ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [pseudoFs])

  const toggleFullscreen = async () => {
    const el = shellRef.current
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else if (pseudoFs) {
      setPseudoFs(false)
    } else if (el.requestFullscreen) {
      try { await el.requestFullscreen() } catch { setPseudoFs(true) }
    } else {
      setPseudoFs(true)
    }
    el.focus()
  }

  const flip = (dir) => {
    const api = bookRef.current && bookRef.current.pageFlip()
    if (!api) return
    if (dir > 0) api.flipNext()
    else api.flipPrev()
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); flip(1) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); flip(-1) }
    else if (e.key.toLowerCase() === 'f') toggleFullscreen()
    else if (e.key === 'Escape' && pseudoFs) setPseudoFs(false)
  }

  // Page dimensions: two pages side by side on wide screens, one page on narrow ones
  const twoUp = size.w >= 720
  let pageW = twoUp ? Math.floor(size.w / 2) : size.w
  let pageH = Math.floor(pageW * ratio)
  if (pageH > size.h) {
    pageH = size.h
    pageW = Math.floor(pageH / ratio)
  }
  const spread = pageW * 2 <= size.w
  const ready = status === 'ready' && size.w > 0 && size.h > 0 && pageW > 50

  let label = ''
  if (total) {
    if (current <= 0) label = `1 / ${total}`
    else if (spread && current + 2 <= total) label = `${current + 1}–${current + 2} / ${total}`
    else label = `${current + 1} / ${total}`
  }

  return (
    <section id="zine" className="section zine">
      <h2 className="section-title">The zine</h2>
      <p className="zine-hint">
        Click or drag a page corner to turn it. Arrow keys work too. Use fullscreen for the best view.
      </p>

      <div
        ref={shellRef}
        className={`fb-shell${pseudoFs ? ' is-pseudo-fs' : ''}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label="Zine flipbook"
      >
        <div ref={stageRef} className="fb-stage">
          {status === 'loading' && <p className="fb-message">Loading the zine…</p>}
          {status === 'error' && (
            <p className="fb-message">
              The zine could not be loaded. Make sure the file <code>public/assets/zine.pdf</code> exists,
              or <a href={PDF_URL}>open the PDF directly</a>.
            </p>
          )}
          {ready && (
            <HTMLFlipBook
              ref={bookRef}
              key={`${pageW}x${pageH}`}
              width={pageW}
              height={pageH}
              size="fixed"
              startPage={currentRef.current}
              showCover={true}
              usePortrait={true}
              maxShadowOpacity={0.45}
              flippingTime={700}
              mobileScrollSupport={true}
              className="fb-book"
              style={{}}
              onFlip={(e) => { currentRef.current = e.data; setCurrent(e.data) }}
            >
              {pages.map((src, i) => (
                <Page key={i} src={src} number={i + 1} />
              ))}
            </HTMLFlipBook>
          )}
        </div>

        <div className="fb-toolbar">
          <button type="button" onClick={() => flip(-1)} disabled={current <= 0} aria-label="Previous page">Previous</button>
          <span className="fb-count" aria-live="polite">
            {label}
            {status === 'ready' && rendered < total ? ` · preparing ${rendered}/${total}` : ''}
          </span>
          <button type="button" onClick={() => flip(1)} disabled={!total || current >= total - 1} aria-label="Next page">Next</button>
          <span className="fb-spacer" />
          <a className="fb-link" href={PDF_URL} target="_blank" rel="noreferrer">Original PDF</a>
          <button type="button" onClick={toggleFullscreen}>{isFull ? 'Exit fullscreen' : 'Fullscreen'}</button>
        </div>
      </div>
    </section>
  )
}
```

## `src/components/Footer.jsx`

```jsx
export default function Footer() {
  return (
    <footer className="footer">
      <p>“At Least Until My Body Give Up On Me” — Negative Realm, published by Endtroducing, 2026.</p>
      <p>
        All visual materials, anatomical engravings, and graphics are collected from public internet archives and remain the property of their respective original creators or public domain sources. All poems written by Negative Realm.
      </p>
    </footer>
  )
}
```

## `src/components/Hero.jsx`

```jsx
export default function Hero() {
  return (
    <section id="top" className="hero">
      <h1 className="hero-title">
        <span>“At least until</span>
        <span>my body give</span>
        <span>up on me”</span>
      </h1>
      <p className="hero-sub">
        Post-poetic writing and collected anatomy graphics from the internet, by Negative Realm.
      </p>
      <a className="btn" href="#zine">Open the zine</a>
    </section>
  )
}
```

## `src/components/Navbar.jsx`

```jsx
const links = [
  { href: '#introduction', label: 'Introduction' },
  { href: '#zine', label: 'Read the zine' },
  { href: '#artist', label: 'Artist' },
]

export default function Navbar() {
  return (
    <header className="navbar">
      <a className="navbar-brand" href="#top">Negative Realm</a>
      <nav aria-label="Main">
        <ul>
          {links.map((l) => (
            <li key={l.href}><a href={l.href}>{l.label}</a></li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
```

## `src/components/ProjectIntroduction.jsx`

```jsx
// The introduction below is the text printed on page 3 of the zine (in Indonesian).
// Edit freely.
const paragraphs = [
  'Lembar ini bukan sebuah catatan medis, bukan pula katalog ilmiah tentang organ dan daging. Ini adalah tempat di mana presisi anatomi bertemu dengan kesunyian yang paling pekat. Sebuah pembedahan atas apa yang tersisa ketika nyawa melepaskan genggamannya.',
  'Setiap lembar melukiskan ketegangan antara struktur tubuh dan kehampaan. Ilustrasi garis-garis tubuh, ruas-ruas kalsium, serta lipatan jaringan kaku yang tersingkap di sini disandingkan dengan larik-larik bait yang mengeja kepasrahan, pembusukan, dan waktu yang membeku.',
  'Di dalam arsip yang muram ini, setiap organ tak lagi berfungsi sebagai penopang hidup, melainkan monumen atas keruntuhan yang dingin. Pembuluh darah, sekat dada, hingga kedalaman usus diurai bukan untuk mencari kesembuhan, melainkan untuk mendokumentasikan jejak-jejak hening yang mengendap setelah seluruh jeritan dan napas usai.',
  'Setiap gambar dan tulisan dirancang untuk menyeret mata melintasi pualam busuk dan lorong-lorong kalsium yang membisu. Ini adalah ajakan untuk memandangi anatomi diri sendiri dari sudut pandang asing. Sebuah cermin tempat ketebalan takdir saling bertumpuk tanpa rasa iba.',
  'Selamat menelusuri lorong-lorong daging yang membisu. Tempat di mana bahasa manusia selesai, dan keheningan abadi dimulai.',
]

export default function ProjectIntroduction() {
  return (
    <section id="introduction" className="section intro">
      <h2 className="section-title">Introducing</h2>
      <p className="intro-lede">
        A 46-page zine of poems and anatomical engravings, arranged in three parts. The writing is in Indonesian; the part openers are in English.
      </p>
      <div className="intro-text" lang="id">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <p className="signature">Negative Realm, 2026</p>
    </section>
  )
}
```

## `src/main.jsx`

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

## `src/styles/global.css`

```css
/* ---------- Tokens ---------- */
:root {
  --ink: #000;
  --paper: #eae6de;
  --dim: #9a958b;
  --line: #2a2825;
  --serif: 'EB Garamond', 'Cormorant Garamond', Garamond, Georgia, serif;
  --measure: 38rem;
}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: 4.5rem; background: var(--ink); }
body {
  margin: 0;
  background: var(--ink);
  color: var(--paper);
  font-family: var(--serif);
  font-size: 1.2rem;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}
a { color: inherit; text-underline-offset: 0.25em; }
:focus-visible { outline: 1px solid var(--paper); outline-offset: 4px; }
code { font-family: ui-monospace, Menlo, monospace; font-size: 0.8em; }

/* ---------- Navbar ---------- */
.navbar {
  position: fixed; inset: 0 0 auto 0; z-index: 50;
  display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; flex-wrap: wrap;
  padding: 1rem clamp(1rem, 4vw, 3rem);
  background: linear-gradient(#000 60%, transparent);
}
.navbar-brand { font-style: italic; text-decoration: none; font-size: 1.15rem; }
.navbar ul { list-style: none; display: flex; gap: clamp(1rem, 3vw, 2rem); margin: 0; padding: 0; }
.navbar nav a { text-decoration: none; color: var(--dim); font-size: 1rem; transition: color .2s; }
.navbar nav a:hover { color: var(--paper); }

/* ---------- Hero ---------- */
.hero {
  min-height: 100svh; display: flex; flex-direction: column; justify-content: center; align-items: center;
  text-align: center; padding: 7rem 1.5rem 4rem; position: relative; overflow: hidden;
}
.hero::before { /* faint film grain */
  content: ''; position: absolute; inset: 0; pointer-events: none; opacity: .09;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}
.hero-title {
  margin: 0; font-weight: 400; font-size: clamp(2.4rem, 8.5vw, 6.5rem); line-height: 1.02;
  text-transform: uppercase; letter-spacing: 0.04em;
}
.hero-title span { display: block; opacity: 0; filter: blur(14px); animation: surface 2.8s ease-out forwards; }
.hero-title span:nth-child(2) { animation-delay: .9s; }
.hero-title span:nth-child(3) { animation-delay: 1.8s; }
@keyframes surface { to { opacity: 1; filter: blur(0); } }
.hero-sub { max-width: 32rem; margin: 2.5rem 0; font-style: italic; color: var(--dim); opacity: 0; animation: surface 2s 3s ease-out forwards; }
.btn {
  display: inline-block; padding: .7rem 1.8rem; border: 1px solid var(--paper); text-decoration: none;
  opacity: 0; animation: surface 2s 3.4s ease-out forwards; transition: background .2s, color .2s;
}
.btn:hover { background: var(--paper); color: var(--ink); }

/* ---------- Sections ---------- */
.section { padding: clamp(4rem, 10vw, 8rem) clamp(1.25rem, 5vw, 3rem); max-width: 70rem; margin: 0 auto; }
.section-title {
  margin: 0 0 2rem; text-align: center; font-weight: 400; font-size: 1.1rem;
  letter-spacing: 0.5em; text-transform: uppercase; padding-left: 0.5em;
}

/* Introduction */
.intro-lede { text-align: center; max-width: var(--measure); margin: 0 auto 3rem; color: var(--dim); }
.intro-text { max-width: var(--measure); margin: 0 auto; font-style: italic; text-align: justify; hyphens: auto; }
.intro-text p { margin: 0 0 1.6rem; }
.signature { max-width: var(--measure); margin: 3rem auto 0; font-style: italic; }

/* ---------- Flipbook ---------- */
.zine { max-width: 90rem; }
.zine-hint { text-align: center; color: var(--dim); margin: -1rem 0 2rem; font-size: 1rem; }
.fb-shell {
  display: flex; flex-direction: column; background: var(--ink);
  height: clamp(520px, 88vh, 980px); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
}
.fb-shell:fullscreen { height: 100vh; border: 0; }
.fb-shell.is-pseudo-fs { position: fixed; inset: 0; z-index: 100; height: 100dvh; border: 0; }
.fb-stage { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; padding: 1rem 0; position: relative; }
.fb-book { margin: 0 auto; }
.fb-page { background: #000; overflow: hidden; }
.fb-page img { display: block; width: 100%; height: 100%; object-fit: cover; user-select: none; -webkit-user-drag: none; }
.fb-message { text-align: center; color: var(--dim); max-width: 28rem; padding: 0 1rem; }
.fb-toolbar {
  display: flex; align-items: center; flex-wrap: wrap; gap: .5rem 1rem; padding: .75rem 1rem;
  border-top: 1px solid var(--line); font-size: 1rem;
}
.fb-spacer { flex: 1; }
.fb-count { min-width: 9rem; text-align: center; color: var(--dim); font-variant-numeric: tabular-nums; }
.fb-toolbar button, .fb-link {
  font: inherit; color: var(--paper); background: none; border: 1px solid var(--line);
  padding: .35rem 1rem; cursor: pointer; text-decoration: none; transition: border-color .2s;
}
.fb-toolbar button:hover:not(:disabled), .fb-link:hover { border-color: var(--paper); }
.fb-toolbar button:disabled { opacity: .35; cursor: default; }

/* ---------- Artist ---------- */
.artist-grid { display: grid; grid-template-columns: minmax(0, 22rem) minmax(0, 1fr); gap: clamp(2rem, 6vw, 5rem); align-items: start; justify-content: center; }
.artist-photo { margin: 0; aspect-ratio: 4 / 5; background: #0d0d0d; border: 1px solid var(--line); }
.artist-photo img { width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(1) contrast(1.05); }
.artist-photo-missing { height: 100%; display: grid; place-items: center; text-align: center; color: var(--dim); padding: 1rem; font-size: 1rem; }
.artist-copy h3 { margin: 0; font-weight: 400; font-style: italic; font-size: 2rem; }
.artist-role { color: var(--dim); margin: 0 0 1.5rem; }
.artist-copy p { max-width: var(--measure); }

/* ---------- Footer ---------- */
.footer { border-top: 1px solid var(--line); padding: 3rem clamp(1.25rem, 5vw, 3rem) 4rem; color: var(--dim); font-size: 1rem; text-align: center; }
.footer p { max-width: var(--measure); margin: 0 auto 1rem; }

/* ---------- Responsive ---------- */
@media (max-width: 720px) {
  body { font-size: 1.1rem; }
  .navbar { flex-direction: column; align-items: center; gap: .25rem; }
  .artist-grid { grid-template-columns: 1fr; }
  .artist-photo { max-width: 22rem; margin: 0 auto; }
  .intro-text { text-align: left; }
  .fb-toolbar { justify-content: center; }
  .fb-spacer { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .hero-title span, .hero-sub, .btn { animation: none; opacity: 1; filter: none; }
}
```

## `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BASE PATH
// './' (relative) works on any GitHub Pages URL and locally, so nothing needs replacing.
// The GitHub Actions workflow sets VITE_BASE to "/<your-repo-name>/" automatically.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || './',
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1500,
  },
})
```
