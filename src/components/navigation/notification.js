import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/userContext';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import app from '../../firebaseConfig';

export default function Notifications() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  // const [sentRequests, setSentRequests] = useState([]);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user && user.uid) {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists() && docSnap.data().notifications) {
          const sortedNotifications = [...docSnap.data().notifications]
            .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
          setNotifications(sortedNotifications);
        }
      }
    };

    fetchNotifications();
  }, [user, db]);

  const markAsRead = async (notificationIndex) => {
    if (user && user.uid) {
      const userDocRef = doc(db, 'users', user.uid);
      const updatedNotifications = [...notifications];
      updatedNotifications[notificationIndex].read = true;

      await updateDoc(userDocRef, {
        notifications: updatedNotifications
      });

      setNotifications(updatedNotifications);
    }
  };

  const acceptFriendRequest = async (notificationIndex) => {
    const notification = notifications[notificationIndex];
    console.log('Notification:', notification);

    if (notification.type === 'friend_request' && notification.fromUserId) {
      const userDocRef = doc(db, 'users', user.uid);
      const friendDocRef = doc(db, 'users', notification.fromUserId);

      await updateDoc(userDocRef, {
        friends: arrayUnion(notification.fromUserId)
      });

      await updateDoc(friendDocRef, {
        friends: arrayUnion(user.uid)
      });

      const updatedNotifications = [...notifications];
      updatedNotifications[notificationIndex].accepted = true;
      setNotifications(updatedNotifications);

      markAsRead(notificationIndex);
    } else {
      console.error('Invalid notification or missing fromUserId');
    }
  };

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      <button onClick={() => notifications.forEach((_, i) => markAsRead(i))}>Mark All as Read</button>
      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification, index) => (
            <div 
              key={index} 
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => markAsRead(index)}
            >
              {notification.type === 'like' && (
                <p>
                  <strong>{notification.fromUsername}</strong> liked your post
                  <span className="notification-date">
                    {new Date(notification.createdAt.toDate()).toLocaleDateString()}
                  </span>
                </p>
              )}
              {notification.type === 'friend_request' && (
                <div>
                  <p>
                    <strong>{notification.fromUsername}</strong> sent you a friend request
                  </p>
                  <button 
                    onClick={() => acceptFriendRequest(index)}
                    disabled={notification.accepted}
                  >
                    {notification.accepted ? 'Accepted' : 'Accept'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}