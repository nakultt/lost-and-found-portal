import PostCard from './PostCard.jsx';

export default function PostList({ posts, loading, onResolve, onDelete }) {
  if (!loading && posts.length === 0) {
    return <p className="empty">No items match your search. Try a different category or keyword.</p>;
  }
  return (
    <div className="post-grid">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} onResolve={onResolve} onDelete={onDelete} />
      ))}
    </div>
  );
}
