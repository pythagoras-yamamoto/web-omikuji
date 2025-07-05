"use client";

import { useState } from "react";
import { OmikujiResult, RegisteredPerson } from "@/types/omikuji";
import { drawRandomName } from "@/utils/omikuji";

interface OmikujiWheelProps {
  persons: RegisteredPerson[];
}

export default function OmikujiWheel({ persons }: OmikujiWheelProps) {
  const [result, setResult] = useState<OmikujiResult | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleDraw = async () => {
    if (isDrawing || persons.length === 0) return;

    setIsDrawing(true);
    setResult(null);

    // アニメーション効果のための遅延
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const names = persons.map((p) => p.name);
      const selectedName = drawRandomName(names);
      const newResult: OmikujiResult = {
        selectedName,
        timestamp: new Date(),
      };

      setResult(newResult);
    } catch (error) {
      console.error("抽選エラー:", error);
    } finally {
      setIsDrawing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setIsDrawing(false);
  };

  if (persons.length === 0) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          抽選
        </h1>
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            抽選を行うには、まず名前を登録してください
          </p>
          <div className="text-6xl mb-4">🎯</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
        抽選
      </h2>

      <div className="text-center mb-8">
        {!result && !isDrawing && (
          <button
            onClick={handleDraw}
            className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg rounded-lg transition-colors duration-200 shadow-lg"
          >
            抽選する
          </button>
        )}

        {isDrawing && (
          <div className="py-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">抽選中...</p>
          </div>
        )}

        {result && (
          <div className="animate-fadeIn">
            <div className="mx-auto w-40 h-40 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-xl shadow-lg mb-4">
              <div className="text-center">
                <div className="text-2xl mb-1">🎉</div>
                <div>{result.selectedName}</div>
              </div>
            </div>
            <p className="text-lg text-gray-700 mb-2">
              <strong>{result.selectedName}</strong>さんが選ばれました！
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {result.timestamp.toLocaleString("ja-JP")}
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors duration-200"
            >
              もう一度抽選
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
