import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { postService } from '../services/postService';
import { userService } from '../services/userService';
import { storyService } from '../services/storyService';
import { TOAST_DURATION_MS } from '../utils/constants';
import CreatePostForm from '../components/feed/CreatePostForm';
import PostCard from '../components/feed/PostCard';
import StoriesBar from '../components/feed/StoriesBar';
import StoryViewer from '../components/feed/StoryViewer';
import SuggestionsSidebar from '../components/feed/SuggestionsSidebar';
import LikersModal from '../components/common/LikersModal';

const Feed = () => {
  const { user, setUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [stories, setStories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTag = searchParams.get('tag');
  const targetPostId = searchParams.get('postId');

  const [activeLikers, setActiveLikers] = useState(null);
  const [toast, setToast] = useState('');
  const [activeStoryGroup, setActiveStoryGroup] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast('');
    }, TOAST_DURATION_MS);
  };

  const fetchPosts = async () => {
    try {
      if (targetPostId) {
        const response = await postService.getPostById(targetPostId);
        setPosts([response.data]);
      } else {
        const response = await postService.getAllPosts(currentTag);
        setPosts(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSuggestions = async () => {
    if (!user) return;
    try {
      const response = await userService.getSuggested();
      setSuggestions(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStories = async () => {
    if (!user) return;
    try {
      const response = await storyService.getActiveStories();
      setStories(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchSuggestions();
    fetchStories();
  }, [currentTag, targetPostId, user]);

  const handleFollowSuggestion = async (id) => {
    try {
      await userService.follow(id);
      fetchSuggestions();
      fetchPosts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSharePost = (postId) => {
    const deepLink = `${window.location.origin}/?postId=${postId}`;
    navigator.clipboard.writeText(deepLink);
    showToast('Direct link copied to clipboard!');
  };

  const handleTagClick = (tag) => {
    setSearchParams({ tag });
  };

  return (
    <div className="container" style={{ maxWidth: '935px' }}>
      {user && !currentTag && !targetPostId && (
        <StoriesBar
          user={user}
          stories={stories}
          onStoryCreated={fetchStories}
          onStoryClick={setActiveStoryGroup}
        />
      )}

      {(currentTag || targetPostId) && (
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{targetPostId ? 'Showing shared post' : `Showing posts for #${currentTag}`}</h2>
          <button className="btn" style={{ width: 'auto', padding: '5px 15px' }} onClick={() => setSearchParams({})}>
            Show All Feed
          </button>
        </div>
      )}

      <div className="feed-layout">
        <div>
          {user && !currentTag && !targetPostId && (
            <CreatePostForm onPostCreated={fetchPosts} />
          )}

          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              user={user}
              setUser={setUser}
              onPostUpdated={fetchPosts}
              onShare={handleSharePost}
              onTagClick={handleTagClick}
              setActiveLikers={setActiveLikers}
            />
          ))}
          {posts.length === 0 && (
            <div className="auth-card" style={{ textAlign: 'center', color: '#8e8e8e' }}>Post not found or has been deleted</div>
          )}
        </div>

        {user && !targetPostId && (
          <SuggestionsSidebar suggestions={suggestions} onFollow={handleFollowSuggestion} />
        )}
      </div>

      {activeLikers && (
        <LikersModal likers={activeLikers} onClose={() => setActiveLikers(null)} />
      )}

      {activeStoryGroup && (
        <StoryViewer activeStoryGroup={activeStoryGroup} onClose={() => setActiveStoryGroup(null)} />
      )}

      {toast && (
        <div className="toast-container">
          {toast}
        </div>
      )}
    </div>
  );
};

export default Feed;