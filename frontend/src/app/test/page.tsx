"use client";
import Image from "next/image";

import { useState } from 'react';

const HomePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Image uploaded successfully!');
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleRetrieve = async () => {
    try {
      const response = await fetch(`/api/images/retrieve?filename=Image_test.png`);

      if (response.ok) {
        const data = await response.json();
        setImageUrl(data.url);
      } else {
        alert('Failed to retrieve image');
      }
    } catch (error) {
      console.error('Error retrieving image:', error);
    }
  };

  return (
    <div>
      <h1>Image Upload and Retrieve</h1>

      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload Image</button>

      <button onClick={handleRetrieve}>Retrieve Image</button>

      {imageUrl && (
        <div>
          <h2>Retrieved Image:</h2>
          <Image src={imageUrl} alt="Retrieved from S3" />
        </div>
      )}
      <Image src={"https://test-itin.s3.us-east-1.amazonaws.com/public/Image_test.png"} alt="testimage" />
    </div>
  );
};

export default HomePage;
