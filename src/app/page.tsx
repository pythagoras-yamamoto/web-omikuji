import Link from "next/link";
import ViewTransition from "@/components/ViewTransition";

export default function Home() {
  return (
    <main className="site-shell">
      <header className="site-header">
        <span className="wordmark">KOMONO</span>
      </header>
      <div className="home-main">
        <div className="page-heading">
          <ViewTransition name="page-title">
            <h1 id="tools-heading">ツール一覧</h1>
          </ViewTransition>
          <p>チームでさっと使える、地味に便利な小物たち。</p>
        </div>
        <section aria-labelledby="tools-heading" className="tool-section">
          <ul className="tool-grid">
            <li>
              <ViewTransition name="omikuji-frame">
                <Link href="/omikuji" className="tool-card">
                  <div className="ticket-art" aria-hidden="true">
                    <span>?</span>
                    <span>01</span>
                    <span>?</span>
                  </div>
                  <div className="tool-card-bottom">
                    <h3>おみくじ</h3>
                    <p>
                      メンバーを登録して、ランダムに1人を選ぶ。
                      <br />
                      司会や当番決めに。
                    </p>
                  </div>
                </Link>
              </ViewTransition>
            </li>
            <li className="coming-soon">
              <span className="eyebrow">NEXT / A LITTLE MORE</span>
              <span className="plus-mark" aria-hidden="true">
                ＋
              </span>
              <div>
                <h3>次の小物、準備中。</h3>
                <p>Coming soon...</p>
              </div>
            </li>
          </ul>
        </section>
      </div>
      <footer className="site-footer">
        <span>Made by yyo616</span>
      </footer>
    </main>
  );
}
