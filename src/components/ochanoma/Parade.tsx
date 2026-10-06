"use client";

import { useEffect, useRef } from "react";

import {
  carry1,
  carry2,
  colorMapFor,
  drawSprite,
  idle,
  kotatsu,
  kotatsuAwake,
  kotatsuFrames,
  residentColors,
  sleep,
  walk1,
  walk2,
  type PixelRows,
} from "./sprites";

// お茶の間の住民たち(chashitsu-lp から移植)。パネルの下辺をゆっくり行き来する。
// - カーソルが近づくと立ち止まって注目、こたつの子は目を覚ます
// - 掴んでドラッグでき、離すと重力で落ちて日常に戻る
// - data-perch の付いた要素(抽選ボタンなど)は足場になり、上に乗れる
const SCALE = 2.5;
const NEAR_PX = 70;
const GRAVITY = 1600;
const NAP_MS = 60_000;
const WARMUP_MS = 6_000;
const isNight = () => {
  if (new URLSearchParams(window.location.search).has("night")) return true;
  const h = new Date().getHours();
  return h >= 22 || h < 6;
};

type Actor = {
  color: string;
  kind: "walk" | "carry" | "sit";
  x: number;
  min: number;
  max: number;
  speed: number;
  dir: 1 | -1;
  near?: boolean;
  face?: 1 | -1;
  lift: number;
  ground: number;
  vy: number;
  grabbed: boolean;
  asleep?: boolean;
};

export default function OchanomaParade({ single = false }: { single?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    // canvas / matchMedia / IntersectionObserver のない環境(テストなど)では描画しない
    if (
      typeof window.matchMedia !== "function" ||
      typeof IntersectionObserver === "undefined" ||
      !document.createElement("canvas").getContext
    ) {
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const base = { lift: 0, ground: 0, vy: 0, grabbed: false };
    const perches = Array.from(document.querySelectorAll<HTMLElement>("[data-perch]"));
    const actors: Actor[] = single
      ? [{ color: residentColors[1], kind: "walk", x: 0.08, min: 0.03, max: 0.95, speed: 0.025, dir: 1, ...base }]
      : [
          { color: residentColors[1], kind: "walk", x: 0.5, min: 0.36, max: 0.66, speed: 0.045, dir: 1, ...base },
          { color: residentColors[0], kind: "carry", x: 0.82, min: 0.72, max: 0.94, speed: 0.035, dir: -1, ...base },
          { color: residentColors[2], kind: "sit", x: 0.16, min: 0.16, max: 0.16, speed: 0, dir: 1, ...base },
        ];

    const nodes = actors.map((a, i) => {
      const w = a.kind === "sit" ? 24 : 16;
      const h = a.kind === "sit" ? 20 : 16;
      const el = document.createElement("canvas");
      el.width = w;
      el.height = h;
      el.style.position = "absolute";
      el.style.bottom = "0";
      el.style.width = `${w * SCALE}px`;
      el.style.height = `${h * SCALE}px`;
      el.style.imageRendering = "pixelated";
      el.style.pointerEvents = "auto";
      el.style.cursor = "grab";
      el.style.touchAction = "none";
      el.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        actors[i].grabbed = true;
        actors[i].vy = 0;
        el.setPointerCapture(e.pointerId);
        el.style.cursor = "grabbing";
      });
      const release = () => {
        actors[i].grabbed = false;
        el.style.cursor = "grab";
      };
      el.addEventListener("pointerup", release);
      el.addEventListener("pointercancel", release);
      wrap.appendChild(el);
      return { el, ctx: el.getContext("2d"), map: colorMapFor(a.color) };
    });
    if (nodes.some((n) => !n.ctx)) {
      nodes.forEach((n) => n.el.remove());
      return;
    }

    const cursor = { x: -9999, y: -9999 };
    const night = isNight();
    let lastActive = performance.now();
    const wake = () => {
      lastActive = performance.now();
    };
    const onMove = (e: PointerEvent) => {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
      wake();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", wake, { passive: true });
    window.addEventListener("keydown", wake, { passive: true });
    window.addEventListener("scroll", wake, { passive: true });

    let napLatched = false;
    const isAsleep = (a: Actor) =>
      !reduce && !a.grabbed && a.lift === a.ground && (night || a.asleep === true);

    const born = performance.now();
    const walksAt = (i: number) => born + WARMUP_MS + i * 700;

    const framesFor = (a: Actor, t: number, now: number, i: number): PixelRows => {
      if (a.kind === "sit") {
        if (reduce) return kotatsu;
        if (a.grabbed || a.lift > a.ground || (a.near && !night)) return kotatsuAwake;
        return kotatsuFrames[Math.floor(t / 0.55) % kotatsuFrames.length];
      }
      const pair = a.kind === "walk" ? [walk1, walk2] : [carry1, carry2];
      if (reduce) return idle;
      if (a.grabbed) return pair[Math.floor(t / 0.12) % 2];
      if (isAsleep(a)) return sleep;
      if (a.near) return pair[Math.floor(t / 0.18) % 2];
      if (a.speed === 0 || now < walksAt(i)) return idle;
      return pair[Math.floor(t / 0.22) % 2];
    };

    let raf = 0;
    let last = performance.now();
    let drawn = -1;

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(wrap);

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!visible) return;
      const rect = wrap.getBoundingClientRect();
      const perchRects = perches.map((el) => el.getBoundingClientRect());
      const t = now / 1000;

      const SNAP = 26;
      const groundFor = (centerX: number, curLift: number): number => {
        let g = 0;
        for (const p of perchRects) {
          if (centerX < p.left + 4 || centerX > p.right - 4) continue;
          const platLift = rect.bottom - p.top;
          if (platLift <= 0) continue;
          if (curLift >= platLift - SNAP) g = Math.max(g, platLift);
        }
        return g;
      };

      if (!reduce && !night) {
        if (now - lastActive > NAP_MS) {
          if (!napLatched) {
            napLatched = true;
            actors.forEach((a) => {
              a.asleep = true;
            });
          }
        } else {
          napLatched = false;
        }
      }

      actors.forEach((a, i) => {
        const node = nodes[i];
        const spriteW = (a.kind === "sit" ? 24 : 16) * SCALE;
        const spriteH = (a.kind === "sit" ? 20 : 16) * SCALE;
        const width = rect.width - spriteW;
        const cx = rect.left + a.x * width + spriteW / 2;
        const cy = rect.bottom - a.lift - spriteH / 2;

        if (!reduce && a.asleep && !night) {
          const dist = Math.hypot(cursor.x - cx, cursor.y - cy);
          if (dist < NEAR_PX * 0.6 || a.grabbed) a.asleep = false;
        }

        const asleep = isAsleep(a);

        if (!reduce && !a.grabbed && !asleep) {
          const dist = Math.hypot(cursor.x - cx, cursor.y - cy);
          a.near = dist < NEAR_PX;
          if (a.near) a.face = cursor.x >= cx ? 1 : -1;
        } else if (asleep) {
          a.near = false;
        }

        a.ground = reduce ? 0 : groundFor(cx, a.lift);

        if (a.grabbed) {
          a.x = Math.min(0.98, Math.max(0.02, (cursor.x - rect.left - spriteW / 2) / width));
          a.lift = Math.max(0, rect.bottom - cursor.y - spriteH / 2);
          a.face = 1;
        } else if (a.lift > a.ground) {
          a.vy += GRAVITY * dt;
          a.lift = Math.max(a.ground, a.lift - a.vy * dt);
          if (a.lift === a.ground) a.vy = 0;
        } else if (!reduce && a.speed > 0 && !a.near && !asleep) {
          a.lift = a.ground;
          if (now >= walksAt(i)) {
            a.x += a.speed * a.dir * dt;
            if (a.x > a.max) a.dir = -1;
            else if (a.x < a.min) a.dir = 1;
          }
        }

        const facing = (a.grabbed || a.near) && a.kind !== "sit" ? (a.face ?? a.dir) : a.dir;
        const hop =
          !a.grabbed && a.near && a.lift === a.ground && a.kind !== "sit"
            ? Math.abs(Math.sin(t * 9)) * 2.5
            : 0;
        node.el.style.transform = `translateX(${(a.x * width).toFixed(1)}px) translateY(-${(a.lift + hop).toFixed(1)}px) scaleX(${facing})`;
      });

      const frameTick = Math.floor(now / 110);
      if (frameTick !== drawn) {
        drawn = frameTick;
        actors.forEach((a, i) => {
          drawSprite(nodes[i].ctx!, framesFor(a, t, now, i), nodes[i].map);
        });
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("scroll", wake);
      nodes.forEach((n) => n.el.remove());
    };
  }, [single]);

  return <div ref={wrapRef} aria-hidden="true" className="ochanoma-parade" />;
}
