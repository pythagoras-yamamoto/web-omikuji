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
          {persons.map((person, index) => (
            <li key={person.name} className="member-row">
              <span className="member-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="member-name">{person.name}</span>
              <button onClick={() => onPersonRemove(person.name)} className="remove-button" aria-label={`${person.name}を削除`}>
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
