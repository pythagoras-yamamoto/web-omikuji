"use client";

import { useEffect, useState } from "react";
import { OmikujiResult, RegisteredPerson } from "@/types/omikuji";
import { drawRandomName } from "@/utils/omikuji";
import { clearResultFromUrl, copyResultUrl, decodeResultFromUrl } from "@/utils/urlParams";

interface OmikujiWheelProps {
  persons: RegisteredPerson[];
}

export default function OmikujiWheel({ persons }: OmikujiWheelProps) {
  const [result, setResult] = useState<OmikujiResult | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  // 共有リンクから開かれた場合は、その結果を表示する
  useEffect(() => {
    const shared = decodeResultFromUrl();
    if (shared) {
      setResult(shared);
    }
  }, []);

  const handleShareResult = async () => {
    if (!result) return;
    const success = await copyResultUrl(persons.map((p) => p.name), result);
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
    <section className={`draw-frame${isDrawing ? " is-drawing" : ""}`} aria-label="抽選">
      <div className="draw-stage">
        <div className="stage-content" aria-live="polite" aria-atomic="true">
          {result ? (
            <div className="draw-result animate-fadeIn">
              <h2>{result.selectedName}</h2>
              <p>さんが選ばれました！</p>
              <time dateTime={result.timestamp.toISOString()}>{result.timestamp.toLocaleString("ja-JP")}</time>
              <div aria-live="polite">
                <button type="button" className="button button-secondary share-button" onClick={handleShareResult}>
                  {copyStatus === "copied" ? "コピー済み!" : copyStatus === "error" ? "エラー" : "結果を共有"}
                  <span aria-hidden="true">{copyStatus === "copied" ? "✓" : "↗"}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="draw-orbit" aria-hidden="true"><div className="ticket-art"><span>?</span><span>運</span><span>?</span></div></div>
              <h2>{isDrawing ? "運をまぜています。" : "さて、誰の番？"}</h2>
              <p>{isDrawing ? "抽選中..." : persons.length ? "準備ができたら、運だめし。" : "抽選を行うには、まず名前を登録してください"}</p>
            </>
          )}
        </div>
        <div className="draw-action">
          <button className="button button-primary" onClick={result ? handleReset : handleDraw} disabled={isDrawing || (!result && persons.length === 0)}>
            {isDrawing ? "抽選中..." : result ? "もう一度抽選" : "抽選する"}<span aria-hidden="true">{result ? "↻" : "→"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
