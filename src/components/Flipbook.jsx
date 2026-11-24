import { forwardRef, useEffect, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from '../pdf.worker.js?worker&url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

const PDF_URL = `${import.meta.env.BASE_URL}assets/zine.pdf`
const RENDER_WIDTH = 1000

const Page = forwardRef(function Page({ src, number }, ref) {
  return (
    <div className="fb-page" ref={ref}>
      {src && (
        <img
          src={src}
          alt={`Page ${number}`}
          draggable={false}
        />
      )}
    </div>
  )
})

export default function Flipbook() {
  const shellRef = useRef(null)
  const stageRef = useRef(null)
  const bookRef = useRef(null)
  const touchStartX = useRef(null)
  const currentRef = useRef(0)

  const [pages, setPages] = useState([])
  const [total, setTotal] = useState(0)
  const [ratio, setRatio] = useState(1.414)
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [rendered, setRendered] = useState(0)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [current, setCurrent] = useState(0)
  const [nativeFs, setNativeFs] = useState(false)
  const [pseudoFs, setPseudoFs] = useState(false)

  const isFull = nativeFs || pseudoFs
  const isMobile = size.w < 720

  // Load PDF and render its pages into images.
  useEffect(() => {
    let cancelled = false
    const urls = []
    let doc = null

    async function loadPDF() {
      try {
        doc = await pdfjsLib.getDocument(PDF_URL).promise
        if (cancelled) return

        setTotal(doc.numPages)
        setPages(new Array(doc.numPages).fill(null))

        const firstPage = await doc.getPage(1)
        const firstViewport = firstPage.getViewport({ scale: 1 })

        setRatio(firstViewport.height / firstViewport.width)
        setStatus('ready')

        for (let i = 1; i <= doc.numPages; i++) {
          if (cancelled) return

          const page = i === 1 ? firstPage : await doc.getPage(i)
          const baseViewport = page.getViewport({ scale: 1 })
          const viewport = page.getViewport({
            scale: RENDER_WIDTH / baseViewport.width,
          })

          const canvas = document.createElement('canvas')
          canvas.width = Math.floor(viewport.width)
          canvas.height = Math.floor(viewport.height)

          const context = canvas.getContext('2d')
          if (!context) throw new Error('Could not create page canvas.')

          await page.render({
            canvasContext: context,
            viewport,
          }).promise

          const blob = await new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/jpeg', 0.9)
          })

          canvas.width = 0
          canvas.height = 0

          if (cancelled || !blob) return

          const url = URL.createObjectURL(blob)
          urls.push(url)

          setPages((previous) => {
            const updated = previous.slice()
            updated[i - 1] = url
            return updated
          })

          setRendered(i)
          page.cleanup()
        }
      } catch (error) {
        console.error('Could not load the zine PDF:', error)

        if (!cancelled) {
          setErrorMessage(error?.message || String(error))
          setStatus('error')
        }
      }
    }

    loadPDF()

    return () => {
      cancelled = true
      urls.forEach((url) => URL.revokeObjectURL(url))
      if (doc) doc.destroy()
    }
  }, [])

  // Measure the flipbook area.
  useEffect(() => {
    const element = stageRef.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({
        w: Math.floor(width),
        h: Math.floor(height),
      })
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Native fullscreen and mobile fallback.
  useEffect(() => {
    const handleFullscreen = () => {
      setNativeFs(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', handleFullscreen)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreen)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = pseudoFs ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [pseudoFs])

  const toggleFullscreen = async () => {
    const element = shellRef.current
    if (!element) return

    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else if (pseudoFs) {
      setPseudoFs(false)
    } else if (element.requestFullscreen) {
      try {
        await element.requestFullscreen()
      } catch {
        setPseudoFs(true)
      }
    } else {
      setPseudoFs(true)
    }

    element.focus()
  }

  const goToPage = (index) => {
    const next = Math.max(0, Math.min(index, total - 1))
    currentRef.current = next
    setCurrent(next)
  }

  const flip = (direction) => {
    if (isMobile) {
      goToPage(current + direction)
      return
    }

    const api = bookRef.current?.pageFlip()
    if (!api) return

    if (direction > 0) api.flipNext()
    else api.flipPrev()
  }

  const handleTouchStart = (event) => {
    touchStartX.current = event.changedTouches[0].clientX
  }

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return

    const endX = event.changedTouches[0].clientX
    const distance = endX - touchStartX.current

    if (Math.abs(distance) > 45) {
      goToPage(current + (distance < 0 ? 1 : -1))
    }

    touchStartX.current = null
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      flip(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      flip(-1)
    } else if (event.key.toLowerCase() === 'f') {
      toggleFullscreen()
    } else if (event.key === 'Escape' && pseudoFs) {
      setPseudoFs(false)
    }
  }

  // Calculate desktop page dimensions.
  let pageW = Math.floor(size.w / 2)
  let pageH = Math.floor(pageW * ratio)

  if (pageH > size.h) {
    pageH = size.h
    pageW = Math.floor(pageH / ratio)
  }

  const ready =
    status === 'ready' &&
    size.w > 0 &&
    size.h > 0 &&
    pageW > 50 &&
    pageH > 50

  const label = total
    ? `${current + 1} / ${total}`
    : ''

  return (
    <section id="zine" className="section zine">
      <h2 className="section-title">The zine</h2>

      <p className="zine-hint">
        {isMobile
          ? 'Swipe to turn the pages, or use the navigation buttons.'
          : 'Click or drag a page corner to turn it. Arrow keys work too. Use fullscreen for the best view.'}
      </p>

      <div
        ref={shellRef}
        className={`fb-shell${pseudoFs ? ' is-pseudo-fs' : ''}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Zine flipbook"
      >
        <div ref={stageRef} className="fb-stage">
          {status === 'error' && (
            <p className="fb-message">
              The zine could not be loaded.
              <br />
              <code>{errorMessage}</code>
              <br />
              <a href={PDF_URL} target="_blank" rel="noreferrer">
                Open the PDF directly
              </a>
            </p>
          )}

          {ready && isMobile && pages[current] && (
            <div
              className="fb-mobile-reader"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={pages[current]}
                alt={`Page ${current + 1}`}
                draggable={false}
              />
            </div>
          )}

          {ready && !isMobile && (
            <HTMLFlipBook
              ref={bookRef}
              width={pageW}
              height={pageH}
              size="fixed"
              startPage={currentRef.current}
              showCover={true}
              usePortrait={false}
              maxShadowOpacity={0.45}
              flippingTime={700}
              mobileScrollSupport={false}
              className="fb-book"
              style={{}}
              onFlip={(event) => {
                currentRef.current = event.data
                setCurrent(event.data)
              }}
            >
              {pages.map((src, index) => (
                <Page
                  key={index}
                  src={src}
                  number={index + 1}
                />
              ))}
            </HTMLFlipBook>
          )}
        </div>

        <div className="fb-toolbar">
          <button
            type="button"
            onClick={() => flip(-1)}
            disabled={current <= 0}
            aria-label="Previous page"
          >
            Previous
          </button>

          <span className="fb-count" aria-live="polite">
            {label}
            {status === 'ready' && rendered < total
              ? ` · preparing ${rendered}/${total}`
              : ''}
          </span>

          <button
            type="button"
            onClick={() => flip(1)}
            disabled={!total || current >= total - 1}
            aria-label="Next page"
          >
            Next
          </button>

          <span className="fb-spacer" />

          <button type="button" onClick={toggleFullscreen}>
            {isFull ? 'Exit fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>
    </section>
  )
}
