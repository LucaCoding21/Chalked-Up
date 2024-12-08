import {useNavigate} from 'react-router-dom';

export default function NavBar () {
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
    return <div>
      <button onClick={handleChatroomRoute}>Chatroom</button>
      <button onClick={handleSearchBarRoute}>Search Bar</button>
      <button onClick={handleMainPageRoute}>Main Page</button>
      <button onClick={handleMyProfileRoute}>My Profile</button>
      <button onClick={handleMakePostRoute}>Make Post</button>
    </div>;
}