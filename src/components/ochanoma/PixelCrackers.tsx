"use client";

import { useEffect, useRef } from "react";

import { drawSprite, residentColors, type PixelRows } from "./sprites";

// 抽選結果が出た瞬間に鳴る、ドット絵のクラッカー。
// パネルの左右下の角から、四角いドットの紙吹雪が放物線を描いて舞う。
// 紙吹雪は 4px グリッドに吸着させ、ドット絵らしくカクカク動かす。
const PX = 4; // 紙吹雪 1 ドットの大きさ
const DURATION_MS = 1800;
const COUNT_PER_SIDE = 46;
const GRAVITY = 900;

// クラッカー本体(12×12)。筒(C/c)と口(M)、ひも(S)
const cracker: PixelRows = [
  "..........MM",
  ".........MMM",
  "........MMM.",
  ".......CCC..",
  "......CcCC..",
  ".....CCcC...",
  "....CCcC....",
  "...CCcC.....",
  "..CCcC......",
  ".CCCC.......",
  "SCCC........",
  "S...........",
];
const crackerColors = {
  C: "#f2bE2e",
  c: "#ffd34d",
  M: "#232936",
  S: "#a97d53",
};

const palette = [...residentColors, "#ffd34d", "#0a7f5f", "#232936"];

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  spin: number; // 0..1 でチラつき(裏返り)の位相
  born: number;
};

export default function PixelCrackers({ burstKey }: { burstKey: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const crackerLeft = useRef<HTMLCanvasElement>(null);
  const crackerRight = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (burstKey === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (typeof window.matchMedia !== "function") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    // クラッカー本体を描いて、ぽんっと傾ける
    const popCrackers = [crackerLeft.current, crackerRight.current];
    popCrackers.forEach((el) => {
      const c = el?.getContext("2d");
      if (!el || !c) return;
      drawSprite(c, cracker, crackerColors);
      el.classList.remove("is-popping");
      void el.offsetWidth; // アニメーション再始動
      el.classList.add("is-popping");
    });

    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);
    const W = canvas.width;
    const H = canvas.height;

    const start = performance.now();
    const pieces: Piece[] = [];
    const spawn = (x0: number, dir: 1 | -1) => {
      for (let i = 0; i < COUNT_PER_SIDE; i++) {
        // 斜め上 35°〜75° に向けて飛ばす
        const ang = (Math.PI / 180) * (35 + Math.random() * 40);
        const speed = 420 + Math.random() * 380;
        pieces.push({
          x: x0,
          y: H - 28,
          vx: Math.cos(ang) * speed * dir,
          vy: -Math.sin(ang) * speed,
          size: PX * (Math.random() < 0.3 ? 2 : 1),
          color: palette[Math.floor(Math.random() * palette.length)],
          spin: Math.random(),
          born: start + Math.random() * 120,
        });
      }
    };
    spawn(36, 1);
    spawn(W - 36, -1);

    let raf = 0;
    let last = start;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const elapsed = now - start;
      ctx.clearRect(0, 0, W, H);
      const fade = elapsed > DURATION_MS - 400 ? Math.max(0, (DURATION_MS - elapsed) / 400) : 1;
      ctx.globalAlpha = fade;
      let alive = 0;
      for (const p of pieces) {
        if (now < p.born) {
          alive++;
          continue;
        }
        p.vy += GRAVITY * dt;
        p.vx *= 0.995;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.spin += dt * 6;
        if (p.y > H + PX * 2) continue;
        alive++;
        // ドット絵らしく、グリッドに吸着させて描く。裏返りはドットの幅を変えて表現
        const gx = Math.round(p.x / PX) * PX;
        const gy = Math.round(p.y / PX) * PX;
        const flip = Math.abs(Math.cos(p.spin));
        const w = Math.max(PX, Math.round((p.size * flip) / PX) * PX);
        ctx.fillStyle = p.color;
        ctx.fillRect(gx, gy, w, p.size);
      }
      if (alive > 0 && elapsed < DURATION_MS) {
        raf = requestAnimationFrame(loop);
      } else {
        ctx.clearRect(0, 0, W, H);
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, W, H);
    };
  }, [burstKey]);

  const show = burstKey > 0;
  return (
    <div aria-hidden="true" className={`pixel-crackers${show ? " is-active" : ""}`}>
      <canvas ref={crackerLeft} width={12} height={12} className="cracker cracker-left" />
      <canvas ref={crackerRight} width={12} height={12} className="cracker cracker-right" />
      <canvas ref={canvasRef} className="confetti" />
    </div>
  );
}
