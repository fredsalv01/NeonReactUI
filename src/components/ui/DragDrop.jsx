/**
 * DragDrop — two composable primitives:
 *
 *  DropZone     — OS file drag-and-drop / click-to-browse upload area
 *  SortableList — drag-to-reorder list with neon drop indicator
 */

import { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback, useId } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon'

// ────────────────────────────────────────────────────────────────
// DropZone
// ────────────────────────────────────────────────────────────────

function formatSize(bytes) {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileRow({ file, onRemove }) {
  const isImage = file.type.startsWith('image/')
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (!isImage) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file, isImage])

  const ext = file.name.includes('.')
    ? file.name.split('.').pop().toUpperCase().slice(0, 4)
    : '—'

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5
                 bg-gs-surface border border-gs-border rounded-xl
                 animate-fade-in group transition-colors duration-150
                 hover:border-gs-border/80"
    >
      {/* Left: thumbnail for images, ext badge for everything else */}
      {isImage && preview ? (
        <img
          src={preview}
          alt=""
          className="w-10 h-10 rounded-lg object-cover shrink-0
                     border border-gs-border ring-1 ring-transparent
                     group-hover:ring-gs-accent/30 transition-all duration-200"
        />
      ) : (
        <span
          className="shrink-0 text-[9px] font-bold font-['DM_Mono']
                     px-1.5 py-0.5 rounded-md
                     bg-gs-accent/10 text-gs-accent border border-gs-accent/20"
        >
          {ext}
        </span>
      )}

      {/* Name + size */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gs-text font-['DM_Mono'] truncate leading-none">
          {file.name}
        </p>
        {isImage && (
          <p className="text-[10px] text-gs-muted font-['DM_Mono'] mt-0.5 leading-none">
            {ext} · {formatSize(file.size)}
          </p>
        )}
      </div>

      {/* Size — non-images only (images show it inline above) */}
      {!isImage && (
        <span className="text-[11px] text-gs-muted font-['DM_Mono'] shrink-0">
          {formatSize(file.size)}
        </span>
      )}

      {/* Remove */}
      <button
        onClick={() => onRemove(file)}
        className="shrink-0 text-gs-muted hover:text-gs-danger
                   transition-colors cursor-pointer
                   opacity-0 group-hover:opacity-100"
        aria-label="Remove file"
      >
        <Icon name="close" size={13} />
      </button>
    </div>
  )
}

/**
 * @param {{
 *   onFiles?:    (files: File[]) => void,
 *   accept?:     string,
 *   multiple?:   boolean,
 *   maxSizeMB?:  number,
 *   label?:      string,
 *   sublabel?:   string,
 *   className?:  string,
 * }} props
 */
export function DropZone({
  onFiles,
  accept,
  multiple   = true,
  maxSizeMB  = 10,
  label      = 'Drop files here or click to browse',
  sublabel,
  className  = '',
}) {
  const [isDragging, setIsDragging]   = useState(false)
  const [dragCounter, setDragCounter] = useState(0)
  const [files, setFiles]             = useState([])
  const [error, setError]             = useState(null)
  const inputRef                      = useRef(null)
  const id                            = useId()

  const addFiles = useCallback((incoming) => {
    setError(null)
    const maxBytes = maxSizeMB * 1024 * 1024
    const valid = []
    const oversized = []

    for (const f of incoming) {
      if (f.size > maxBytes) oversized.push(f.name)
      else valid.push(f)
    }

    if (oversized.length) {
      setError(`${oversized.join(', ')} exceed ${maxSizeMB} MB limit`)
    }
    if (!valid.length) return

    const next = multiple ? [...files, ...valid] : valid.slice(0, 1)
    setFiles(next)
    onFiles?.(next)
  }, [files, multiple, maxSizeMB, onFiles])

  const removeFile = (target) => {
    const next = files.filter(f => f !== target)
    setFiles(next)
    onFiles?.(next)
  }

  // Drag events — use a counter to handle child element re-triggers
  const onDragEnter = (e) => {
    e.preventDefault()
    setDragCounter(c => c + 1)
    setIsDragging(true)
  }
  const onDragLeave = (e) => {
    e.preventDefault()
    setDragCounter(c => {
      const next = c - 1
      if (next <= 0) setIsDragging(false)
      return next
    })
  }
  const onDragOver = (e) => e.preventDefault()
  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    setDragCounter(0)
    addFiles(Array.from(e.dataTransfer.files))
  }

  const onInputChange = (e) => {
    addFiles(Array.from(e.target.files ?? []))
    e.target.value = ''
  }

  const sublabelText = sublabel ?? [
    accept && `Accepted: ${accept}`,
    `Max ${maxSizeMB} MB${multiple ? ' per file' : ''}`,
  ].filter(Boolean).join(' · ')

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Drop area */}
      <div
        role="button"
        tabIndex={0}
        aria-label="File upload area"
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        className="relative flex flex-col items-center justify-center gap-3
                   rounded-2xl border-2 border-dashed cursor-pointer
                   transition-all duration-200 outline-none
                   px-6 py-10 text-center select-none"
        style={{
          borderColor:    isDragging ? 'var(--gs-accent)' : 'var(--gs-border)',
          background:     isDragging
            ? 'color-mix(in srgb, var(--gs-accent) 5%, var(--gs-surface))'
            : 'var(--gs-surface)',
          boxShadow:      isDragging
            ? '0 0 0 1px var(--gs-accent), 0 0 24px color-mix(in srgb, var(--gs-accent) 12%, transparent)'
            : 'none',
        }}
      >
        {/* Animated icon */}
        <span
          className="flex items-center justify-center w-12 h-12 rounded-2xl
                     transition-all duration-300"
          style={{
            background:  isDragging
              ? 'color-mix(in srgb, var(--gs-accent) 15%, transparent)'
              : 'color-mix(in srgb, var(--gs-border) 60%, transparent)',
            border: `1px solid ${isDragging ? 'color-mix(in srgb, var(--gs-accent) 30%, transparent)' : 'var(--gs-border)'}`,
            transform: isDragging ? 'scale(1.1) translateY(-2px)' : 'scale(1)',
          }}
        >
          <Icon
            name="upload"
            size={22}
            color={isDragging ? 'var(--gs-accent)' : 'var(--gs-soft)'}
          />
        </span>

        <div>
          <p
            className="text-sm font-semibold font-['Syne'] transition-colors duration-200"
            style={{ color: isDragging ? 'var(--gs-accent)' : 'var(--gs-text)' }}
          >
            {isDragging ? 'Release to upload' : label}
          </p>
          {sublabelText && (
            <p className="text-[11px] font-['DM_Mono'] text-gs-muted mt-1">
              {sublabelText}
            </p>
          )}
        </div>

        <input
          ref={inputRef}
          id={id}
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          onChange={onInputChange}
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-[11px] font-['DM_Mono'] text-gs-danger flex items-center gap-1.5">
          <Icon name="alert" size={11} color="var(--gs-danger)" />
          {error}
        </p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <FileRow key={`${f.name}-${i}`} file={f} onRemove={removeFile} />
          ))}
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// SortableList
// ────────────────────────────────────────────────────────────────

/**
 * Drag-to-reorder list with Trello-style FLIP animation.
 * Uses pointer events + CSS transform FLIP — no library needed.
 *
 * @param {{
 *   items:         any[],
 *   renderItem:    (item: any, index: number) => React.ReactNode,
 *   onChange:      (newItems: any[]) => void,
 *   keyExtractor?: (item: any, index: number) => string | number,
 *   className?:    string,
 * }} props
 */
export function SortableList({
  items,
  renderItem,
  onChange,
  keyExtractor = (_, i) => i,
  className = '',
}) {
  const [drag, setDrag] = useState(null)
  const rowRefs = useRef([])
  const prevPos = useRef({})   // { [key]: { top } } — snapshot before each reorder

  // ── Visual order during drag ────────────────────────────────
  const previewItems = useMemo(() => {
    if (!drag || drag.from === drag.over) return items
    const arr = [...items]
    const [item] = arr.splice(drag.from, 1)
    arr.splice(drag.over, 0, item)
    return arr
  }, [items, drag?.from, drag?.over])

  // ── FLIP: run after React commits the new DOM order ─────────
  useLayoutEffect(() => {
    if (!drag) return
    const draggedKey = String(keyExtractor(items[drag.from], drag.from))

    previewItems.forEach((item, i) => {
      const el = rowRefs.current[i]
      if (!el) return
      const key = String(keyExtractor(item, i))
      if (key === draggedKey) return   // placeholder never animates

      const stored = prevPos.current[key]
      if (!stored) return

      const dy = stored.top - el.getBoundingClientRect().top
      if (Math.abs(dy) < 1) return

      // Apply inverse offset so item appears to start from its old position,
      // then animate forward to its true new position.
      el.style.transition = 'none'
      el.style.transform  = `translateY(${dy}px)`
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.transition = 'transform 220ms cubic-bezier(0.2, 0, 0, 1)'
        el.style.transform  = 'translateY(0)'
      }))
    })
  }, [previewItems]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Snapshot positions — called right before a reorder ──────
  const snapshot = useCallback(() => {
    previewItems.forEach((item, i) => {
      const el = rowRefs.current[i]
      if (!el) return
      prevPos.current[String(keyExtractor(item, i))] = {
        top: el.getBoundingClientRect().top,
      }
    })
  }, [previewItems, keyExtractor])

  // ── Pointer handlers ────────────────────────────────────────
  const onPointerDown = (e, i) => {
    if (e.button !== undefined && e.button !== 0) return
    if (!e.target.closest('[data-drag-handle]')) return
    e.preventDefault()

    const el = rowRefs.current[i]
    if (!el) return
    const rect = el.getBoundingClientRect()

    setDrag({
      from: i, over: i,
      offsetY:    e.clientY - rect.top,
      clientY:    e.clientY,
      clientX:    e.clientX,
      cardHeight: rect.height,
      width:      rect.width,
      left:       rect.left,
    })
    el.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e, i) => {
    if (!drag || drag.from !== i) return
    const y = e.clientY
    let newOver = 0

    for (let j = 0; j < rowRefs.current.length; j++) {
      const el = rowRefs.current[j]
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (y <= r.top + r.height / 2) { newOver = j; break }
      newOver = j
    }

    if (newOver !== drag.over) {
      snapshot()   // record positions before the reorder triggers
      setDrag(d => d ? { ...d, over: newOver, clientY: y, clientX: e.clientX } : null)
    } else {
      setDrag(d => d ? { ...d, clientY: y, clientX: e.clientX } : null)
    }
  }

  const onPointerUp = (e, i) => {
    if (!drag || drag.from !== i) return
    if (drag.from !== drag.over) {
      const next = [...items]
      const [moved] = next.splice(drag.from, 1)
      next.splice(drag.over, 0, moved)
      onChange(next)
    }
    setDrag(null)
  }

  const draggedItem = drag ? items[drag.from] : null
  const draggedKey  = drag ? String(keyExtractor(items[drag.from], drag.from)) : null

  return (
    <>
      <ul className={`space-y-2 ${className}`} role="list">
        {previewItems.map((item, i) => {
          const key          = String(keyExtractor(item, i))
          const isPlaceholder = drag && key === draggedKey

          return (
            <li
              key={key}
              ref={el => { rowRefs.current[i] = el }}
              onPointerDown={e => onPointerDown(e, i)}
              onPointerMove={e => onPointerMove(e, drag?.from ?? i)}
              onPointerUp={e => onPointerUp(e, drag?.from ?? i)}
              onPointerCancel={e => onPointerUp(e, drag?.from ?? i)}
              className="select-none"
            >
              {isPlaceholder ? (
                // Ghost slot — neon dashed outline, same height as the card
                <div
                  className="rounded-xl border-2 border-dashed"
                  style={{
                    height:      drag.cardHeight,
                    borderColor: 'color-mix(in srgb, var(--gs-accent) 35%, transparent)',
                    background:  'color-mix(in srgb, var(--gs-accent) 4%, transparent)',
                  }}
                />
              ) : (
                <div
                  className="flex items-center gap-3
                             bg-gs-card border border-gs-border rounded-xl px-4 py-3
                             cursor-grab active:cursor-grabbing"
                >
                  <span
                    data-drag-handle
                    className="text-gs-muted hover:text-gs-soft transition-colors shrink-0"
                    aria-hidden="true"
                  >
                    <Icon name="grip" size={16} />
                  </span>
                  <div className="flex-1 min-w-0">
                    {renderItem(item, i)}
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {/* Floating clone — lifted card that follows the cursor */}
      {drag && draggedItem && createPortal(
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{
            position:        'fixed',
            top:             drag.clientY - drag.offsetY,
            left:            drag.left,
            width:           drag.width,
            zIndex:          9999,
            pointerEvents:   'none',
            background:      'var(--gs-card)',
            border:          '1px solid var(--gs-accent)',
            boxShadow:       '0 0 0 1px var(--gs-accent), 0 20px 48px rgba(0,0,0,0.55)',
            transform:       'rotate(1.2deg) scale(1.03)',
            transformOrigin: 'top left',
          }}
        >
          <span className="shrink-0 text-gs-accent" aria-hidden="true">
            <Icon name="grip" size={16} />
          </span>
          <div className="flex-1 min-w-0">
            {renderItem(draggedItem, drag.from)}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
