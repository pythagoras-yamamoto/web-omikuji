"use client";

import { useRef, useState } from "react";
import { RegisteredPerson } from "@/types/omikuji";

const LEAVE_MS = 280;

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
  // 削除中(フェードアウト中)のメンバー名。アニメーションが終わってから実際に削除する
  const [leaving, setLeaving] = useState<string[]>([]);
  // タイマー発火時に最新の onPersonRemove を呼ぶため(連続削除で古い一覧に戻らないように)
  const onRemoveRef = useRef(onPersonRemove);
  onRemoveRef.current = onPersonRemove;

  const handleRemove = (name: string) => {
    if (leaving.includes(name)) return;
    setLeaving((prev) => [...prev, name]);
    // CSS の .member-row.is-leaving と同じ長さだけ待ってから実際に削除する
    window.setTimeout(() => {
      setLeaving((prev) => prev.filter((n) => n !== name));
      onRemoveRef.current(name);
    }, LEAVE_MS);
  };

  const handleRegister = () => {
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

  return (
    <section className="registration-panel" aria-labelledby="members-heading">
      <div className="section-heading"><h2 id="members-heading">メンバー</h2></div>
      <form onSubmit={(event) => { event.preventDefault(); handleRegister(); }}>
        <div className="input-row">
          <input
            id="member-name"
            type="text"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault();
            }}
            placeholder="お名前を入力"
            aria-label="名前"
            aria-describedby={error ? "registration-error" : undefined}
            aria-invalid={!!error}
            disabled={isRegistering}
          />
          <button type="submit" disabled={isRegistering || !newName.trim()} className="button button-primary register-button">
            {isRegistering ? "登録中..." : "登録"}
          </button>
        </div>
        {error && <p id="registration-error" role="alert" className="form-error">{error}</p>}
      </form>
      {persons.length > 0 ? (
        <ul className="member-list">
          {persons.map((person) => (
            <li key={person.name} className={`member-row${leaving.includes(person.name) ? " is-leaving" : ""}`}>
              <span className="member-name">{person.name}</span>
              <button onClick={() => handleRemove(person.name)} className="remove-button" aria-label={`${person.name}を削除`}>
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-members"><span aria-hidden="true">＋</span><p>まだメンバーがいません</p><small>最初のひとりを追加しましょう。</small></div>
      )}
    </section>
  );
}
