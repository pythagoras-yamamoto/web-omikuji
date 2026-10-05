"use client";

import * as React from "react";

type Props = { name: string; children: React.ReactNode };

// Next の experimental.viewTransition が有効なときは React の実験 API を使い、
// それ以外(テスト環境など)では何もしないラッパーとして振る舞う。
const Experimental = (React as unknown as { unstable_ViewTransition?: React.ComponentType<Props> })
  .unstable_ViewTransition;

export default function ViewTransition({ name, children }: Props) {
  if (!Experimental) return <>{children}</>;
  return <Experimental name={name}>{children}</Experimental>;
}
