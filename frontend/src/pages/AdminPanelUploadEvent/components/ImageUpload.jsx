import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ImageUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileSelect = (event) => {
    setSelectedFiles(event.target.files);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('images', selectedFiles[i]);
    }
    try {
      await axios.post(`${API_BASE_URL}/api/upload-event`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Images uploaded successfully!');
    } catch (error) {
      console.error('Error uploading images', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" multiple onChange={handleFileSelect} />
      <button type="submit">Save</button>
    </form>
  );
};

export default ImageUpload;