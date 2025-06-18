import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/userContext';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import app from '../../firebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faUserPlus, faCheck, faTimes, faBell, faCheckDouble } from '@fortawesome/free-solid-svg-icons';

export default function Notifications() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user && user.uid) {
        try {
          setLoading(true);
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          
          if (docSnap.exists() && docSnap.data().notifications) {
            const sortedNotifications = [...docSnap.data().notifications]
              .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
            setNotifications(sortedNotifications);
          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchNotifications();
  }, [user, db]);

  const markAsRead = async (notificationIndex) => {
    if (user && user.uid) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const updatedNotifications = [...notifications];
        updatedNotifications[notificationIndex].read = true;

        await updateDoc(userDocRef, {
          notifications: updatedNotifications
        });

        setNotifications(updatedNotifications);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const markAllAsRead = async () => {
    if (user && user.uid) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const updatedNotifications = notifications.map(notification => ({
          ...notification,
          read: true
        }));

        await updateDoc(userDocRef, {
          notifications: updatedNotifications
        });

        setNotifications(updatedNotifications);
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    }
  };

  const acceptFriendRequest = async (notificationIndex) => {
    const notification = notifications[notificationIndex];

    if (notification.type === 'friend_request' && notification.fromUserId) {
      try {
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
      } catch (error) {
        console.error('Error accepting friend request:', error);
      }
    } else {
      console.error('Invalid notification or missing fromUserId');
    }
  };

  const rejectFriendRequest = async (notificationIndex) => {
    const notification = notifications[notificationIndex];
    
    if (notification.type === 'friend_request') {
      try {
        const updatedNotifications = [...notifications];
        updatedNotifications[notificationIndex].rejected = true;
        setNotifications(updatedNotifications);

        markAsRead(notificationIndex);
      } catch (error) {
        console.error('Error rejecting friend request:', error);
      }
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = timestamp.toDate();
    const diffInSeconds = Math.floor((now - notificationTime) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return notificationTime.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <FontAwesomeIcon icon={faHeart} className="notification-icon like-icon" />;
      case 'friend_request':
        return <FontAwesomeIcon icon={faUserPlus} className="notification-icon friend-icon" />;
      default:
        return <FontAwesomeIcon icon={faBell} className="notification-icon" />;
    }
  };

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="notifications-header">
          <h2><FontAwesomeIcon icon={faBell} /> Notifications</h2>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2><FontAwesomeIcon icon={faBell} /> Notifications</h2>
        {notifications.length > 0 && (
          <button 
            className="mark-all-read-btn"
            onClick={markAllAsRead}
          >
            <FontAwesomeIcon icon={faCheckDouble} />
            Mark All Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-notifications">
          <FontAwesomeIcon icon={faBell} className="empty-icon" />
          <h3>No notifications yet</h3>
          <p>When you get notifications, they'll appear here</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification, index) => (
            <div 
              key={index} 
              className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.accepted ? 'accepted' : ''} ${notification.rejected ? 'rejected' : ''}`}
            >
              <div className="notification-content" onClick={() => markAsRead(index)}>
                <div className="notification-icon-wrapper">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-details">
                  <div className="notification-text">
                    {notification.type === 'like' && (
                      <span>
                        <strong>{notification.fromUsername}</strong> liked your post
                      </span>
                    )}
                    {notification.type === 'friend_request' && (
                      <span>
                        <strong>{notification.fromUsername}</strong> sent you a friend request
                      </span>
                    )}
                  </div>
                  <div className="notification-meta">
                    <span className="notification-time">
                      {getTimeAgo(notification.createdAt)}
                    </span>
                    {!notification.read && <span className="unread-dot"></span>}
                  </div>
                </div>
              </div>

              {notification.type === 'friend_request' && !notification.accepted && !notification.rejected && (
                <div className="friend-request-actions">
                  <button 
                    className="accept-btn"
                    onClick={() => acceptFriendRequest(index)}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    Accept
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => rejectFriendRequest(index)}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    Decline
                  </button>
                </div>
              )}

              {notification.accepted && (
                <div className="request-status accepted-status">
                  <FontAwesomeIcon icon={faCheck} />
                  Accepted
                </div>
              )}

              {notification.rejected && (
                <div className="request-status rejected-status">
                  <FontAwesomeIcon icon={faTimes} />
                  Declined
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}