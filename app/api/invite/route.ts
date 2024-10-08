import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { adminDb } from '@/app/firebase/admin';
import { sendEmail } from '@/app/lib/sendgrid';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email, invitedBy } = await request.json();
    console.log('Received invitation request:', { email, invitedBy });

    if (!email || !invitedBy) {
      return NextResponse.json({ success: false, message: 'Email and invitedBy are required' }, { status: 400 });
    }

    const token = crypto.randomBytes(20).toString('hex');

    try {
      console.log('Attempting to add invitation to Firestore');
      const invitationRef = await adminDb.collection('invitations').add({
        email,
        invitedBy,
        role: 'employee',
        status: 'pending',
        token,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('Invitation added to Firestore:', invitationRef.id);
    } catch (firestoreError) {
      console.error('Firestore error:', firestoreError);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to create invitation in database', 
        error: firestoreError instanceof Error ? firestoreError.message : 'Unknown error'
      }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${appUrl}/signup/invite?token=${token}`;
    
    try {
      await sendEmail(
        email,
        'Invitation to join CashMe',
        `You've been invited to join CashMe. Click <a href="${inviteUrl}">here</a> to sign up.`
      );
      console.log('Invitation email sent successfully');
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to send invitation email', 
        error: emailError instanceof Error ? emailError.message : 'Unknown error'
      }, { status: 500 });
    }

    console.log('Invitation process completed successfully');
    return NextResponse.json({ success: true, message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Error in invitation process:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to send invitation', 
      error: error instanceof Error ? error.stack : 'Unknown error'
    }, { status: 500 });
  }
}