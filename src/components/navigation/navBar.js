import {useNavigate} from 'react-router-dom';
import '../../styles/navBar.css';
import { useUser } from '../../context/userContext';
import SearchBar from './searchBar';
export default function NavBar () {
  //TODO: Make a friend request and deny page
  const {logout} = useUser();
  const navigate = useNavigate();
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
    return <div className='navBar'>
    
      <button onClick={handleChatroomRoute} className='navBarButton'>Chatroom</button>
      <SearchBar />
      <button onClick={handleMainPageRoute} className='navBarButton'>Main Page</button>
      <button onClick={handleMyProfileRoute} className='navBarButton'>My Profile</button>
      <button onClick={handleMakePostRoute} className='navBarButton'>Make Post</button>
      <button onClick={handleLogout} className='navBarButton'>Logout</button>
    </div>;
}