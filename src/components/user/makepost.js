import { useUser } from '../../context/userContext';
import { useState, useEffect } from 'react';
import app from '../../firebaseConfig';
import { getFirestore, collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import Login from '../login';
import '../../styles/makepost.css';

export default function MakePost({ onPostCreated }) {
  const { user } = useUser();
  const [post, setPost] = useState('');
  const [username, setUsername] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUsername(userData.username);
        }
      });
    }
  }, [user, db]);

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is a video
      if (!file.type.startsWith('video/')) {
        alert('Please select a valid video file');
        return;
      }
      
      // Check file size (limit to 100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert('Video file size must be less than 100MB');
        return;
      }
      
      setSelectedVideo(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
    }
  };

  const uploadVideo = async (videoFile) => {
    if (!videoFile) return null;
    
    const videoRef = ref(storage, `videos/${user.uid}/${Date.now()}_${videoFile.name}`);
    const snapshot = await uploadBytes(videoRef, videoFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };

  const uploadPost = async () => {
    const postCollectionRef = collection(db, 'posts');
    
    let videoURL = null;
    if (selectedVideo) {
      setIsUploading(true);
      setUploadProgress(0);
      try {
        videoURL = await uploadVideo(selectedVideo);
        setUploadProgress(100);
      } catch (error) {
        console.error('Error uploading video:', error);
        alert('Failed to upload video. Please try again.');
        setIsUploading(false);
        return null;
      }
      setIsUploading(false);
    }
    
    const docRef = await addDoc(postCollectionRef, {
      username: username,
      post: post,
      uid: user.uid,
      videoURL: videoURL,
      createdAt: serverTimestamp()
    });
    return docRef;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!post.trim() && !selectedVideo) {
      alert('Please add some text or a video to your post');
      return;
    }
    
    const docRef = await uploadPost();
    if (!docRef) return; // Upload failed
    
    const newPost = {
      id: docRef.id,
      post: post,
      uid: user.uid,
      username: user.displayName || user.email,
      videoURL: selectedVideo ? await uploadVideo(selectedVideo) : null,
      createdAt: new Date(),
      likes: []
    };
    onPostCreated(newPost);
    setPost('');
    setSelectedVideo(null);
    setVideoPreview(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    navigate('/');
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div className="make-post-card">
      <form className="makepost-form" onSubmit={handleSubmit}>
        <div className="makepost-header">
          <span className="makepost-username">{username || user.displayName || user.email}</span>
        </div>
        <textarea
          className="makepost-textarea"
          placeholder="Log your latest send, project, or epic! 🧗‍♂️"
          value={post}
          onChange={(e) => setPost(e.target.value)}
        />
        
        {videoPreview && (
          <div className="video-preview-container">
            <video 
              className="video-preview" 
              controls 
              src={videoPreview}
            >
              Your browser does not support the video tag.
            </video>
            <button 
              type="button" 
              className="remove-video-btn"
              onClick={() => {
                setSelectedVideo(null);
                setVideoPreview(null);
                URL.revokeObjectURL(videoPreview);
              }}
            >
              ✕ Remove Video
            </button>
          </div>
        )}
        
        {isUploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span>Uploading video... {uploadProgress}%</span>
          </div>
        )}
        
        <div className="makepost-actions">
          <label className="file-input-label">
            <input 
              type="file" 
              className="makepost-file-input" 
              accept="video/*"
              onChange={handleVideoSelect}
              disabled={isUploading}
            />
            <span className="file-input-text">
              {selectedVideo ? 'Change Video' : '📹 Add Video'}
            </span>
          </label>
          <button 
            type="submit" 
            className="makepost-submit-button"
            disabled={isUploading}
          >
            <span role="img" aria-label="carabiner">⛓️</span> 
            {isUploading ? 'Uploading...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}