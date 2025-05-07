// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyA8eNZlxri60GTiZZbWRU_Tu2hw9-vaOIE',
  authDomain: 'book-memories-2d989.firebaseapp.com',
  projectId: 'book-memories-2d989',
  storageBucket: 'book-memories-2d989.firebasestorage.app',
  messagingSenderId: '1024752233712',
  appId: '1:1024752233712:web:d790af2a23214d5182a635',
  measurementId: 'G-7Q62ZW53XC',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
