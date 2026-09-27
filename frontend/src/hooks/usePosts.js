import { useCallback, useEffect, useState } from 'react';
import { postsApi } from '../api/postsApi';

/**
 * Owns the post list state: fetching, filtering, and the create/update/delete
 * actions. Components receive data and callbacks from here via props.
 */
export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [filters, setFilters] = useState({ category: 'all', type: 'all', status: 'open', q: '' });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await postsApi.list({ ...filters, page });
      setPosts(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  // Re-fetch whenever filters or page change. Debounce so typing in the
  // search box doesn't fire a request on every keystroke.
  useEffect(() => {
    const timer = setTimeout(fetchPosts, 300);
    return () => clearTimeout(timer);
  }, [fetchPosts]);

  const updateFilters = (changes) => {
    setFilters((prev) => ({ ...prev, ...changes }));
    setPage(1); // new filter → back to first page
  };

  const createPost = async (data) => {
    const res = await postsApi.create(data); // throws on validation error
    // Show the new post immediately, then re-sync with the server.
    setPosts((prev) => [res.data, ...prev]);
    fetchPosts();
    return res.data;
  };

  const updatePost = async (id, data) => {
    const res = await postsApi.update(id, data);
    setPosts((prev) => prev.map((p) => (p._id === id ? res.data : p)));
    return res.data;
  };

  const deletePost = async (id) => {
    await postsApi.remove(id);
    setPosts((prev) => prev.filter((p) => p._id !== id));
    setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
  };

  return {
    posts,
    filters,
    pagination,
    loading,
    error,
    updateFilters,
    setPage,
    createPost,
    updatePost,
    deletePost,
    refresh: fetchPosts,
  };
}
