'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/app/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return; // No token, proceed with regular signup
      }

      try {
        const invitationsRef = collection(db, 'invitations');
        const q = query(invitationsRef, where('token', '==', token), where('status', '==', 'pending'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError('Invalid or expired invitation');
          setLoading(false);
          return;
        }

        const invitationDoc = querySnapshot.docs[0];
        setInvitation({ ...invitationDoc.data(), id: invitationDoc.id });
        setEmail(invitationDoc.data().email);
        setLoading(false);
      } catch (error) {
        console.error('Error verifying token:', error);
        setError('An error occurred. Please try again.');
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        name,
        email,
        role: invitation ? 'employee' : 'admin',
        adminId: invitation ? invitation.invitedBy : user.uid,
      });

      if (invitation) {
        const invitationDocRef = doc(db, 'invitations', invitation.id);
        await updateDoc(invitationDocRef, { status: 'accepted' });
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error signing up:', error);
      setError('Failed to sign up. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // Add this check
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    return <div>Error: Application URL is not set. Please check your environment variables.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Sign Up</h1>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              readOnly={!!invitation}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">Sign Up</Button>
        </form>
        {error && <p className="text-red-500 text-center">{error}</p>}
      </div>
    </div>
  );
}