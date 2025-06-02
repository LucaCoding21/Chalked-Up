import React from 'react';
import { useUser } from '../../context/userContext';
import Login from '../login';
import NavBar from '../navigation/navBar';
import MakePost from './makepost';
import { useState, useEffect } from 'react';
import { getFirestore, collection, doc, getDoc, query, where, orderBy, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import app from '../../firebaseConfig';
import '../../styles/mainpage.css';

export default function MainPage() {
  const {user} = useUser();
  const [friends,setFriends] = useState([]);
  const [userData,setUserData] = useState([]);
  const [username,setUsername] = useState('');

  const db = getFirestore(app);
  
  useEffect(() => {//this is used to get the friends of the user
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
    if (user && friends.length >= 0) {
      const postDocRef = query(
        collection(db, 'posts'),
        where('uid', 'in', [user.uid, ...friends]),
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
          console.log("No posts found!");
        }
      }).catch((error) => {
        console.error("Error fetching posts: ", error);
      });
    }
  }, [db, friends, user]);

  const handleLike = async (postId) => {
    setUserData((prevUserData) =>
      prevUserData.map((post) => {
        if (post.id === postId) {
          const hasLiked = post.likes?.includes(user.uid);
          const updatedLikes = hasLiked
            ? post.likes.filter((uid) => uid !== user.uid)
            : [...(post.likes || []), user.uid];

          // Update the post document
          const postDocRef = doc(collection(db, 'posts'), postId);
          updateDoc(postDocRef, {
            likes: hasLiked ? updatedLikes : arrayUnion(user.uid),
            ...(hasLiked && { likes: updatedLikes })
          }).catch((error) => {
            console.error("Error updating likes: ", error);
          });
          
          const fetchUsername = async () => {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUsername(userDoc.data().username);
                } else {
                    console.log("User document not found!");
                }
            };
    
          fetchUsername();
      
          // Add notification to post owner's document
          if (!hasLiked) {  // Only notify when liking, not unliking
            const userDocRef = doc(collection(db, 'users'), post.uid);
            updateDoc(userDocRef, {
              notifications: arrayUnion({
                type: 'like',
                postId: postId,
                fromUser: user.uid,
                fromUsername: username || user.email,
                createdAt: new Date(),
                read: false
              })
            }).catch((error) => {
              console.error("Error updating notifications: ", error);
            });
          }
          
          return { ...post, likes: updatedLikes };
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
  const handleComment = (e, postId, comment) => {
    e.preventDefault();
    console.log(postId, comment);
  };

  //TODO: Make the refresh not so buggy

  // Add this new function to handle new posts
  const handleNewPost = (newPost) => {
    setUserData(prevData => [newPost, ...prevData]);
  };
  

  //if the user is not logged in, the login page is displayed
  if(!user){
    return <Login/>;
  }

  return (
    <div className="main-container">
      <NavBar/>
      <div className="posts-container">
        <MakePost onPostCreated={handleNewPost}/>
        {userData.map((post) => (
          <div className="post" key={post.id}>
            <div className="post-header">
              <span className="post-title">{post.username}</span>
              <span className="post-date">
                {new Date(post.createdAt.seconds * 1000).toLocaleDateString()}
              </span>
            </div>
            <div className="post-content">
              {post.post}
            </div>
            <div className="post-footer">
              <div className="post-actions">
                <span className="post-likes">
                  {post.likes?.length ?? 0} likes
                </span>
                <button 
                  className={`post-button ${post.likes?.includes(user.uid) ? 'active' : ''}`}
                  onClick={() => handleLike(post.id)}
                >
                  {post.likes?.includes(user.uid) ? 'Unlike' : 'Like'}
                </button>
                <button 
                  className="post-button"
                  onClick={() => handleRepost(post.id)}
                >
                  Repost
                </button>
              </div>
              <form 
                className="post-comment-form"
                onSubmit={(e) => handleComment(e, post.id, e.target.comment.value)}
              >
                <input 
                  type="text" 
                  placeholder="Write a comment..." 
                  name="comment"
                  className="post-comment-input"
                />
                <button 
                  type="submit"
                  className="post-comment-button"
                >
                  Comment
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
