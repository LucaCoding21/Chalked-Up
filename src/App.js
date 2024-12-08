import './styles/App.css';

import MainPage from './components/user/mainpage';
import Chatroom from './components/chatroom';
import MyProfile from './components/user/myProfile';
import SearchBar from './components/searchBar';
import MakePost from './components/user/makepost';
import React from 'react';
import {UserProvider} from './context/userContext';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

console.log("Firebase API Key:", process.env.REACT_APP_FIREBASE_API_KEY);

function App() {



  
  return (
    <div className="App">
      <header className="App-header">
      <Router>
        <UserProvider>
 
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/chatroom" element={<Chatroom />} />
              <Route path="/myprofile" element={<MyProfile />} />
              <Route path="/searchbar" element={<SearchBar />} />
              <Route path="/makepost" element={<MakePost />} />
            </Routes>
        </UserProvider>

      </Router>
      </header>
    </div>
  );
}

export default App;
