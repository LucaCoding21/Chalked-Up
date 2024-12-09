import React from 'react';
import { useUser } from '../../context/userContext';
import Login from '../login';
import UserForm from './userForm';
import NavBar from '../navigation/navBar';
import MakePost from './makepost';
import { useState, useEffect } from 'react';
import { getFirestore, collection, doc, getDoc, query, where, orderBy, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
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
          setFriends(userData.friends || []);
        } else {
          console.log("No such document!");
        }
      });
    }
  }, [user, db]);
  useEffect(() => {
    //TODO: show your posts in main page too
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

  const handleLike = (postId) => {
    setUserData((prevUserData) =>
      prevUserData.map((post) => {//this is used to update the likes of the post
        if (post.id === postId) {//if the post id is the same as the post id, then the post is updated
          const hasLiked = post.likes?.includes(user.uid);//this is used to check if the user has liked the post
          const updatedLikes = hasLiked
            ? post.likes.filter((uid) => uid !== user.uid)//this is used to remove the user id from the likes
            : [...(post.likes || []), user.uid];//this is used to add the user id to the likes

          // Update the server
          const postDocRef = doc(collection(db, 'posts'), postId);
          updateDoc(postDocRef, {
            likes: hasLiked ? updatedLikes : arrayUnion(user.uid),//this is used to update the likes of the post  
            ...(hasLiked && { likes: updatedLikes }) // Remove user ID if unliking
          }).catch((error) => {
            console.error("Error updating likes: ", error);
          });

          return { ...post, likes: updatedLikes };//this is used to return the updated post
        }
        return post;
      })
    );
  };
  //TODO: make the repost feature
  const handleRepost = (postId) => {
    console.log(postId);
  };
 
  //TODO: Make a comment feature

  //TODO: Make the refresh not so buggy

  //if the user is not logged in, the login page is displayed
  if(!user){
    return <Login/>;
  }

  return (
    <div>
      <NavBar/>
      <MakePost/>
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
            <div className="post-footer">
            <p>{post.likes?.length ?? 0} likes</p>
                <button onClick={() => handleLike(post.id)}>
                  {post.likes?.includes(user.uid) ? 'Unlike' : 'Like'}
                </button>
                <button onClick={() => handleRepost(post.id)}>Repost</button>
            </div>
        </div>
      ))}
    
     
    </div>
  );
}
