"use client";

import { useState } from "react";
import { copyNamesUrl } from "@/utils/urlParams";

interface ShareButtonProps {
  names: string[];
}

export default function ShareButton({ names }: ShareButtonProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle"
  );

  const handleShare = async () => {
    const success = await copyNamesUrl(names);
    setCopyStatus(success ? "copied" : "error");
    setTimeout(() => setCopyStatus("idle"), 2000);
  };

  if (names.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={handleShare}
        className={`px-4 py-2 rounded-lg font-bold transition-colors duration-200 shadow-lg ${
          copyStatus === "copied"
            ? "bg-green-500 text-white"
            : copyStatus === "error"
            ? "bg-red-500 text-white"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      >
        {copyStatus === "copied"
          ? "コピー済み!"
          : copyStatus === "error"
          ? "エラー"
          : "リンクを共有"}
      </button>
    </div>
  );
}
