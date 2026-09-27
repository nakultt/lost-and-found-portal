import { categoryLabel } from '../constants';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function PostCard({ post, onResolve, onDelete }) {
  const { type, title, description, category, location, date, imageUrl, contact, status } = post;

  return (
    <article className={`card post-card ${status === 'resolved' ? 'resolved' : ''}`}>
      {imageUrl && <img src={imageUrl} alt={title} className="post-img" />}
      <div className="badges">
        <span className={`badge ${type}`}>{type === 'lost' ? 'LOST' : 'FOUND'}</span>
        <span className="badge category">{categoryLabel(category)}</span>
        {status === 'resolved' && <span className="badge resolved">RESOLVED</span>}
      </div>
      <h3>{title}</h3>
      <p className="description">{description}</p>
      <ul className="meta">
        <li>📍 {location}</li>
        <li>📅 {formatDate(date)}</li>
        <li>
          👤 {contact.name} · <a href={`mailto:${contact.email}`}>{contact.email}</a>
          {contact.phone && ` · ${contact.phone}`}
        </li>
      </ul>
      <div className="card-actions">
        <button className="btn small secondary" onClick={() => onResolve(post)}>
          {status === 'open' ? '✓ Mark resolved' : 'Reopen'}
        </button>
        <button className="btn small danger" onClick={() => onDelete(post)}>
          Delete
        </button>
      </div>
    </article>
  );
}
