import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import rawConfig from '../../firebase-applet-config.json';

// Securely resolve configuration from Vite environment variables first,
// with safe fallback to configuration file if environment variables are unset.
const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || rawConfig.apiKey || '',
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || rawConfig.authDomain || '',
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || rawConfig.projectId || '',
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || rawConfig.storageBucket || '',
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || rawConfig.messagingSenderId || '',
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || rawConfig.appId || '',
  firestoreDatabaseId: (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID as string) || rawConfig.firestoreDatabaseId || '',
  oAuthClientId: (import.meta.env.VITE_FIREBASE_OAUTH_CLIENT_ID as string) || rawConfig.oAuthClientId || '',
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

// Initialize Firestore with robust persistent multi-tab caching for offline resilience
export const db = (() => {
  const customDbId = firebaseConfig.firestoreDatabaseId || undefined;
  try {
    return initializeFirestore(
      app,
      {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      },
      customDbId
    );
  } catch {
    return customDbId ? getFirestore(app, customDbId) : getFirestore(app);
  }
})();

// Initialize Firebase Authentication
export const auth = getAuth(app);

export { firebaseConfig };
export default app;
