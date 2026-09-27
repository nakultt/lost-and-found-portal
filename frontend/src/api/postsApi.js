// Thin wrapper around fetch for all /api/posts calls.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Attach field-level validation errors so the form can display them.
    const error = new Error(body.message || `Request failed (${res.status})`);
    error.fieldErrors = body.errors || {};
    throw error;
  }
  return body;
}

export const postsApi = {
  list(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') params.append(key, value);
    });
    return request(`/posts?${params.toString()}`);
  },
  get: (id) => request(`/posts/${id}`),
  create: (data) => request('/posts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
};
