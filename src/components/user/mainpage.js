import React from 'react';
import { useUser } from '../../context/userContext';
import Login from '../login';
import UserForm from './userForm';
import NavBar from '../navigation/navBar';
import { useState, useEffect } from 'react';
import { getFirestore, collection, doc, getDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import app from '../../firebaseConfig';
import '../../styles/mainpage.css'
export default function MainPage() {
  const {user} = useUser();
  const [friends,setFriends] = useState([]);
  const [userData,setUserData] = useState([]);
  
  const db = getFirestore(app);
  
  
  useEffect(() => {
    if (user && user.uid) {
      const userDocRef = doc(collection(db, 'users'), user.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          // console.log(userData.friends);
          setFriends(userData.friends || []);
        } else {
          console.log("No such document!");
        }
      });
    }
  }, [user, db]);
  useEffect(() => {
    if (friends.length > 0) {
      const postDocRef = query(
        collection(db, 'posts'),
        where('uid', 'in', friends),
        orderBy('createdAt', 'desc')
      );

      getDocs(postDocRef).then((querySnapshot) => {
        if (!querySnapshot.empty) {
          const postsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
          setUserData(postsData);
        } else {
          console.log("No posts found for this user!");
        }
      }).catch((error) => {
        console.error("Error fetching posts: ", error);
      });
    }
  }, [db, friends]);

  //so after all that, we have the friends of the user in the friends state

  console.log(userData);
  

  //if the user is not logged in, the login page is displayed
  if(!user){
    return <Login/>;
  }

  return (
    <div>
      <NavBar/>
      <UserForm/>
      {userData.map((post) => (
        <div className="post" key={post.id}>
            <div className="post-header">
                <span className="post-title">{post.username}</span>
                <span>{new Date(post.createdAt.seconds * 1000).toLocaleDateString()}</span>
            </div>
            <div className="post-content">
                {post.post}
            </div>
            
        </div>
      ))}
    
     
    </div>
  );
}
