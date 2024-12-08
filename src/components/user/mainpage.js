import React from 'react';
import { useUser } from '../../context/userContext';
import Login from '../login';
import UserForm from './userForm';
import NavBar from '../navigation/navBar';
import { useState, useEffect } from 'react';
import { getFirestore, collection, doc, getDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import app from '../../firebaseConfig';

export default function MainPage() {
  const {user, logout} = useUser();
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
console.log(userData);
  //so after all that, we have the friends of the user in the friends state

  
  const handleLogout = () => {
    logout();
  };

  //if the user is not logged in, the login page is displayed
  if(!user){
    return <Login/>;
  }

  return (
    <div>
      <NavBar/>
      <h1>Welcome {user.displayName}</h1>
      <UserForm/>
      {userData.map((post) => (
        <p>{post.username}: {post.post}</p>
      ))}
      <button onClick={handleLogout}>Logout</button>
     
    </div>
  );
}
