"use client";

import { useEffect, useState } from "react";
import { OmikujiResult, RegisteredPerson } from "@/types/omikuji";
import { drawRandomName } from "@/utils/omikuji";
import {
  clearResultFromUrl,
  copyResultUrl,
  decodeResultFromUrl,
} from "@/utils/urlParams";
import ViewTransition from "@/components/ViewTransition";
import OchanomaParade from "@/components/ochanoma/Parade";
import PixelCrackers from "@/components/ochanoma/PixelCrackers";

interface OmikujiWheelProps {
  persons: RegisteredPerson[];
}

export default function OmikujiWheel({ persons }: OmikujiWheelProps) {
  const [result, setResult] = useState<OmikujiResult | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  // 抽選が決まるたびに増やして、クラッカーを鳴らす
  const [burstKey, setBurstKey] = useState(0);

  // 共有リンクから開かれた場合は、その結果を表示する
  useEffect(() => {
    const shared = decodeResultFromUrl();
    if (shared) {
      setResult(shared);
      setBurstKey((k) => k + 1);
    }
  }, []);

  const handleShareResult = async () => {
    if (!result) return;
    const success = await copyResultUrl(
      persons.map((p) => p.name),
      result,
    );
    setCopyStatus(success ? "copied" : "error");
    setTimeout(() => setCopyStatus("idle"), 2000);
  };

  const handleDraw = async () => {
    if (isDrawing || persons.length === 0) return;
    setIsDrawing(true);
    setResult(null);
    clearResultFromUrl();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      const selectedName = drawRandomName(persons.map((person) => person.name));
      setResult({ selectedName, timestamp: new Date() });
      setBurstKey((k) => k + 1);
    } catch (error) {
      console.error("抽選エラー:", error);
    } finally {
      setIsDrawing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setIsDrawing(false);
    clearResultFromUrl();
  };

  return (
    <ViewTransition name="omikuji-frame">
      <section
        className={`draw-frame${isDrawing ? " is-drawing" : ""}`}
        aria-label="抽選"
      >
        <div className="draw-stage">
          <div className="stage-content" aria-live="polite" aria-atomic="true">
            {result ? (
              <div className="draw-result animate-fadeIn">
                <h2>{result.selectedName}</h2>
                <p>さんが選ばれました！</p>
                <time dateTime={result.timestamp.toISOString()}>
                  {result.timestamp.toLocaleString("ja-JP")}
                </time>
              </div>
            ) : (
              <>
                <div className="draw-orbit" aria-hidden="true">
                  <div className="ticket-art">
                    <span>?</span>
                    <span>●</span>
                    <span>?</span>
                  </div>
                </div>
                <h1>{isDrawing ? "選んでいます…" : "おみくじ"}</h1>
                <p>
                  {isDrawing
                    ? "抽選中..."
                    : persons.length
                      ? "ボタンを押すと、メンバーからランダムに1人を選びます。"
                      : "まずメンバーを登録してください"}
                </p>
              </>
            )}
          </div>
          <div className="draw-action">
            <button
              data-perch
              className="button button-primary"
              onClick={result ? handleReset : handleDraw}
              disabled={isDrawing || (!result && persons.length === 0)}
            >
              {isDrawing ? "抽選中..." : result ? "もう一度抽選" : "抽選する"}
              <span aria-hidden="true">{result ? "↻" : "→"}</span>
            </button>
            {result && (
              <button
                type="button"
                data-perch
                className="button button-secondary share-button"
                onClick={handleShareResult}
                aria-live="polite"
              >
                {copyStatus === "copied"
                  ? "コピー済み!"
                  : copyStatus === "error"
                    ? "エラー"
                    : "結果を共有"}
                <span aria-hidden="true">
                  {copyStatus === "copied" ? "✓" : "↗"}
                </span>
              </button>
            )}
          </div>
          <OchanomaParade />
          <PixelCrackers burstKey={burstKey} />
        </div>
      </section>
    </ViewTransition>
  );
}
