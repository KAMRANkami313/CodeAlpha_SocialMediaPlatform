import { useState } from 'react';
import { postService } from '../../services/postService';

const CreatePostForm = ({ onPostCreated }) => {
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
    <div className="auth-card" style={{ marginBottom: '30px', textAlign: 'left' }}>
      <h3>Create Post</h3>
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