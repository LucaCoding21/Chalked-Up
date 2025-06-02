import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/userContext';
import app from '../../firebaseConfig';
import { getFirestore, collection, doc, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore';
import '../../styles/userForm.css';

//TODO: make the user form page
//TODO: make the user form page look nice- it should have more data fields
export default function UserForm() {
  const { user } = useUser();
  const [userExists, setUserExists] = useState(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const db = getFirestore(app);
  const userDocRef = doc(collection(db, 'users'), user.uid);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getDoc(userDocRef).then((docSnap) => {
      if (docSnap.exists()) {
        setUserExists(true);
      } else {
        setUserExists(false);
      }
    });
  }, [userDocRef]);

  async function isUsernameTaken(username) {
    const usersCollectionRef = collection(db, 'users');
    const q = query(usersCollectionRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const data = event.target;
    const name = data.name.value;
    const bio = data.bio.value;
    const phoneNumber = data.phoneNumber.value;
    const username = data.username.value;

    const usernameTaken = await isUsernameTaken(username);
    if (usernameTaken) {
      setErrorMessage('Username is not available. Please choose another one.');
      return;
    }

    await setDoc(userDocRef, {
      uid: user.uid,
      name: name,
      phoneNumber: phoneNumber,
      bio: bio,
      username: username,
    });

    setOnboardingComplete(true);
    setErrorMessage('');
  }

  // Show nothing while loading
  if (userExists === null) return null;

  if (onboardingComplete) {
    return (
      <div className="userForm">
        <div className="userForm-card">
          <div className="userForm-headline">Profile created!</div>
          <div className="userForm-subtitle">Please log in again to continue.</div>
          <button
            style={{
              marginTop: '1.5rem',
              padding: '12px 32px',
              background: '#c7b453',
              color: '#232526',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.13rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s, transform 0.2s',
              boxShadow: '0 2px 8px rgba(199, 180, 83, 0.13)',
              letterSpacing: '0.5px'
            }}
            onClick={() => window.location.reload()}
          >
            Go to Login Page
          </button>
        </div>
      </div>
    );
  }

  // Only show the onboarding form if the user does not exist
  if (userExists === false) {
    return (
      <div className="userForm">
        <div className="userForm-card">
          <div className="userForm-headline">Create Your Climber Profile</div>
          <div className="userForm-subtitle">Join the crew and share your beta!</div>
          {errorMessage && <div className="errorMessage">{errorMessage}</div>}
          <form onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Name" />
            <input type="text" name="username" placeholder="Username" />
            <input type="text" name="phoneNumber" placeholder="Phone Number" />
            <input type="text" name="bio" placeholder="Bio" />
            <button type="submit">Create User</button>
          </form>
        </div>
      </div>
    );
  }

  // If user exists, render nothing (OnboardingGate will show the app)
  return null;
}