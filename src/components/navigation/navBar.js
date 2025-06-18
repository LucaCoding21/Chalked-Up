import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/navBar.css';
import { useUser } from '../../context/userContext';
import SearchBar from './searchBar';
import Notification from './notification';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faComment, faPlus, faSignOutAlt, faSearch, faBell } from '@fortawesome/free-solid-svg-icons';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import app from '../../firebaseConfig';
import logo from './logo.png';
// import logo from '../../public/123.png';

//TODO: i dont see my own name in the search bar

export default function NavBar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [activeComponent, setActiveComponent] = useState(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const navBarRef = useRef(null);
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

  // Handle clicking outside the navbar to close side panels
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeComponent && navBarRef.current && !navBarRef.current.contains(event.target)) {
        setActiveComponent(null);
      }
    };

    // Only add event listener when a side panel is open
    if (activeComponent) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeComponent]);

  const handleChatroomRoute = () => {
    setActiveComponent(null);
    navigate('/chatroom');
  };
  const handleMainPageRoute = () => {
    setActiveComponent(null);
    navigate('/');
  };
  const handleMyProfileRoute = () => {
    setActiveComponent(null);
    navigate('/myprofile');
  };
  const handleMakePostRoute = () => {
    setActiveComponent(null);
    navigate('/makepost');
  };
  const handleLogout = () => {
    setActiveComponent(null);
    logout();
    navigate('/');
  };

  const handleNotificationClick = () => {
    setActiveComponent('notification');
    setHasUnreadNotifications(false); // Mark notifications as read when opened
  };

  const handleClosePanel = () => {
    setActiveComponent(null);
  };

  return (
    <div ref={navBarRef} className={`navBar ${activeComponent === 'notification' || activeComponent === 'search' ? 'expanded' : ''}`}>
      <div className="navBar-logo-section">
        <img src={logo} alt="Climbing Logo" className="navBar-logo" />
        <span className="navBar-appname">LetsTalkOverHere</span>
      </div>
      <nav className="navBar-menu">
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
      </nav>
      {activeComponent === 'search' && (
        <div className="search-panel">
          <button 
            className="panel-close-btn"
            onClick={handleClosePanel}
            aria-label="Close search panel"
          >
            ×
          </button>
          <SearchBar />
        </div>
      )}
      {activeComponent === 'notification' && (
        <div className="notification-panel">
          <button 
            className="panel-close-btn"
            onClick={handleClosePanel}
            aria-label="Close notification panel"
          >
            ×
          </button>
          <Notification />
        </div>
      )}
    </div>
  );
}