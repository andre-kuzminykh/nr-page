import { useEffect, useRef, useState } from 'react'
import type { LightPreset } from '../../data/slides'
import { FRAGMENT, VERTEX } from './shader'
import './LightField.css'

interface Props {
  preset: LightPreset
  reducedMotion: boolean
  /** Changes on every slide change — sends a soft illumination pulse through the field. */
  pulseKey: number
}

const BG = [11 / 255, 10 / 255, 15 / 255]

/** Frozen moment used for reduced motion: a calm, clearly overlapping composition. */
const STILL_TIME = 11.5

interface State {
  x: number
  y: number
  radius: number
  energy: number
  spread: number
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(log ?? 'shader compile failed')
  }
  return shader
}

/**
 * Continuous Light Background.
 * One WebGL surface that lives for the whole session — it is never re-created between
 * slides; each slide only moves its composition. Renders at reduced resolution (the
 * light is soft by nature), adapts quality to frame time and pauses in hidden tabs.
 */
export function LightField({ preset, reducedMotion, pulseKey }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = useState(false)
  const target = useRef({ preset, reducedMotion })
  const pulse = useRef(0)
  const wake = useRef<() => void>(() => {})

  target.current = { preset, reducedMotion }

  useEffect(() => {
    pulse.current = 1
    wake.current()
  }, [pulseKey])

  useEffect(() => {
    wake.current()
  }, [preset, reducedMotion])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      powerPreference: 'low-power',
      preserveDrawingBuffer: false,
    })
    if (!gl) {
      setFailed(true)
      return
    }

    let program: WebGLProgram
    try {
      const vs = compile(gl, gl.VERTEX_SHADER, VERTEX)
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
      program = gl.createProgram()!
      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('link failed')
    } catch (err) {
      console.warn('[LightField] falling back to CSS light', err)
      setFailed(true)
      return
    }

    gl.useProgram(program)
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const u = {
      res: gl.getUniformLocation(program, 'uRes'),
      time: gl.getUniformLocation(program, 'uTime'),
      a: gl.getUniformLocation(program, 'uA'),
      b: gl.getUniformLocation(program, 'uB'),
      energy: gl.getUniformLocation(program, 'uEnergy'),
      bg: gl.getUniformLocation(program, 'uBg'),
      shape: gl.getUniformLocation(program, 'uShape'),
      px: gl.getUniformLocation(program, 'uPx'),
    }

    const initial = target.current
    const s: State = { ...initial.preset }

    // Render at up to 1.5 canvas px per CSS px (keeps the grain fine); step down if frames get slow.
    let quality = 1
    let width = 0
    let height = 0
    let pxRatio = 1
    const resize = () => {
      pxRatio = Math.min(window.devicePixelRatio || 1, 1.5) * quality
      const w = Math.max(2, Math.round(window.innerWidth * pxRatio))
      const h = Math.max(2, Math.round(window.innerHeight * pxRatio))
      if (w !== width || h !== height) {
        width = w
        height = h
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
    }
    resize()

    let raf = 0
    let last = performance.now()
    let clock = 3.2
    let flow = 0
    let slowFrames = 0
    let frames = 0
    let lost = false
    let idle = true

    const draw = (time: number) => {
      const aspectW = width / Math.min(width, height)
      const aspectH = height / Math.min(width, height)
      const portrait = width < height
      // On portrait screens pull the light towards the middle so it stays on screen.
      const px = portrait ? 0.5 + (s.x - 0.5) * 0.55 : s.x
      const R = s.radius * (portrait ? 1.25 : 1)
      const mx = (px - 0.5) * aspectW + 0.05 * R * Math.sin(time * 0.21)
      const my = (0.5 - s.y) * aspectH + 0.05 * R * Math.cos(time * 0.17)

      // The two fields orbit a shared midpoint; their separation breathes but always
      // stays below their radius, so they never fully separate.
      const theta = time * ((2 * Math.PI) / 26) + 0.9
      const sep = R * s.spread * (0.82 + 0.3 * Math.sin(time * ((2 * Math.PI) / 19)))
      const dx = Math.cos(theta) * sep * 0.5
      const dy = Math.sin(theta) * sep * 0.5 * 0.75
      const ra = R * (1 + 0.1 * Math.sin(time * 0.31))
      const rb = R * (0.94 + 0.1 * Math.cos(time * 0.27))

      const boost = 1 + 0.22 * pulse.current

      gl.uniform2f(u.res, width, height)
      gl.uniform1f(u.time, time)
      gl.uniform4f(u.a, mx + dx, my + dy, ra, 0.95)
      gl.uniform4f(u.b, mx - dx, my - dy, rb, 1.18)
      gl.uniform1f(u.energy, s.energy * boost)
      gl.uniform3f(u.bg, BG[0], BG[1], BG[2])
      // Shapes keep changing: each field slowly rotates and stretches.
      gl.uniform4f(
        u.shape,
        0.6 + time * 0.11,
        2.1 - time * 0.09,
        1 + 0.24 * Math.sin(time * 0.23),
        1 + 0.22 * Math.cos(time * 0.19 + 1),
      )
      gl.uniform1f(u.px, pxRatio)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const tick = (now: number) => {
      raf = 0
      if (lost) return
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      const { preset: p, reducedMotion: still } = target.current

      const k = 1 - Math.exp(-dt / (still ? 0.12 : 0.55))
      s.x += (p.x - s.x) * k
      s.y += (p.y - s.y) * k
      s.radius += (p.radius - s.radius) * k
      s.energy += (p.energy - s.energy) * k
      s.spread += (p.spread - s.spread) * k

      if (still) {
        pulse.current = 0
        flow = STILL_TIME
      } else {
        pulse.current *= Math.exp(-dt / 0.7)
        clock += dt * (1 + 1.6 * pulse.current)
        flow = clock
      }

      resize()
      draw(flow)

      // Adaptive quality: if frames are consistently slow, render fewer pixels.
      frames++
      if (!still && dt > 0.028) slowFrames++
      if (frames >= 90) {
        if (slowFrames > 45 && quality > 0.5) {
          quality = Math.max(0.5, quality - 0.2)
          resize()
        }
        frames = 0
        slowFrames = 0
      }

      const settling =
        Math.abs(p.x - s.x) + Math.abs(p.y - s.y) + Math.abs(p.energy - s.energy) +
          Math.abs(p.radius - s.radius) > 0.002
      if (!still || settling) schedule()
      else idle = true
    }

    const schedule = () => {
      if (raf || document.hidden || lost) return
      if (idle) {
        last = performance.now()
        idle = false
      }
      raf = requestAnimationFrame(tick)
    }
    wake.current = schedule

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
        idle = true
      } else schedule()
    }
    const onResize = () => {
      resize()
      schedule()
    }
    const onLost = (e: Event) => {
      e.preventDefault()
      lost = true
      setFailed(true)
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('resize', onResize)
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.dataset.ready = 'true'
    schedule()

    return () => {
      cancelAnimationFrame(raf)
      wake.current = () => {}
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', onResize)
      canvas.removeEventListener('webglcontextlost', onLost)
    }
  }, [])

  return (
    <div className="light-field" aria-hidden="true" data-fallback={failed || undefined}>
      {failed ? (
        <div
          className="light-field__fallback"
          style={{ ['--lx' as string]: `${preset.x * 100}%`, ['--ly' as string]: `${preset.y * 100}%` }}
        />
      ) : (
        <canvas ref={canvasRef} className="light-field__canvas" />
      )}
    </div>
  )
}
