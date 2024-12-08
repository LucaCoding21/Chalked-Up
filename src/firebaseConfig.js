import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Debug log to check if environment variables are loaded
console.log('Firebase Config:', {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? 'exists' : 'missing',
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? 'exists' : 'missing',
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID ? 'exists' : 'missing'
});

const app = initializeApp(firebaseConfig);

export default app;