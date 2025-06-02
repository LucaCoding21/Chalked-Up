import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getAuth } from "firebase/auth";
import React, { useState } from 'react';
import { useUser } from '../context/userContext';
import app from "../firebaseConfig";
import '../styles/login.css';

export default function Login() {
  const { login } = useUser();
  const auth = getAuth(app);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      login(result.user);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      const result = await signInWithEmailAndPassword(auth, email, password);
      login(result.user);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      login(result.user);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Chalked Up</h1>
        <p className="login-subtitle">Join our climbing community and share your adventures</p>
        
        <input
          className="login-input"
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
        
        <input
          className="login-input"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />

        {error && <div className="login-error">{error}</div>}

        <button 
          className="login-button login-button-primary"
          onClick={handleEmailLogin}
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        <button 
          className="login-button login-button-secondary"
          onClick={handleEmailSignup}
          disabled={isLoading}
        >
          Create New Account
        </button>

        <div className="login-divider">
          <span>or continue with</span>
        </div>

        <button 
          className="login-button login-button-secondary"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}