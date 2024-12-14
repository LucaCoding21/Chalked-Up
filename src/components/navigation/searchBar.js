import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getFirestore, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import app from '../../firebaseConfig';

import _ from 'lodash';
import { useUser } from '../../context/userContext';

export default function SearchBar() {
  const { user } = useUser();
  const [queryText, setQueryText] = useState('');
  const [results, setResults] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const db = getFirestore(app);
  
  useEffect(() => {
    const fetchUsers = async () => {
      if (queryText.length > 0) {
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, where('username', '>=', queryText));
        const querySnapshot = await getDocs(q);
        setResults(querySnapshot.docs.map((doc) => doc.data()));
      } else {
        setResults([]);
      }
    };

    const debouncedFetch = _.debounce(fetchUsers, 300);
    debouncedFetch();

    return () => {
      debouncedFetch.cancel();
    };
  }, [queryText, db]);

  const handleSearch = (e) => {
    setQueryText(e.target.value);
  };

  const sendFriendRequest = async (userId) => {
    if (!user || !user.uid) {
      console.error('User data is incomplete:', user);
      return;
    }

    try {
      // Fetch the current user's document to get the username
      const currentUserDocRef = doc(db, 'users', user.uid);
      const currentUserDoc = await getDoc(currentUserDocRef);
      const currentUserData = currentUserDoc.data();

      if (!currentUserData || !currentUserData.username) {
        console.error('Current user data is incomplete:', currentUserData);
        return;
      }

      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        notifications: arrayUnion({
          type: 'friend_request',
          fromUsername: currentUserData.username,
          fromUserId: user.uid,
          createdAt: new Date(),
          read: false,
        }),
      });
      setSentRequests([...sentRequests, userId]);
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  return (
    <div className="search-container">
      <input
        type="text"
        value={queryText}
        onChange={handleSearch}
        placeholder="Search..."
        className="search-input"
      />
      <ul className="search-results">
        {results.map((result, index) => (
          <li key={index} className="search-result-item">
            {result.username}
            <button
              onClick={() => sendFriendRequest(result.uid)}
              disabled={sentRequests.includes(result.uid)}
              className="friend-request-button"
            >
              {sentRequests.includes(result.uid) ? 'Request Sent' : 'Add Friend'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}