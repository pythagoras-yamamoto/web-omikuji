import Link from "next/link";

export default function Home() {
  return (
    <main className="site-shell">
      <section className="home-intro">
        <h1>KOMONO</h1>
        <p>チームでさっと使える、地味に便利な小物たち。</p>
      </section>
      <section aria-labelledby="tools-heading" className="tool-section">
        <div className="section-heading">
          <h2 id="tools-heading">ツール一覧</h2>
          <span className="eyebrow">01 TOOL AVAILABLE</span>
        </div>
        <ul className="tool-grid">
          <li>
            <Link href="/omikuji" className="tool-card">
              <div className="tool-card-top"><span className="eyebrow">01 / RANDOM PICKER</span><span aria-hidden="true">↗</span></div>
              <div className="ticket-art" aria-hidden="true"><span>?</span><span>01</span><span>?</span></div>
              <div className="tool-card-bottom">
                <h3>おみくじ</h3>
                <p>メンバーを登録して、ランダムに1人を選ぶ。<br />司会や当番決めに。</p>
                <span className="text-link">おみくじを開く <span aria-hidden="true">→</span></span>
              </div>
            </Link>
          </li>
          <li className="coming-soon">
            <span className="eyebrow">NEXT / A LITTLE MORE</span>
            <span className="plus-mark" aria-hidden="true">＋</span>
            <div><h3>次の小物、準備中。</h3><p>Coming soon...</p></div>
          </li>
        </ul>
      </section>
      <footer className="site-footer"><span>KOMONO</span><span>Made by yyo616</span></footer>
    </main>
  );
}
