"use client";

import { usePersonManager } from "@/hooks/usePersonManager";
import OmikujiWheel from "@/components/OmikujiWheel";
import PersonRegistration from "@/components/PersonRegistration";
import Link from "next/link";
import ViewTransition from "@/components/ViewTransition";

export default function Home() {
  const { persons, registerPerson, removePerson } = usePersonManager();

  const handlePersonRegister = (name: string) => {
    try {
      registerPerson(name);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  return (
    <main className="site-shell">
      <header className="site-header">
        <Link href="/" className="wordmark">KOMONO</Link>
        <Link href="/" className="back-link">← ツール一覧</Link>
      </header>
      <div className="page-heading">
        <ViewTransition name="page-title">
          <h1>おみくじ</h1>
        </ViewTransition>
        <p>メンバーを登録して、ランダムに1人を選ぶ。</p>
      </div>
      <div className="workspace">
        <OmikujiWheel persons={persons} />
        <aside className="control-panel" aria-label="抽選の設定">
          <PersonRegistration
            persons={persons}
            onPersonRegister={handlePersonRegister}
            onPersonRemove={removePerson}
          />
        </aside>
      </div>
      <footer className="site-footer"><span>Made by yyo616</span></footer>
    </main>
  );
}
