export default function Header({ view, onChangeView }) {
  return (
    <header className="header">
      <div className="container header-inner">
        <h1 className="logo">🔎 Campus Lost &amp; Found</h1>
        <nav>
          <button
            className={`nav-btn ${view === 'browse' ? 'active' : ''}`}
            onClick={() => onChangeView('browse')}
          >
            Browse Items
          </button>
          <button
            className={`nav-btn primary ${view === 'report' ? 'active' : ''}`}
            onClick={() => onChangeView('report')}
          >
            + Report an Item
          </button>
        </nav>
      </div>
    </header>
  );
}
