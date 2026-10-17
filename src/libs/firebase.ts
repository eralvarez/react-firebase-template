// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getRemoteConfig } from 'firebase/remote-config';
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
const auth = getAuth(app);
const db = getFirestore(app);
const remoteConfig = getRemoteConfig(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: 'select_account' });

remoteConfig.settings.minimumFetchIntervalMillis = 2 * 1000;

remoteConfig.defaultConfig = {
  isPageEnabled: false,
};

export { app, analytics, auth, db, remoteConfig, googleProvider };
