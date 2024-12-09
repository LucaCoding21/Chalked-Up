import {useNavigate} from 'react-router-dom';
import '../../styles/navBar.css';
import { useUser } from '../../context/userContext';
export default function NavBar () {
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
  const handleSearchBarRoute = () => {
    navigate('/searchbar');
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
      <button onClick={handleSearchBarRoute} className='navBarButton'>Search Bar</button>
      <button onClick={handleMainPageRoute} className='navBarButton'>Main Page</button>
      <button onClick={handleMyProfileRoute} className='navBarButton'>My Profile</button>
      <button onClick={handleMakePostRoute} className='navBarButton'>Make Post</button>
      <button onClick={handleLogout} className='navBarButton'>Logout</button>
    </div>;
}