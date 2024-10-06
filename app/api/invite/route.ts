import { NextResponse } from 'next/server';
import { db } from '@/app/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { sendEmail } from '@/app/lib/sendgrid';
import crypto from 'crypto';

export async function POST(request: Request) {
  const { email, invitedBy } = await request.json();

  try {
    // Generate a unique token
    const token = crypto.randomBytes(20).toString('hex');

    // Add invitation to Firestore
    const invitationRef = await addDoc(collection(db, 'invitations'), {
      email,
      invitedBy,
      role: 'employee',
      status: 'pending',
      token,
      createdAt: new Date(),
    });

    // Send invitation email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${appUrl}/signup?token=${token}`;
    await sendEmail(
      email,
      'Invitation to join CashMe',
      `You've been invited to join CashMe. Click <a href="${inviteUrl}">here</a> to sign up.`
    );

    // Use invitationRef or remove it
    console.log('Invitation created with ID:', invitationRef.id);

    return NextResponse.json({ success: true, message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json({ success: false, message: 'Failed to send invitation' }, { status: 500 });
  }
}