// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAQICl9SKE5H-6SIY_bzC2vRoaDQvhzgnM',
  authDomain: 'react-firebase-template-ba9c0.firebaseapp.com',
  projectId: 'react-firebase-template-ba9c0',
  storageBucket: 'react-firebase-template-ba9c0.firebasestorage.app',
  messagingSenderId: '296112494899',
  appId: '1:296112494899:web:e8e8db3673c32779444646',
  measurementId: 'G-77N1N77X8X',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
