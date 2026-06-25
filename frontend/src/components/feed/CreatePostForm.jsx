import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { postService } from '../../services/postService';
import Avatar from '../common/Avatar';

const CreatePostForm = ({ onPostCreated }) => {
  const { user } = useContext(AuthContext);
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState('');

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await postService.createPost(caption, image);
      setCaption('');
      setImage('');
      onPostCreated();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="auth-card" style={{ marginBottom: 'var(--space-6)', textAlign: 'left' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <Avatar
          src={user?.profilePicture}
          alt="Your Avatar"
          className="post-avatar"
          style={{ width: '40px', height: '40px' }}
        />
        <h3 style={{ margin: 0 }}>Create Post</h3>
      </div>
      <form onSubmit={handleCreatePost}>
        <div className="form-group">
          <textarea
            rows="3"
            placeholder="What's on your mind? Use #tags!"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Image URL (optional)"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </div>
        <button type="submit" className="btn">Post</button>
      </form>
    </div>
  );
};

export default CreatePostForm;