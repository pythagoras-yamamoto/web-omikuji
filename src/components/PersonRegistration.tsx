"use client";

import { useState } from "react";
import { RegisteredPerson } from "@/types/omikuji";

interface PersonRegistrationProps {
  persons: RegisteredPerson[];
  onPersonRegister: (name: string) => void;
  onPersonRemove: (name: string) => void;
}

export default function PersonRegistration({
  persons,
  onPersonRegister,
  onPersonRemove,
}: PersonRegistrationProps) {
  const [newName, setNewName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!newName.trim()) {
      setError("名前を入力してください");
      return;
    }

    setIsRegistering(true);
    setError("");

    try {
      onPersonRegister(newName.trim());
      setNewName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRegister();
    }
  };

  return (
    <div className="max-w-md mx-auto mb-8">
      <div className="bg-white shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          名前を登録
        </h2>

        {/* 新規登録フォーム */}
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="お名前を入力"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={isRegistering}
            />
            <button
              onClick={handleRegister}
              disabled={isRegistering || !newName.trim()}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold rounded-lg transition-colors duration-200"
            >
              {isRegistering ? "登録中..." : "登録"}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* 登録済みの名前一覧 */}
        {persons.length > 0 && (
          <div className="space-y-2">
            {persons.map((person) => (
              <div
                key={person.name}
                className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 border-gray-200"
              >
                <div className="flex-1">
                  <span className="font-medium text-gray-800">
                    {person.name}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPersonRemove(person.name);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
