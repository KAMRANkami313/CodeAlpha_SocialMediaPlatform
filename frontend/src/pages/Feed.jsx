import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { postService } from '../services/postService';
import { userService } from '../services/userService';
import { storyService } from '../services/storyService';
import { TOAST_DURATION_MS } from '../utils/constants';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import CreatePostForm from '../components/feed/CreatePostForm';
import PostCard from '../components/feed/PostCard';
import StoriesBar from '../components/feed/StoriesBar';
import StoryViewer from '../components/feed/StoryViewer';
import SuggestionsSidebar from '../components/feed/SuggestionsSidebar';
import LikersModal from '../components/common/LikersModal';
import EmptyState from '../components/common/EmptyState';
import { PostSkeleton } from '../components/common/Skeleton';
import { FileText, SearchX, Hash, X } from 'lucide-react';

const Feed = () => {
  const { user, setUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [stories, setStories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentTag = searchParams.get('tag');
  const targetPostId = searchParams.get('postId');

  const [activeLikers, setActiveLikers] = useState(null);
  const [toast, setToast] = useState('');
  const [activeStoryGroup, setActiveStoryGroup] = useState(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const isFetchingRef = useRef(false);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast('');
    }, TOAST_DURATION_MS);
  };

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoadingPosts(true);
    try {
      if (targetPostId) {
        const response = await postService.getPostById(targetPostId);
        setPosts([response.data]);
        setHasMore(false);
      } else {
        const response = await postService.getAllPosts(currentTag, pageNum);
        const { data, hasMore: more } = response.data;
        setPosts(prev => append ? [...prev, ...data] : data);
        setHasMore(more);
        setPage(pageNum);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingPosts(false);
      isFetchingRef.current = false;
    }
  }, [currentTag, targetPostId]);

  const loadMorePosts = useCallback(() => {
    if (hasMore && !loadingPosts) {
      fetchPosts(page + 1, true);
    }
  }, [fetchPosts, hasMore, loadingPosts, page]);

  const sentinelRef = useInfiniteScroll(loadMorePosts, hasMore, loadingPosts);

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
    fetchPosts(1, false);
    fetchSuggestions();
    fetchStories();
  }, [currentTag, targetPostId, user]);

  const handlePostCreated = () => {
    fetchPosts(1, false);
  };

  const handlePostUpdated = () => {
    fetchPosts(1, false);
  };

  const handleFollowSuggestion = async (id) => {
    try {
      await userService.follow(id);
      fetchSuggestions();
      fetchPosts(1, false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSharePost = (postId) => {
    const deepLink = `${window.location.origin}/?postId=${postId}`;
    navigator.clipboard.writeText(deepLink);
    showToast('Direct link copied to clipboard!');
  };

  const handleShareToDM = (post, recipient) => {
    navigate('/messages', {
      state: {
        startChatWith: recipient,
        sharedPostId: post._id,
        sharedPostAuthor: post.user?.username
      }
    });
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
        <div className="feed-tag-header">
          <h2>
            {targetPostId
              ? <><SearchX size={18} /> Showing shared post</>
              : <><Hash size={18} /> Showing posts for #{currentTag}</>
            }
          </h2>
          <button className="btn feed-clear-btn" onClick={() => setSearchParams({})}>
            <X size={14} />
            Show All Feed
          </button>
        </div>
      )}

      <div className="feed-layout">
        <div>
          {user && !currentTag && !targetPostId && (
            <CreatePostForm onPostCreated={handlePostCreated} />
          )}

          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              user={user}
              setUser={setUser}
              onPostUpdated={handlePostUpdated}
              onShare={handleSharePost}
              onShareToDM={handleShareToDM}
              onTagClick={handleTagClick}
              setActiveLikers={setActiveLikers}
            />
          ))}

          {loadingPosts && posts.length === 0 && (
            <>
              <PostSkeleton />
              <PostSkeleton />
            </>
          )}

          {posts.length === 0 && !loadingPosts && (
            <EmptyState
              icon={targetPostId ? <SearchX size={48} /> : <FileText size={48} />}
              title={targetPostId ? 'Post not found' : 'No posts yet'}
              message={targetPostId ? 'This post may have been deleted.' : 'Be the first to share something with your community!'}
            />
          )}
                    
          {hasMore && (
            <div ref={sentinelRef} className="infinite-scroll-sentinel">
              {loadingPosts && <div className="loading-spinner"></div>}
            </div>
          )}

          {!hasMore && posts.length > 0 && !targetPostId && (
            <div className="feed-end-message">You're all caught up ✨</div>
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