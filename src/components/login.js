import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getAuth } from "firebase/auth";
import React from 'react';
import { useUser } from '../context/userContext';
import app from "../firebaseConfig";

export default function Login() {
  
  const {login} = useUser();//this is used to access the login function from the user context

  const auth = getAuth(app);
  
  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then((result) => {
      login(result.user);//this is used to login the user and set the user data in the user context
      

    }).catch((error) => {
      console.log(error);
    });
  
  };

  return (
    <button onClick={handleLogin}>Login with Google</button>
  );
}