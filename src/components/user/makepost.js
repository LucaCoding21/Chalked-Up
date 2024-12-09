import {useUser} from '../../context/userContext';
import {useState} from 'react';
import NavBar from '../navigation/navBar';
import app from '../../firebaseConfig';
import {getFirestore,collection,addDoc,serverTimestamp,getDoc,doc} from 'firebase/firestore';
import {useNavigate} from 'react-router-dom';
import Login from '../login';

export default function MakePost(){
  const {user} = useUser();
  const [post,setPost] = useState('');
  const [username,setUsername] = useState('');
  const db = getFirestore(app);
  const navigate = useNavigate();
  const userDocRef = doc(db,'users',user.uid);
  getDoc(userDocRef).then((docSnap) => {
    if(docSnap.exists()){
        const userData = docSnap.data();
        setUsername(userData.username);
    }
  });

  const uploadPost = async () => {
    const postCollectionRef = collection(db,'posts');//this is the reference to the post collection, if no post collection exists, it will create one
    //so there is a collection in firebase called posts and it will have all posts created by all users. and inside that collection, there will be a document for each post.
    await addDoc(postCollectionRef,{
      username:username,
      post:post,
      uid:user.uid,
      createdAt:serverTimestamp()
    });
    console.log(username);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    uploadPost();
    setPost('');
    navigate('/');
  };

  if(!user){
    return <Login/>;
  }

    return <div>
      <NavBar/>
      <form onSubmit={handleSubmit}>
        <input type="text" value={post} onChange={(e) => setPost(e.target.value)}/>
        <button type="submit">Post</button>
      </form>
    </div>
}