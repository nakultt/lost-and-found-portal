import { useState } from 'react';
import Header from './components/Header.jsx';
import PostForm from './components/PostForm.jsx';
import ListingPage from './components/ListingPage.jsx';
import { usePosts } from './hooks/usePosts';

export default function App() {
  // 'browse' | 'report' — mirrored in the URL hash so /#report can be bookmarked
  const [view, setViewState] = useState(window.location.hash === '#report' ? 'report' : 'browse');
  const setView = (next) => {
    window.location.hash = next === 'report' ? 'report' : '';
    setViewState(next);
  };
  const [toast, setToast] = useState('');
  const postsState = usePosts(); // single source of truth for post data

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCreate = async (data) => {
    await postsState.createPost(data);
    setView('browse');
    showToast('Your post is live!');
  };

  return (
    <>
      <Header view={view} onChangeView={setView} />
      <main className="container">
        {view === 'report' ? (
          <PostForm onSubmit={handleCreate} onCancel={() => setView('browse')} />
        ) : (
          <ListingPage {...postsState} onNotify={showToast} />
        )}
      </main>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
