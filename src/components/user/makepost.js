import { useUser } from '../../context/userContext';
import { useState } from 'react';
import NavBar from '../navigation/navBar';
import app from '../../firebaseConfig';
import { getFirestore, collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Login from '../login';
import '../../styles/makepost.css';

export default function MakePost() {
  const { user } = useUser();
  const [post, setPost] = useState('');
  const [username, setUsername] = useState('');
  const db = getFirestore(app);
  const navigate = useNavigate();
  const userDocRef = doc(db, 'users', user.uid);

  getDoc(userDocRef).then((docSnap) => {
    if (docSnap.exists()) {
      const userData = docSnap.data();
      setUsername(userData.username);
    }
  });

  const uploadPost = async () => {
    const postCollectionRef = collection(db, 'posts');
    await addDoc(postCollectionRef, {
      username: username,
      post: post,
      uid: user.uid,
      createdAt: serverTimestamp()
    });
    console.log(username);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    uploadPost();
    setPost('');
    navigate('/');
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div>
      <NavBar />
      <div className="makepost-container">
        <form className="makepost-form" onSubmit={handleSubmit}>
          <textarea
            className="makepost-textarea"
            placeholder="Log your ascent!"
            value={post}
            onChange={(e) => setPost(e.target.value)}
          />
          <div className="makepost-actions">
            <input type="file" className="makepost-file-input" />
            <button type="submit" className="makepost-submit-button">Post</button>
          </div>
        </form>
      </div>
    </div>
  );
}