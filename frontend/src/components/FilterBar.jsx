import { CATEGORIES } from '../constants';

export default function FilterBar({ filters, onChange }) {
  return (
    <div className="card filter-bar">
      <input
        type="search"
        className="search-input"
        placeholder="Search by title, description or location…"
        value={filters.q}
        onChange={(e) => onChange({ q: e.target.value })}
      />

      <div className="filter-row">
        <select value={filters.type} onChange={(e) => onChange({ type: e.target.value })}>
          <option value="all">Lost &amp; Found</option>
          <option value="lost">Lost only</option>
          <option value="found">Found only</option>
        </select>
        <select value={filters.status} onChange={(e) => onChange({ status: e.target.value })}>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="all">All statuses</option>
        </select>
      </div>

      <div className="category-chips">
        {[{ value: 'all', label: 'All' }, ...CATEGORIES].map((c) => (
          <button
            key={c.value}
            className={`chip ${filters.category === c.value ? 'active' : ''}`}
            onClick={() => onChange({ category: c.value })}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
