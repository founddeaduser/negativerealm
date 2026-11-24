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
