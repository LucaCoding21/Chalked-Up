import { useUser } from '../../context/userContext';
import { useState, useEffect } from 'react';
import app from '../../firebaseConfig';
import { getFirestore, collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Login from '../login';
import '../../styles/makepost.css';

export default function MakePost({ onPostCreated }) {
  const { user } = useUser();
  const [post, setPost] = useState('');
  const [username, setUsername] = useState('');
  const db = getFirestore(app);
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

  const uploadPost = async () => {
    const postCollectionRef = collection(db, 'posts');
    const docRef = await addDoc(postCollectionRef, {
      username: username,
      post: post,
      uid: user.uid,
      createdAt: serverTimestamp()
    });
    return docRef;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const docRef = await uploadPost();
    const newPost = {
      id: docRef.id,
      post: post,
      uid: user.uid,
      username: user.displayName || user.email,
      createdAt: new Date(),
      likes: []
    };
    onPostCreated(newPost);
    setPost('');
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
        <div className="makepost-actions">
          <input type="file" className="makepost-file-input" />
          <button type="submit" className="makepost-submit-button">
            <span role="img" aria-label="carabiner">⛓️</span> Post
          </button>
        </div>
      </form>
    </div>
  );
}