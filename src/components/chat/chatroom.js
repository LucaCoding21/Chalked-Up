import React, {useState, useEffect} from 'react';
import { useUser } from '../../context/userContext';
import {collection,doc,getFirestore,getDoc} from 'firebase/firestore';
import app from '../../firebaseConfig';
import NavBar from '../navigation/navBar';
import Login from '../login';
import "../../styles/chatroom.css";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faMessage } from '@fortawesome/free-solid-svg-icons';

export default function Chatroom () {
  const [friends,setFriends] = useState([]);
  const [friendUsernames, setFriendUsernames] = useState({});
  const {user} = useUser();
  const db = getFirestore(app);
  const navigate = useNavigate();
  
  useEffect(() => {//this is to get the friends of the user
    const userDocRef = doc(collection(db,'users'),user.uid);
    getDoc(userDocRef).then((docSnap) => {
        if(docSnap.exists()){
            const userData = docSnap.data();
            setFriends(userData.friends || []);
        }
        else{
            console.log("No such document!");
        }
    });
  }, [user.uid, db]);

  useEffect(() => {//turn friendsuser to username
    friends.forEach(async (friendId) => {
      const userDocRef = doc(collection(db,'users'),friendId);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        setFriendUsernames(prev => ({
          ...prev,
          [friendId]: docSnap.data().username
        }));
      }
    });
  }, [friends, db]);

  const handleFriendClick = (friendId) => {
    navigate(`/chat/${friendId}`);
  };
  
  if(!user){
    return <Login/>;
  }

  return (
    <div className="chatroom-bg">
      <NavBar/>
      <div className="chatroom-container">
        <div className="chatroom-tagline">
          Messages
        </div>
        {friends.length > 0 ? (
          friends.map((friend) => (
            <button
              onClick={() => handleFriendClick(friend)}
              key={friend}
              className="chatroom-friend"
            >
              <div className="friend-icon">
                <FontAwesomeIcon icon={faUser} />
              </div>
              {friendUsernames[friend] || 'Loading...'}
            </button>
          ))
        ) : (
          <div className="chatroom-empty">
            <div className="chatroom-empty-icon">
              <FontAwesomeIcon icon={faMessage} />
            </div>
            <div>
              <h3>No conversations yet</h3>
              <p>Add friends to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
