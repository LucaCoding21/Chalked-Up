import './styles/App.css';

import MainPage from './components/user/mainpage';
import Chatroom from './components/chat/chatroom';
import MyProfile from './components/user/myProfile';
import SearchBar from './components/navigation/searchBar';
import MakePost from './components/user/makepost';
import React, { useEffect, useState } from 'react';
import {UserProvider, useUser} from './context/userContext';
import Chat from './components/chat/chat';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import UserForm from './components/user/userForm';
import { getFirestore, doc, getDoc, collection } from 'firebase/firestore';
import Login from './components/login';

console.log("Firebase API Key:", process.env.REACT_APP_FIREBASE_API_KEY);

function OnboardingGate({ children }) {
  const { user } = useUser();
  const [profileExists, setProfileExists] = useState(null);

  useEffect(() => {
    if (!user) return;
    const db = getFirestore();
    const userDocRef = doc(collection(db, 'users'), user.uid);
    getDoc(userDocRef).then((docSnap) => {
      setProfileExists(docSnap.exists());
    });
  }, [user]);

  if (!user) return <Login />; // or your login page
  if (profileExists === null) return null; // or a loading spinner
  if (!profileExists) return <UserForm />;
  return children;
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <Router>
        <UserProvider>
          <OnboardingGate>
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/chatroom" element={<Chatroom />} />
              <Route path="/myprofile" element={<MyProfile />} />
              <Route path="/searchbar" element={<SearchBar />} />
              <Route path="/makepost" element={<MakePost />} />
              <Route path="/chat/:friendId" element={<Chat />} />
            </Routes>
          </OnboardingGate>
        </UserProvider>
      </Router>
      </header>
    </div>
  );
}

export default App;
