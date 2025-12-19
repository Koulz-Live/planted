// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { Analytics, getAnalytics } from "firebase/analytics";
import { Firestore, getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check if Firebase is configured
const isFirebaseConfigured = firebaseConfig.projectId && firebaseConfig.apiKey && firebaseConfig.appId;

// Initialize Firebase only if configured
let app: FirebaseApp | undefined;
let analytics: Analytics | undefined;
let db: Firestore | undefined;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    
    // Initialize Analytics (only in browser environment)
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }
    
    // Initialize Firestore
    db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.warn('⚠️ Firebase initialization failed:', error);
  }
} else {
  console.warn('⚠️ Firebase not configured - user features disabled. Add VITE_FIREBASE_* environment variables to enable.');
}

// Helper function to get db or throw error
export function getDb(): Firestore {
  if (!db) {
    throw new Error('Firebase is not configured. User features are disabled.');
  }
  return db;
}

export { app, analytics, db, isFirebaseConfigured };
