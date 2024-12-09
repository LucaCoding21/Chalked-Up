import React, {useState, useEffect} from 'react';
import { useUser } from '../../context/userContext';
import {collection,doc,getFirestore,getDoc} from 'firebase/firestore';
import app from '../../firebaseConfig';
import NavBar from '../navigation/navBar';
import Login from '../login';
import "../../styles/chatroom.css";
import { useNavigate } from 'react-router-dom';
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
            console.log(userData);
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
  console.log(friends.length);
  const handleFriendClick = (friendId) => {
    navigate(`/chat/${friendId}`);
  };
  if(!user){
    return <Login/>;
  }

  return <div>
    <NavBar/>
    {friends.length > 0 ? (
        friends.map((friend) => (
            <button onClick={() => {
                handleFriendClick(friend);
            }} key={friend} className="chatroom-friend">
                {friendUsernames[friend] || 'Loading...'}
            </button>
          ))
    ) : (
        <div>No friends yet</div>
    )}
    </div>;
}
