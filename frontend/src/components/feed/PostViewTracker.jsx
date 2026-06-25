import { useEffect } from 'react';
import { postService } from '../../services/postService';

const PostViewTracker = ({ postId }) => {
  useEffect(() => {
    const registerView = async () => {
      try {
        await postService.trackImpression(postId);
      } catch (err) {
        console.error(err);
      }
    };
    registerView();
  }, [postId]);

  return null;
};

export default PostViewTracker;