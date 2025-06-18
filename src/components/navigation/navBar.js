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

//TODO: i dont see my own name in the search bar

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
        <FontAwesomeIcon icon={faSearch} />
        <span>Search</span>
      </button>
      <button onClick={handleNotificationClick} className='navBarButton'>
        <FontAwesomeIcon icon={faBell} />
        <span>Notifications</span>
        {hasUnreadNotifications && <span className="unread-indicator"></span>}
      </button>
      <button onClick={handleChatroomRoute} className='navBarButton'>
        <FontAwesomeIcon icon={faComment} />
        <span>Chatroom</span>
      </button>
      <button onClick={handleMainPageRoute} className='navBarButton'>
        <FontAwesomeIcon icon={faHome} />
        <span>Main Page</span>
      </button>
      <button onClick={handleMyProfileRoute} className='navBarButton'>
        <FontAwesomeIcon icon={faUser} />
        <span>My Profile</span>
      </button>
      <button onClick={handleMakePostRoute} className='navBarButton'>
        <FontAwesomeIcon icon={faPlus} />
        <span>Make Post</span>
      </button>
      <button onClick={handleLogout} className='navBarButton'>
        <FontAwesomeIcon icon={faSignOutAlt} />
        <span>Logout</span>
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