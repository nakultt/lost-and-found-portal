import FilterBar from './FilterBar.jsx';
import PostList from './PostList.jsx';

export default function ListingPage({
  posts,
  filters,
  pagination,
  loading,
  error,
  updateFilters,
  setPage,
  updatePost,
  deletePost,
  refresh,
  onNotify,
}) {
  const handleResolve = async (post) => {
    try {
      await updatePost(post._id, { status: post.status === 'open' ? 'resolved' : 'open' });
      onNotify('Post updated');
      refresh(); // item may no longer match the "open" filter
    } catch (err) {
      onNotify(err.message);
    }
  };

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    try {
      await deletePost(post._id);
      onNotify('Post deleted');
    } catch (err) {
      onNotify(err.message);
    }
  };

  return (
    <section>
      <FilterBar filters={filters} onChange={updateFilters} />

      <p className="result-count">
        {loading ? 'Loading…' : `${pagination.total} item${pagination.total === 1 ? '' : 's'} found`}
      </p>

      {error && (
        <p className="alert">
          {error} <button className="link-btn" onClick={refresh}>Retry</button>
        </p>
      )}

      <PostList posts={posts} loading={loading} onResolve={handleResolve} onDelete={handleDelete} />

      {pagination.pages > 1 && (
        <div className="pagination">
          <button className="btn secondary" disabled={pagination.page <= 1}
            onClick={() => setPage(pagination.page - 1)}>
            ← Prev
          </button>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button className="btn secondary" disabled={pagination.page >= pagination.pages}
            onClick={() => setPage(pagination.page + 1)}>
            Next →
          </button>
        </div>
      )}
    </section>
  );
}
