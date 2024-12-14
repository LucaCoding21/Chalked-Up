import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/navBar.css';
import { useUser } from '../../context/userContext';
import SearchBar from './searchBar';
import Notification from './notification';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faComment, faPlus, faSignOutAlt, faSearch, faBell } from '@fortawesome/free-solid-svg-icons';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import app from '../../firebaseConfig';

export default function NavBar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [activeComponent, setActiveComponent] = useState(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user && user.uid) {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists() && docSnap.data().notifications) {
          return docSnap.data().notifications;
        }
      }
      return [];
    };

    const checkUnreadNotifications = async () => {
      const notifications = await fetchNotifications();
      const unread = notifications.some(notification => !notification.read);
      setHasUnreadNotifications(unread);
    };

    checkUnreadNotifications();
  }, [user, db]);

  const handleChatroomRoute = () => {
    navigate('/chatroom');
  };
  const handleMainPageRoute = () => {
    navigate('/');
  };
  const handleMyProfileRoute = () => {
    navigate('/myprofile');
  };
  const handleMakePostRoute = () => {
    navigate('/makepost');
  };
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNotificationClick = () => {
    setActiveComponent('notification');
    setHasUnreadNotifications(false); // Mark notifications as read when opened
  };

  return (
    <div className={`navBar ${activeComponent === 'notification' || activeComponent === 'search' ? 'expanded' : ''}`}>
      <button onClick={() => setActiveComponent('search')} className='navBarButton'>
        {activeComponent === 'search' ? 'Search' : <FontAwesomeIcon icon={faSearch} />}
      </button>
      <button onClick={handleNotificationClick} className='navBarButton'>
        {activeComponent === 'notification' ? 'Notifications' : <FontAwesomeIcon icon={faBell} />}
        {hasUnreadNotifications && <span className="unread-indicator"></span>}
      </button>
      <button onClick={handleChatroomRoute} className='navBarButton'>
        {activeComponent ? <FontAwesomeIcon icon={faComment} /> : 'Chatroom'}
      </button>
      <button onClick={handleMainPageRoute} className='navBarButton'>
        {activeComponent ? <FontAwesomeIcon icon={faHome} /> : 'Main Page'}
      </button>
      <button onClick={handleMyProfileRoute} className='navBarButton'>
        {activeComponent ? <FontAwesomeIcon icon={faUser} /> : 'My Profile'}
      </button>
      <button onClick={handleMakePostRoute} className='navBarButton'>
        {activeComponent ? <FontAwesomeIcon icon={faPlus} /> : 'Make Post'}
      </button>
      <button onClick={handleLogout} className='navBarButton'>
        {activeComponent ? <FontAwesomeIcon icon={faSignOutAlt} /> : 'Logout'}
      </button>

      {activeComponent === 'search' && (
        <div className="search-panel">
          <SearchBar />
        </div>
      )}
      {activeComponent === 'notification' && (
        <div className="notification-panel">
          <Notification />
        </div>
      )}
    </div>
  );
}