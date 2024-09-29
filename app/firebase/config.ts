// Client-side Firebase configuration
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const clientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let clientApp: ReturnType<typeof initializeApp> | undefined;
let clientAuth: Auth | undefined;
let clientDb: ReturnType<typeof getFirestore> | undefined;
let analytics: ReturnType<typeof getAnalytics> | undefined;
let googleProvider: GoogleAuthProvider | undefined;

if (typeof window !== 'undefined' && !getApps().length) {
  clientApp = initializeApp(clientConfig);
  clientAuth = getAuth(clientApp);
  clientDb = getFirestore(clientApp);
  analytics = getAnalytics(clientApp);
  googleProvider = new GoogleAuthProvider();
}

export { clientApp, clientAuth, clientDb, analytics, googleProvider };