"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Home, ShoppingBag } from "lucide-react";

// ─── Game constants ────────────────────────────────────────────────────────────

const W = 380;
const H = 520;
const LANE_X = [60, 130, 200, 270, 340];
const NUM_LANES = 5;
const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];
const COLORS = {
  road: "#111", lane: "#262626", white: "#fff",
  silver: "#9CA3AF", red: "#E53935", blue: "#2196F3",
  gold: "#C9AF89", smoke: "#4B5563",
};
const ENEMY_COLORS = ["#ff4444", "#ff8800", "#ffcc00", "#44ff44", "#cc44ff"];

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Enemy {
  lane: number; x: number; y: number;
  w: number; h: number; type: string; color: string; spd: number;
}
interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; color: string; r: number;
}
interface GameState {
  phase: "start" | "playing" | "over";
  score: number; best: number; speed: number;
  nitro: number; nitroCharge: number; roadY: number;
  player: { lane: number; x: number; targetX: number; y: number; w: number; h: number; tilt: number };
  enemies: Enemy[]; particles: Particle[];
  spawnTimer: number; spawnInterval: number; frame: number;
  keys: Record<string, boolean>; touchDir: "left" | "right" | null;
}

function initState(best: number): GameState {
  return {
    phase: "start", score: 0, best, speed: 3,
    nitro: 0, nitroCharge: 100, roadY: 0,
    player: { lane: 2, x: LANE_X[2], targetX: LANE_X[2], y: H - 110, w: 32, h: 56, tilt: 0 },
    enemies: [], particles: [],
    spawnTimer: 0, spawnInterval: 90, frame: 0,
    keys: {}, touchDir: null,
  };
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function NotFoundContent() {
  const t = useTranslations("notFound");
  const [gameOpen, setGameOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const rafRef = useRef<number>(0);
  const scoreElRef = useRef<HTMLSpanElement>(null);
  const bestElRef = useRef<HTMLSpanElement>(null);
  const konamiIdxRef = useRef(0);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openGame = useCallback(() => {
    const best = parseInt(localStorage.getItem("simrun404best") ?? "0");
    stateRef.current = initState(best);
    setGameOpen(true);
  }, []);

  const closeGame = useCallback(() => {
    setGameOpen(false);
    cancelAnimationFrame(rafRef.current);
  }, []);

  // Konami code listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === KONAMI[konamiIdxRef.current]) {
        konamiIdxRef.current++;
        if (konamiIdxRef.current === KONAMI.length) {
          konamiIdxRef.current = 0;
          openGame();
        }
      } else {
        konamiIdxRef.current = e.key === KONAMI[0] ? 1 : 0;
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [openGame]);

  // Triple click on 404
  const handleCode404Click = useCallback(() => {
    clickCountRef.current++;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      openGame();
    } else {
      clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0; }, 600);
    }
  }, [openGame]);

  // Game loop
  useEffect(() => {
    if (!gameOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxMaybe = canvas.getContext("2d");
    if (!ctxMaybe) return;
    const ctx: CanvasRenderingContext2D = ctxMaybe;

    // ── Controls ─────────────────────────────────────────────────────────────

    const onKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (!s) return;
      s.keys[e.key] = true;
      if (e.key === " ") e.preventDefault();
      if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && s.phase === "playing") e.preventDefault();
      if (e.key === " " && s.phase === "start") s.phase = "playing";
      if (e.key === " " && s.phase === "over") {
        stateRef.current = initState(s.best);
        stateRef.current.phase = "playing";
      }
      if (e.key === "Escape") closeGame();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (stateRef.current) stateRef.current.keys[e.key] = false;
    };

    let touchStartX: number | null = null;
    const onTouchStart = (e: TouchEvent) => { touchStartX = e.touches[0].clientX; };
    const onTouchEnd = (e: TouchEvent) => {
      const s = stateRef.current;
      if (!s) return;
      if (s.phase !== "playing") {
        if (s.phase === "start") { s.phase = "playing"; return; }
        stateRef.current = initState(s.best);
        stateRef.current.phase = "playing";
        return;
      }
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 20) s.touchDir = dx < 0 ? "left" : "right";
    };
    const onCanvasClick = () => {
      const s = stateRef.current;
      if (!s) return;
      if (s.phase === "start") s.phase = "playing";
      else if (s.phase === "over") {
        stateRef.current = initState(s.best);
        stateRef.current.phase = "playing";
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });
    canvas.addEventListener("click", onCanvasClick);

    // ── Drawing helpers ───────────────────────────────────────────────────────

    function rr(x: number, y: number, w: number, h: number, r: number) {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
    }

    function drawCar(x: number, y: number, w: number, h: number, color: string, isPlayer: boolean, tilt: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(tilt);
      ctx.fillStyle = color;
      rr(-w / 2, -h / 2, w, h, 5); ctx.fill();
      ctx.fillStyle = isPlayer ? "rgba(33,150,243,0.6)" : "rgba(0,0,0,0.5)";
      rr(-w / 2 + 4, -h / 2 + 6, w - 8, h * 0.28, 3); ctx.fill();
      ctx.fillStyle = "#111";
      ([ [-w/2-3, -h/2+6], [w/2-4, -h/2+6], [-w/2-3, h/2-14], [w/2-4, h/2-14] ] as [number,number][])
        .forEach(([wx, wy]) => { rr(wx, wy, 7, 10, 2); ctx.fill(); });
      ctx.fillStyle = isPlayer ? COLORS.red : "rgba(255,255,100,0.8)";
      ([ [-w/2+3, isPlayer ? h/2-8 : -h/2+2], [w/2-8, isPlayer ? h/2-8 : -h/2+2] ] as [number,number][])
        .forEach(([lx, ly]) => { rr(lx, ly, 5, 4, 1); ctx.fill(); });
      ctx.restore();
    }

    function drawStartScreen() {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = "center";
      ctx.fillStyle = COLORS.red;
      ctx.font = "bold 42px Inter, sans-serif";
      ctx.fillText("SimRun", W / 2, H / 2 - 70);
      ctx.fillStyle = COLORS.white;
      ctx.font = "bold 18px Inter, sans-serif";
      ctx.fillText("404", W / 2, H / 2 - 40);
      ctx.fillStyle = COLORS.silver;
      ctx.font = "13px Inter, sans-serif";
      ctx.fillText("Esquiva a los rivales", W / 2, H / 2);
      ctx.fillText("y no salgas de la pista", W / 2, H / 2 + 20);
      const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 300);
      ctx.globalAlpha = pulse;
      ctx.fillStyle = COLORS.red;
      ctx.font = "bold 14px Inter, sans-serif";
      ctx.fillText("PULSA ESPACIO / TOCA PARA INICIAR", W / 2, H / 2 + 70);
      ctx.globalAlpha = 1;
      ctx.fillStyle = COLORS.smoke;
      ctx.font = "11px Inter, sans-serif";
      ctx.fillText("← → para mover · ESPACIO para nitro", W / 2, H / 2 + 100);
    }

    function drawGameOver() {
      const s = stateRef.current!;
      ctx.fillStyle = "rgba(0,0,0,0.78)";
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = "center";
      ctx.fillStyle = COLORS.red;
      ctx.font = "bold 36px Inter, sans-serif";
      ctx.fillText("CRASH!", W / 2, H / 2 - 60);
      ctx.fillStyle = COLORS.white;
      ctx.font = "bold 16px Inter, sans-serif";
      ctx.fillText(`Puntuación: ${s.score}`, W / 2, H / 2 - 20);
      ctx.fillStyle = COLORS.gold;
      ctx.font = "14px Inter, sans-serif";
      ctx.fillText(`Récord: ${s.best}`, W / 2, H / 2 + 8);
      const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 280);
      ctx.globalAlpha = pulse;
      ctx.fillStyle = COLORS.red;
      ctx.font = "bold 13px Inter, sans-serif";
      ctx.fillText("ESPACIO / TOCA PARA REINICIAR", W / 2, H / 2 + 55);
      ctx.globalAlpha = 1;
    }

    // ── Update ────────────────────────────────────────────────────────────────

    function update() {
      const s = stateRef.current!;
      if (s.phase !== "playing") return;
      s.frame++;

      if (s.frame % 6 === 0) {
        s.score++;
        if (scoreElRef.current) scoreElRef.current.textContent = String(s.score);
        if (s.score > s.best) {
          s.best = s.score;
          localStorage.setItem("simrun404best", String(s.best));
          if (bestElRef.current) bestElRef.current.textContent = String(s.best);
        }
      }
      s.speed = 3 + Math.floor(s.score / 30) * 0.5;

      const isNitro = (s.keys[" "] || s.keys["Space"]) && s.nitroCharge > 0;
      if (isNitro) { s.nitro = 6; s.nitroCharge = Math.max(0, s.nitroCharge - 1.2); }
      else { s.nitroCharge = Math.min(100, s.nitroCharge + 0.3); }
      const spd = s.speed + (s.nitro > 0 ? 4 : 0);
      if (s.nitro > 0) s.nitro--;

      s.roadY = (s.roadY + spd) % 70;

      const p = s.player;
      if ((s.keys["ArrowLeft"] || s.touchDir === "left") && p.lane > 0) {
        p.lane--; p.targetX = LANE_X[p.lane]; s.touchDir = null; s.keys["ArrowLeft"] = false;
      }
      if ((s.keys["ArrowRight"] || s.touchDir === "right") && p.lane < NUM_LANES - 1) {
        p.lane++; p.targetX = LANE_X[p.lane]; s.touchDir = null; s.keys["ArrowRight"] = false;
      }
      p.x += (p.targetX - p.x) * 0.18;
      p.tilt += (p.targetX - p.x) * 0.006;
      p.tilt *= 0.85;

      s.spawnTimer++;
      s.spawnInterval = Math.max(35, 90 - Math.floor(s.score / 20) * 5);
      if (s.spawnTimer >= s.spawnInterval) {
        s.spawnTimer = 0;
        const lane = Math.floor(Math.random() * NUM_LANES);
        const type = Math.random() < 0.4 ? "slow" : "rival";
        s.enemies.push({
          lane, x: LANE_X[lane], y: -70, w: 28, h: 52, type,
          color: type === "slow" ? COLORS.blue : ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)],
          spd: type === "slow" ? spd * 0.3 : spd * 0.7,
        });
      }

      s.enemies = s.enemies.filter(e => {
        e.y += spd - e.spd;
        if (e.y > H + 80) return false;
        const dx = Math.abs(p.x - e.x);
        const dy = Math.abs((p.y + p.h / 2) - (e.y + e.h / 2));
        if (dx < (p.w + e.w) * 0.42 && dy < (p.h + e.h) * 0.38) {
          for (let i = 0; i < 24; i++) {
            const angle = (Math.PI * 2 * i) / 24;
            const v = 2 + Math.random() * 4;
            s.particles.push({
              x: p.x, y: p.y, vx: Math.cos(angle) * v, vy: Math.sin(angle) * v,
              life: 1, color: [COLORS.red, COLORS.gold, COLORS.white][i % 3], r: 2 + Math.random() * 3,
            });
          }
          s.phase = "over";
          return false;
        }
        return true;
      });

      s.particles = s.particles.filter(pt => {
        pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.1; pt.life -= 0.035;
        return pt.life > 0;
      });
    }

    // ── Draw ──────────────────────────────────────────────────────────────────

    function draw() {
      const s = stateRef.current!;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = COLORS.road;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = COLORS.lane;
      ctx.lineWidth = 1;
      for (let i = 1; i < NUM_LANES; i++) {
        const x = 45 + i * 60 - 30;
        ctx.setLineDash([30, 40]);
        ctx.lineDashOffset = -s.roadY;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.strokeStyle = COLORS.red;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(28, 0); ctx.lineTo(28, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W - 28, 0); ctx.lineTo(W - 28, H); ctx.stroke();

      if (s.phase === "start") { drawStartScreen(); return; }

      s.enemies.forEach(e => drawCar(e.x, e.y, e.w, e.h, e.color, false, 0));

      const p = s.player;
      if (s.nitro > 0) {
        ctx.save();
        ctx.translate(p.x, p.y + p.h * 0.55);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 20, 20);
        g.addColorStop(0, "rgba(255,200,50,0.9)");
        g.addColorStop(0.5, "rgba(229,57,53,0.6)");
        g.addColorStop(1, "rgba(229,57,53,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.ellipse(0, 10, 8, 22, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      drawCar(p.x, p.y, p.w, p.h, COLORS.white, true, p.tilt);

      s.particles.forEach(pt => {
        ctx.save();
        ctx.globalAlpha = pt.life;
        ctx.fillStyle = pt.color;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });

      if (s.phase === "over") drawGameOver();

      // Nitro bar HUD
      const barX = W / 2 - 50, barY = H - 18;
      ctx.fillStyle = COLORS.lane;
      rr(barX, barY, 100, 6, 3); ctx.fill();
      const barGrad = ctx.createLinearGradient(barX, 0, barX + 100, 0);
      barGrad.addColorStop(0, "#2196F3");
      barGrad.addColorStop(1, "#E53935");
      ctx.fillStyle = barGrad;
      rr(barX, barY, 100 * (s.nitroCharge / 100), 6, 3); ctx.fill();
      ctx.fillStyle = COLORS.smoke;
      ctx.font = "9px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("NITRO", W / 2, barY - 3);
    }

    // ── Loop ──────────────────────────────────────────────────────────────────

    function loop() {
      rafRef.current = requestAnimationFrame(loop);
      update();
      draw();
    }

    if (scoreElRef.current) scoreElRef.current.textContent = "0";
    if (bestElRef.current) bestElRef.current.textContent = String(stateRef.current!.best);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("click", onCanvasClick);
    };
  }, [gameOpen, closeGame]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <main className="relative flex min-h-[calc(100vh-72px)] flex-col items-center justify-center overflow-hidden px-8 py-16">

        {/* Background grid */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(229,57,53,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(229,57,53,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          }}
        />

        {/* Red radial glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2"
          style={{ background: "radial-gradient(circle, rgba(229,57,53,0.08) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 max-w-[680px] text-center">

          {/* Big 404 — triple click unlocks the game */}
          <div
            className="relative mb-8 inline-block cursor-pointer select-none"
            onClick={handleCode404Click}
            title="¿Buscas algo más?"
            aria-hidden="true"
          >
            <div
              className="text-[clamp(120px,20vw,200px)] font-black leading-none tracking-[-8px]"
              style={{
                background: "linear-gradient(135deg, #E53935 0%, #FF6B6B 40%, #C62828 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 40px rgba(229,57,53,0.5))",
              }}
            >
              404
            </div>
            {/* Spinning gear overlay on the zero */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span
                className="block text-[clamp(60px,10vw,96px)] text-racing-red/15"
                style={{ animation: "spin-slow 12s linear infinite" }}
              >
                ⚙
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-4 text-[clamp(24px,4vw,36px)] font-bold leading-tight text-pure-white">
            {t("title")}<br />
            <span className="text-racing-red">{t("titleHighlight")}</span>
          </h1>

          {/* Description */}
          <p className="mx-auto mb-10 max-w-[480px] text-base text-silver">
            {t("description")}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-racing-red px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(229,57,53,0.4)] transition-all hover:-translate-y-0.5 hover:bg-[#C62828] hover:shadow-[0_0_30px_rgba(229,57,53,0.6)]"
            >
              <Home className="size-4" />
              {t("backHome")}
            </Link>
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 rounded-lg border border-graphite bg-transparent px-7 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-electric-blue hover:text-electric-blue hover:shadow-[0_0_20px_rgba(33,150,243,0.3)]"
            >
              <ShoppingBag className="size-4" />
              {t("viewProducts")}
            </Link>
          </div>
        </div>

        {/* Skid marks */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[120px] overflow-hidden opacity-40" aria-hidden="true">
          {(["left-[15%] -rotate-[4deg]", "left-[calc(15%+26px)] -rotate-[4deg]", "right-[15%] rotate-[4deg]", "right-[calc(15%+26px)] rotate-[4deg]"] as const).map((cls, i) => (
            <div
              key={i}
              className={`absolute bottom-0 h-full w-[18px] rounded-t-sm ${cls}`}
              style={{ background: "linear-gradient(to top, rgba(229,57,53,0.25), transparent)" }}
            />
          ))}
        </div>
      </main>

      {/* Easter egg hint — Konami code clue */}
      <div
        className="fixed bottom-6 right-6 cursor-default select-none text-[11px] tracking-widest text-smoke transition-colors hover:text-silver"
        aria-hidden="true"
      >
        ↑↑↓↓←→←→BA
      </div>

      {/* Game overlay */}
      {gameOpen && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-black/[.92] backdrop-blur-md"
          role="dialog"
          aria-label="Mini juego SimRacing"
        >
          {/* Header */}
          <div className="flex w-full max-w-[420px] items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-widest text-racing-red">
              🏎 SimRun 404
            </span>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-[1.5px] text-smoke">Vuelta</div>
                <div className="text-lg font-bold leading-none text-pure-white">
                  <span ref={scoreElRef}>0</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-[1.5px] text-smoke">Récord</div>
                <div className="text-lg font-bold leading-none text-pure-white">
                  <span ref={bestElRef}>0</span>
                </div>
              </div>
            </div>
            <button
              onClick={closeGame}
              className="ml-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-graphite text-silver transition-all hover:border-racing-red hover:text-racing-red"
              aria-label="Cerrar juego"
            >
              ✕
            </button>
          </div>

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="block rounded-xl border border-graphite shadow-[0_0_40px_rgba(229,57,53,0.15)]"
          />

          {/* Controls hint */}
          <div className="text-center text-[11px] tracking-widest text-smoke">
            <span className="text-silver">← →</span> mover ·{" "}
            <span className="text-silver">ESPACIO</span> nitro ·{" "}
            <span className="text-silver">ESC</span> salir
          </div>
        </div>
      )}
    </>
  );
}
