import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });

// Define the type for the service account
interface ServiceAccount {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

// Initialize Firebase Admin SDK
if (!getApps().length) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  console.log('Environment variables:');
  console.log('FIREBASE_PROJECT_ID:', projectId ? 'Set' : 'Not set');
  console.log('FIREBASE_CLIENT_EMAIL:', clientEmail ? 'Set' : 'Not set');
  console.log('FIREBASE_PRIVATE_KEY:', privateKey ? 'Set' : 'Not set');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase configuration. Please check your environment variables.');
  }

  const serviceAccount: ServiceAccount = {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  };

  console.log('Service Account:', JSON.stringify({
    projectId,
    clientEmail,
    privateKeyLength: privateKey.length,
  }, null, 2));

  try {
    initializeApp({
      credential: cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw error;
  }
}

export const adminDb = getFirestore();