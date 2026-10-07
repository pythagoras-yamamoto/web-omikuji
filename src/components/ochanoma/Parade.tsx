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
const WARMUP_MS = 1_500;
const isNight = () => {
  if (new URLSearchParams(window.location.search).has("night")) return true;
  const h = new Date().getHours();
  return h >= 22 || h < 6;
};

// キノコ取得風の巨大化: 点滅しながら大きくなり、少しの間だけ大きいまま、
// ダメージ時のように点滅しながら元の大きさに縮む
const POWER_FLICKER_S = 0.9; // 拡大の点滅
const POWER_STEP_S = 0.1;
const POWER_HOLD_S = 0.7; // 大きいまま
const POWER_SHRINK_S = 0.9; // 縮小の点滅
const BIG_SCALE = 1.9;

type Actor = {
  name?: string;
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
  // 当選して巨大化し始めた時刻(秒)。undefined なら通常サイズ
  bigSince?: number;
};

// メンバー 1 人につき住民を 1 体つくる。空いている横幅を均等に区切って、それぞれの縄張りにする
const buildActors = (members: string[], single: boolean): Actor[] => {
  const base = { lift: 0, ground: 0, vy: 0, grabbed: false };
  if (single) {
    return [{ color: residentColors[1], kind: "walk", x: 0.08, min: 0.03, max: 0.95, speed: 0.025, dir: 1, ...base }];
  }
  const sitter: Actor = { color: residentColors[2], kind: "sit", x: 0.04, min: 0.04, max: 0.04, speed: 0, dir: 1, ...base };
  if (members.length === 0) return [sitter];
  const START = 0.2;
  const END = 0.95;
  const seg = (END - START) / members.length;
  const walkers = members.map<Actor>((name, i) => {
    const min = START + seg * i;
    const max = Math.max(min + 0.02, min + seg - 0.03);
    return {
      name,
      color: residentColors[(i + 1) % residentColors.length],
      kind: i % 2 === 0 ? "walk" : "carry",
      x: (min + max) / 2,
      min,
      max,
      speed: 0.03 + (i % 3) * 0.008,
      dir: i % 2 === 0 ? 1 : -1,
      ...base,
    };
  });
  return [sitter, ...walkers];
};

// active が false の間は住民は歩かず、その場で待機する(結果が出ていない間は動かない)。
// true になった時刻を起点に、少し間を置いてから歩き出し、false に戻ると再び止まる。
// members: 登録メンバー名。1 人につき住民が 1 体増える
// winner: 抽選で選ばれた名前。該当する住民がキノコを取ったように大きくなる
export default function OchanomaParade({
  single = false,
  active = true,
  members = [],
  winner = null,
}: {
  single?: boolean;
  active?: boolean;
  members?: string[];
  winner?: string | null;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const activatedAtRef = useRef<number | null>(null);
  // ループから最新の当選者を参照する(住民を作り直さずに済むように)
  const winnerRef = useRef<string | null>(winner);
  winnerRef.current = winner;
  const membersKey = members.join("\u0000");

  // active の状態に追従する: true になったら少し置いて歩き出し、false に戻ったらその場で止まる
  useEffect(() => {
    if (active) {
      if (activatedAtRef.current === null) activatedAtRef.current = performance.now();
    } else {
      activatedAtRef.current = null;
    }
  }, [active]);

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

    const perches = Array.from(document.querySelectorAll<HTMLElement>("[data-perch]"));
    const actors: Actor[] = buildActors(membersKey ? membersKey.split("\u0000") : [], single);

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
      el.style.transformOrigin = "50% 100%";
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
      // さりげない名札: 足元に小さく名前を出す(名前のある住民だけ)
      let label: HTMLSpanElement | null = null;
      if (a.name) {
        label = document.createElement("span");
        label.className = "ochanoma-name";
        label.textContent = a.name;
        wrap.appendChild(label);
      }
      return { el, label, ctx: el.getContext("2d"), map: colorMapFor(a.color) };
    });
    if (nodes.some((n) => !n.ctx)) {
      nodes.forEach((n) => {
        n.el.remove();
        n.label?.remove();
      });
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

    // 抽選前(未アクティブ)は Infinity を返し、歩き出さない
    const walksAt = (i: number) => {
      const start = activatedAtRef.current;
      if (start === null) return Infinity;
      return start + WARMUP_MS + i * 700;
    };

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

      // 当選者の巨大化を開始/解除する
      const winnerName = winnerRef.current;
      actors.forEach((a) => {
        if (!a.name) return;
        if (a.name === winnerName) {
          if (a.bigSince === undefined) a.bigSince = t;
        } else {
          a.bigSince = undefined;
        }
      });

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
          // 当選者は立ち止まって喜ぶ(歩かない)
          if (now >= walksAt(i) && a.bigSince === undefined) {
            a.x += a.speed * a.dir * dt;
            if (a.x > a.max) a.dir = -1;
            else if (a.x < a.min) a.dir = 1;
          }
        }

        const facing = (a.grabbed || a.near) && a.kind !== "sit" ? (a.face ?? a.dir) : a.dir;
        const isBig = a.bigSince !== undefined;
        // キノコ取得風: 点滅しながら拡大(大で終わる) → 大きいまま → 点滅しながら縮小(小で終わる)
        let scale = 1;
        const POWER_TOTAL_S = POWER_FLICKER_S + POWER_HOLD_S + POWER_SHRINK_S;
        if (isBig && !reduce) {
          const elapsed = t - (a.bigSince as number);
          if (elapsed < POWER_FLICKER_S) {
            // 偶数ステップで大。9 ステップなので最後(8)は大で終わる
            scale = Math.floor(elapsed / POWER_STEP_S) % 2 === 0 ? BIG_SCALE : 1;
          } else if (elapsed < POWER_FLICKER_S + POWER_HOLD_S) {
            scale = BIG_SCALE;
          } else if (elapsed < POWER_TOTAL_S) {
            // 奇数ステップで大。最後(8)は小で終わり、そのまま元の大きさに落ち着く
            const step = Math.floor((elapsed - POWER_FLICKER_S - POWER_HOLD_S) / POWER_STEP_S);
            scale = step % 2 === 1 ? BIG_SCALE : 1;
          }
        }
        // 縮み終わった後も、その場で跳ねて喜び続ける
        const cheering = isBig && !reduce && t - (a.bigSince as number) >= POWER_TOTAL_S;
        const hop =
          !a.grabbed && a.lift === a.ground && a.kind !== "sit" && (a.near || cheering)
            ? Math.abs(Math.sin(t * (cheering ? 7 : 9))) * (cheering ? 6 : 2.5)
            : 0;
        node.el.style.transform = `translateX(${(a.x * width).toFixed(1)}px) translateY(-${(a.lift + hop).toFixed(1)}px) scale(${facing * scale}, ${scale})`;
        if (node.label) {
          // 名札は住民の頭上に追従する(左右反転の影響は受けず、拡大したぶんだけ上にずれる)
          const labelLift = a.lift + hop + spriteH * scale + 4;
          node.label.style.transform = `translateX(calc(${(a.x * width + spriteW / 2).toFixed(1)}px - 50%)) translateY(-${labelLift.toFixed(1)}px)`;
          node.label.classList.toggle("is-winner", isBig);
          node.label.classList.toggle("is-near", !!a.near || a.grabbed);
        }
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
      nodes.forEach((n) => {
        n.el.remove();
        n.label?.remove();
      });
    };
  }, [single, membersKey]);

  return <div ref={wrapRef} aria-hidden="true" className="ochanoma-parade" />;
}
