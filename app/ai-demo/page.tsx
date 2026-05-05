"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Gamepad2, RotateCw, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

type GameKey = "pacman" | "blocks" | "ufos"
type Direction = "up" | "down" | "left" | "right"

type Dot = { x: number; y: number; eaten?: boolean }
type Bullet = { x: number; y: number }
type EnemyBullet = { x: number; y: number; speed: number }
type Explosion = { x: number; y: number; age: number; color: string }
type Ufo = { x: number; y: number; vx: number; attacking?: boolean }
type ActiveBlock = { x: number; y: number; shape: number[][]; color: string }

type GameState = {
  game: GameKey
  score: number
  lives: number
  level: number
  waveCooldown: number
  direction: Direction
  pacman: { x: number; y: number }
  ghost: { x: number; y: number; vx: number; vy: number }
  dots: Dot[]
  shipX: number
  bullets: Bullet[]
  enemyBullets: EnemyBullet[]
  explosions: Explosion[]
  ufos: Ufo[]
  grid: string[][]
  block: ActiveBlock
  frame: number
  message: string
}

const GAMES: Array<{ key: GameKey; title: string; description: string }> = [
  { key: "pacman", title: "Pac IA", description: "Come puntos y evita al bug rojo." },
  { key: "blocks", title: "Bloques", description: "Ordená piezas, limpiá filas." },
  { key: "ufos", title: "Ovnis", description: "Dispará antes de que bajen." },
]

const BLOCK_SHAPES = [
  { color: "#22c55e", shape: [[1, 1, 1, 1]] },
  { color: "#38bdf8", shape: [[1, 1], [1, 1]] },
  { color: "#f59e0b", shape: [[0, 1, 0], [1, 1, 1]] },
  { color: "#a855f7", shape: [[1, 0, 0], [1, 1, 1]] },
]

function makeDots() {
  const dots: Dot[] = []
  for (let y = 56; y <= 288; y += 32) {
    for (let x = 32; x <= 288; x += 32) dots.push({ x, y })
  }
  return dots
}

function makeBlock(): ActiveBlock {
  const next = BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)]
  return { x: 4, y: 0, shape: next.shape.map((r) => [...r]), color: next.color }
}

function emptyGrid() {
  return Array.from({ length: 16 }, () => Array.from({ length: 10 }, () => ""))
}

function makeUfos(level: number): Ufo[] {
  const count = Math.min(3 + level, 8)
  const speed = 1 + level * 0.22
  return Array.from({ length: count }, (_, index) => ({
    x: 34 + (index % 4) * 82,
    y: 54 + Math.floor(index / 4) * 36,
    vx: (index % 2 === 0 ? 1 : -1) * speed,
  }))
}

function initialState(game: GameKey): GameState {
  return {
    game,
    score: 0,
    lives: 3,
    level: 1,
    waveCooldown: 0,
    direction: "right",
    pacman: { x: 40, y: 64 },
    ghost: { x: 260, y: 260, vx: 1.4, vy: 1.1 },
    dots: makeDots(),
    shipX: 160,
    bullets: [],
    enemyBullets: [],
    explosions: [],
    ufos: makeUfos(1),
    grid: emptyGrid(),
    block: makeBlock(),
    frame: 0,
    message: "Usá los controles para jugar",
  }
}

function rotate(shape: number[][]) {
  return shape[0].map((_, i) => shape.map((row) => row[i]).reverse())
}

function collides(grid: string[][], block: ActiveBlock, dx = 0, dy = 0, shape = block.shape) {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue
      const nx = block.x + x + dx
      const ny = block.y + y + dy
      if (nx < 0 || nx >= 10 || ny >= 16) return true
      if (ny >= 0 && grid[ny][nx]) return true
    }
  }
  return false
}

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
}

function drawGame(ctx: CanvasRenderingContext2D, state: GameState) {
  ctx.clearRect(0, 0, 320, 360)
  ctx.fillStyle = "#07110b"
  ctx.fillRect(0, 0, 320, 360)

  ctx.strokeStyle = "rgba(34,197,94,.16)"
  for (let i = 0; i < 320; i += 20) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 360); ctx.stroke()
  }
  for (let i = 0; i < 360; i += 20) {
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(320, i); ctx.stroke()
  }

  ctx.fillStyle = "#d7ffe5"
  ctx.font = "bold 14px monospace"
  ctx.fillText(`PTS ${state.score}`, 14, 24)
  ctx.fillText(`NIV ${state.level}`, 124, 24)
  ctx.fillText(`VIDAS ${state.lives}`, 220, 24)

  if (state.game === "pacman") {
    ctx.fillStyle = "rgba(255,255,255,.11)"
    drawRoundRect(ctx, 18, 38, 284, 276, 16)
    for (const dot of state.dots) {
      if (dot.eaten) continue
      ctx.fillStyle = "#c6f6d5"
      ctx.beginPath(); ctx.arc(dot.x, dot.y, 4, 0, Math.PI * 2); ctx.fill()
    }
    ctx.fillStyle = "#facc15"
    ctx.beginPath(); ctx.arc(state.pacman.x, state.pacman.y, 13, 0.25 * Math.PI, 1.75 * Math.PI); ctx.lineTo(state.pacman.x, state.pacman.y); ctx.fill()
    ctx.fillStyle = "#fb7185"
    ctx.beginPath(); ctx.arc(state.ghost.x, state.ghost.y, 12, Math.PI, 0); ctx.lineTo(state.ghost.x + 12, state.ghost.y + 14); ctx.lineTo(state.ghost.x - 12, state.ghost.y + 14); ctx.closePath(); ctx.fill()
  }

  if (state.game === "ufos") {
    ctx.fillStyle = "#22c55e"
    ctx.beginPath(); ctx.moveTo(state.shipX, 304); ctx.lineTo(state.shipX - 18, 330); ctx.lineTo(state.shipX + 18, 330); ctx.closePath(); ctx.fill()
    ctx.fillStyle = "#bbf7d0"
    ctx.fillRect(state.shipX - 8, 326, 16, 4)

    if (state.ufos.length === 0) {
      ctx.fillStyle = "rgba(215,255,229,.9)"
      ctx.font = "bold 18px monospace"
      ctx.fillText(`NIVEL ${state.level} SUPERADO`, 56, 166)
      ctx.font = "12px monospace"
      ctx.fillText("Preparando próxima oleada...", 62, 190)
    }

    for (const bullet of state.bullets) {
      ctx.fillStyle = "#f8fafc"
      ctx.fillRect(bullet.x - 2, bullet.y, 4, 12)
    }
    for (const bullet of state.enemyBullets) {
      ctx.fillStyle = "#fb7185"
      ctx.beginPath(); ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = "rgba(251,113,133,.35)"
      ctx.fillRect(bullet.x - 1, bullet.y - 12, 2, 12)
    }
    for (const ufo of state.ufos) {
      ctx.fillStyle = ufo.attacking ? "#fca5a5" : "#a7f3d0"
      ctx.beginPath(); ctx.ellipse(ufo.x, ufo.y, 24, 10, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = ufo.attacking ? "#f97316" : "#38bdf8"
      ctx.beginPath(); ctx.arc(ufo.x, ufo.y - 7, 10, Math.PI, 0); ctx.fill()
      if (ufo.attacking) {
        ctx.strokeStyle = "rgba(251,113,133,.6)"
        ctx.beginPath(); ctx.moveTo(ufo.x, ufo.y + 12); ctx.lineTo(ufo.x, ufo.y + 28); ctx.stroke()
      }
    }
    for (const explosion of state.explosions) {
      const radius = 6 + explosion.age * 2.4
      ctx.strokeStyle = explosion.color
      ctx.lineWidth = 3
      ctx.beginPath(); ctx.arc(explosion.x, explosion.y, radius, 0, Math.PI * 2); ctx.stroke()
      ctx.fillStyle = "rgba(250,204,21,.9)"
      ctx.beginPath(); ctx.arc(explosion.x, explosion.y, Math.max(2, 9 - explosion.age), 0, Math.PI * 2); ctx.fill()
    }
    ctx.lineWidth = 1
  }

  if (state.game === "blocks") {
    ctx.fillStyle = "rgba(255,255,255,.07)"
    ctx.fillRect(60, 36, 200, 320)
    const cell = 20
    state.grid.forEach((row, y) => row.forEach((color, x) => {
      if (!color) return
      ctx.fillStyle = color
      ctx.fillRect(60 + x * cell + 1, 36 + y * cell + 1, cell - 2, cell - 2)
    }))
    state.block.shape.forEach((row, y) => row.forEach((v, x) => {
      if (!v) return
      ctx.fillStyle = state.block.color
      ctx.fillRect(60 + (state.block.x + x) * cell + 1, 36 + (state.block.y + y) * cell + 1, cell - 2, cell - 2)
    }))
  }

  ctx.fillStyle = "rgba(255,255,255,.78)"
  ctx.font = "12px monospace"
  ctx.fillText(state.message, 14, 348)
}

function step(state: GameState): GameState {
  const next = structuredClone(state) as GameState
  next.frame += 1

  if (next.game === "pacman") {
    const speed = 2.2
    if (next.direction === "left") next.pacman.x -= speed
    if (next.direction === "right") next.pacman.x += speed
    if (next.direction === "up") next.pacman.y -= speed
    if (next.direction === "down") next.pacman.y += speed
    next.pacman.x = Math.max(30, Math.min(290, next.pacman.x))
    next.pacman.y = Math.max(50, Math.min(300, next.pacman.y))

    next.ghost.x += next.ghost.vx
    next.ghost.y += next.ghost.vy
    if (next.ghost.x < 35 || next.ghost.x > 285) next.ghost.vx *= -1
    if (next.ghost.y < 52 || next.ghost.y > 300) next.ghost.vy *= -1

    for (const dot of next.dots) {
      if (!dot.eaten && Math.hypot(dot.x - next.pacman.x, dot.y - next.pacman.y) < 16) {
        dot.eaten = true
        next.score += 10
      }
    }
    if (Math.hypot(next.ghost.x - next.pacman.x, next.ghost.y - next.pacman.y) < 22) {
      next.lives -= 1
      next.pacman = { x: 40, y: 64 }
      next.message = next.lives <= 0 ? "Reiniciá: el bug ganó" : "Cuidado: bug detectado"
    }
    if (next.dots.every((d) => d.eaten)) next.message = "Limpiaste el mapa"
  }

  if (next.game === "ufos") {
    next.bullets = next.bullets.map((b) => ({ ...b, y: b.y - 5 })).filter((b) => b.y > 0)
    next.enemyBullets = next.enemyBullets.map((b) => ({ ...b, y: b.y + b.speed })).filter((b) => b.y < 350)
    next.explosions = next.explosions.map((e) => ({ ...e, age: e.age + 1 })).filter((e) => e.age < 14)

    if (next.ufos.length === 0) {
      if (next.waveCooldown === 0) {
        next.waveCooldown = 90
        next.enemyBullets = []
        next.message = `Nivel ${next.level} superado`
      } else {
        next.waveCooldown -= 1
        if (next.waveCooldown <= 0) {
          next.level += 1
          next.ufos = makeUfos(next.level)
          next.bullets = []
          next.enemyBullets = []
          next.message = `Nivel ${next.level}: nueva oleada`
        }
      }
      return next
    }

    for (const ufo of next.ufos) {
      ufo.x += ufo.vx
      ufo.attacking = false
      if (ufo.x < 24 || ufo.x > 296) {
        ufo.vx *= -1
        ufo.y += 14
      }
      const nearShip = Math.abs(ufo.x - next.shipX) < 46
      const attackChance = 0.008 + next.level * 0.003
      if ((nearShip || Math.random() < attackChance) && next.frame % Math.max(10, 22 - next.level) === 0) {
        ufo.attacking = true
        next.enemyBullets.push({ x: ufo.x, y: ufo.y + 18, speed: 2.8 + next.level * 0.35 })
        next.message = "¡Los ovnis están atacando!"
      }
    }

    const destroyed = new Set<Ufo>()
    for (const bullet of next.bullets) {
      for (const ufo of next.ufos) {
        if (destroyed.has(ufo)) continue
        if (Math.abs(bullet.x - ufo.x) < 24 && Math.abs(bullet.y - ufo.y) < 16) {
          destroyed.add(ufo)
          next.score += 25 + next.level * 5
          next.explosions.push({ x: ufo.x, y: ufo.y, age: 0, color: "rgba(250,204,21,.95)" })
          bullet.y = -99
          next.message = "¡Ovni destruido!"
        }
      }
    }
    if (destroyed.size > 0) {
      next.ufos = next.ufos.filter((ufo) => !destroyed.has(ufo))
      if (next.ufos.length === 0) {
        next.score += next.level * 50
        next.waveCooldown = 90
        next.enemyBullets = []
        next.message = `Nivel ${next.level} superado`
      }
    }

    for (const bullet of next.enemyBullets) {
      if (Math.abs(bullet.x - next.shipX) < 18 && bullet.y > 300 && bullet.y < 334) {
        bullet.y = 999
        next.lives -= 1
        next.explosions.push({ x: next.shipX, y: 316, age: 0, color: "rgba(251,113,133,.95)" })
        next.message = next.lives <= 0 ? "Tu nave cayó. Reiniciá." : "Te impactaron: esquivá y respondé"
      }
    }
    next.enemyBullets = next.enemyBullets.filter((b) => b.y < 350)

    if (next.ufos.some((u) => u.y > 275)) {
      next.lives -= 1
      next.explosions.push(...next.ufos.map((u) => ({ x: u.x, y: u.y, age: 0, color: "rgba(251,113,133,.9)" })))
      next.ufos = makeUfos(next.level)
      next.enemyBullets = []
      next.message = next.lives <= 0 ? "La invasión ganó" : "Los ovnis bajaron demasiado"
    }
  }

  if (next.game === "blocks" && next.frame % 22 === 0) {
    if (!collides(next.grid, next.block, 0, 1)) {
      next.block.y += 1
    } else {
      next.block.shape.forEach((row, y) => row.forEach((v, x) => {
        if (!v) return
        const gy = next.block.y + y
        const gx = next.block.x + x
        if (gy >= 0 && gy < 16) next.grid[gy][gx] = next.block.color
      }))
      const before = next.grid.length
      next.grid = next.grid.filter((row) => row.some((cell) => !cell))
      const cleared = before - next.grid.length
      while (next.grid.length < 16) next.grid.unshift(Array.from({ length: 10 }, () => ""))
      if (cleared) next.score += cleared * 100
      next.block = makeBlock()
      if (collides(next.grid, next.block)) {
        next.lives -= 1
        next.grid = emptyGrid()
        next.message = next.lives <= 0 ? "Sin espacio: reiniciá" : "Tablero limpio"
      }
    }
  }

  return next
}

export default function AIDemo() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [game, setGame] = useState<GameKey>("pacman")
  const [state, setState] = useState<GameState>(() => initialState("pacman"))

  useEffect(() => {
    setState(initialState(game))
  }, [game])

  useEffect(() => {
    let animation = 0
    const tick = () => {
      setState((current) => step(current))
      animation = requestAnimationFrame(tick)
    }
    animation = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animation)
  }, [])

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d")
    if (ctx) drawGame(ctx, state)
  }, [state])

  const control = useCallback((action: Direction | "fire" | "rotate" | "down") => {
    setState((current) => {
      const next = structuredClone(current) as GameState
      if (["up", "down", "left", "right"].includes(action)) {
        next.direction = action as Direction
      }
      if (next.game === "ufos") {
        if (action === "left") next.shipX = Math.max(24, next.shipX - 24)
        if (action === "right") next.shipX = Math.min(296, next.shipX + 24)
        if (action === "fire") next.bullets.push({ x: next.shipX, y: 292 })
      }
      if (next.game === "blocks") {
        if (action === "left" && !collides(next.grid, next.block, -1, 0)) next.block.x -= 1
        if (action === "right" && !collides(next.grid, next.block, 1, 0)) next.block.x += 1
        if (action === "down" && !collides(next.grid, next.block, 0, 1)) next.block.y += 1
        if (action === "rotate") {
          const rotated = rotate(next.block.shape)
          if (!collides(next.grid, next.block, 0, 0, rotated)) next.block.shape = rotated
        }
      }
      return next
    })
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const gameKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Spacebar"]
      if (!gameKeys.includes(event.key)) return

      event.preventDefault()

      if (event.key === "ArrowLeft") control("left")
      if (event.key === "ArrowRight") control("right")
      if (event.key === "ArrowUp") control(game === "blocks" ? "rotate" : "up")
      if (event.key === "ArrowDown") control("down")
      if (event.key === " " || event.key === "Spacebar") control("fire")
    }
    window.addEventListener("keydown", onKey, { passive: false })
    return () => window.removeEventListener("keydown", onKey)
  }, [control, game])

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] bg-[size:26px_26px] opacity-70" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <Button
          onClick={() => router.push("/")}
          className="mb-4 w-fit border border-white/20 bg-white/10 text-white hover:bg-white hover:text-black"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Regresar
        </Button>

        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/40 bg-emerald-400/10 shadow-[0_0_30px_rgba(16,185,129,.22)]">
            <Gamepad2 className="h-6 w-6 text-emerald-200" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">IA Arcade</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-300 sm:text-base">
            Un demo liviano para mobile: elegí un juego retro y probá cómo una experiencia simple puede volverse interactiva.
          </p>
        </motion.header>

        <main className="mt-5 grid flex-1 gap-4 lg:grid-cols-[280px_1fr] lg:items-center">
          <section className="grid grid-cols-3 gap-2 lg:grid-cols-1">
            {GAMES.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setGame(item.key)}
                className={`rounded-2xl border p-3 text-left transition-all ${
                  game === item.key
                    ? "border-emerald-300 bg-emerald-300 text-black shadow-[0_0_25px_rgba(16,185,129,.35)]"
                    : "border-white/15 bg-white/5 text-white hover:border-emerald-200/70"
                }`}
              >
                <p className="text-sm font-bold sm:text-base">{item.title}</p>
                <p className="mt-1 hidden text-xs opacity-75 sm:block">{item.description}</p>
              </button>
            ))}
          </section>

          <section className="rounded-[2rem] border border-white/15 bg-white/[.06] p-3 shadow-2xl backdrop-blur sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-2 px-1">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">{GAMES.find((item) => item.key === game)?.title}</p>
                <p className="text-sm text-gray-300">Puntos: {state.score} · Vidas: {state.lives}</p>
              </div>
              <Button
                type="button"
                onClick={() => setState(initialState(game))}
                className="h-9 rounded-full bg-white text-black hover:bg-emerald-200"
              >
                Reiniciar
              </Button>
            </div>

            <canvas
              ref={canvasRef}
              width={320}
              height={360}
              className="mx-auto aspect-[8/9] w-full max-w-[360px] touch-none rounded-3xl border border-emerald-300/20 bg-[#07110b] shadow-[0_0_40px_rgba(16,185,129,.18)]"
              aria-label="Juego retro interactivo"
            />

            <Controls game={game} onControl={control} />
          </section>
        </main>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.04] p-4 text-center text-sm text-gray-300">
          <Sparkles className="mr-2 inline h-4 w-4 text-emerald-200" />
          Esto corre en el navegador, sin assets pesados y pensado para tocar con el dedo.
        </div>
      </div>
    </div>
  )
}

function Controls({ game, onControl }: { game: GameKey; onControl: (action: Direction | "fire" | "rotate" | "down") => void }) {
  return (
    <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:hidden">
      <div className="grid grid-cols-3 gap-2">
        <span />
        <ControlButton label="↑" onClick={() => onControl(game === "blocks" ? "rotate" : "up")} />
        <span />
        <ControlButton label="←" onClick={() => onControl("left")} />
        <ControlButton label="↓" onClick={() => onControl("down")} />
        <ControlButton label="→" onClick={() => onControl("right")} />
      </div>
      <div className="h-12 w-px bg-white/10" />
      {game === "ufos" ? (
        <ControlButton label={<Zap className="h-5 w-5" />} onClick={() => onControl("fire")} large />
      ) : game === "blocks" ? (
        <ControlButton label={<RotateCw className="h-5 w-5" />} onClick={() => onControl("rotate")} large />
      ) : (
        <p className="text-xs text-gray-400">Comé todos los puntos</p>
      )}
    </div>
  )
}

function ControlButton({ label, onClick, large = false }: { label: ReactNode; onClick: () => void; large?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${large ? "h-20 w-20" : "h-11 w-11"} touch-none rounded-2xl border border-white/15 bg-white/10 text-lg font-bold text-white active:scale-95 active:bg-emerald-300 active:text-black`}
    >
      <span className="flex items-center justify-center">{label}</span>
    </button>
  )
}
