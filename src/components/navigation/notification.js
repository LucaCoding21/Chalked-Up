import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/userContext';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import app from '../../firebaseConfig';

export default function Notifications() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const db = getFirestore(app);

  // Fetch notifications
  useEffect(() => {//on load, fetch notifications
    const fetchNotifications = async () => {// an async function that will get the nofications
      if (user && user.uid) {//if the user is logged in
        const userDocRef = doc(db, 'users', user.uid);//get the user doc ref
        const docSnap = await getDoc(userDocRef);//get the doc snap
        
        if (docSnap.exists() && docSnap.data().notifications) {//and if doc has notifications
          // Sort notifications by date (newest first)
          const sortedNotifications = [...docSnap.data().notifications]
            .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());//to millis is to convert the date to a number
          setNotifications(sortedNotifications);
        }
      }
    };

    fetchNotifications();
  }, [user, db]);

  // Mark notification as read
  const markAsRead = async (notificationIndex) => {
    if (user && user.uid) {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Create updated notifications array
      const updatedNotifications = [...notifications];
      updatedNotifications[notificationIndex].read = true;

      // Update in Firestore
      await updateDoc(userDocRef, {
        notifications: updatedNotifications
      });

      // Update local state
      setNotifications(updatedNotifications);
    }
  };

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
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
              {/* Add more notification types here as needed */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}