import API from './api';

export const uploadService = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return API.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};