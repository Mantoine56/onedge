'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import { useTransactions } from '@/hooks/useTransactions'
import { Header } from '@/components/Header'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { 
  Mail,
  Phone,
  Key,
  Trash,
  RefreshCw
} from 'lucide-react'
import { auth } from '@/app/firebase'
import { deleteUser, sendPasswordResetEmail } from 'firebase/auth'

export default function ProfilePage() {
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false)
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)
  const [isResetDataOpen, setIsResetDataOpen] = useState(false)
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const { user } = useAuth()
  const { deleteAllTransactions } = useTransactions()
  const router = useRouter()

  const handleResetPassword = async () => {
    if (!user?.email) return
    try {
      await sendPasswordResetEmail(auth, user.email)
      setNotification({ type: 'success', message: 'Password reset email sent. Check your inbox.' })
    } catch (error) {
      console.error('Error sending password reset email:', error)
      setNotification({ type: 'error', message: 'Failed to send password reset email. Please try again.' })
    }
    setIsResetPasswordOpen(false)
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    try {
      await deleteUser(user)
      setNotification({ type: 'success', message: 'Your account has been deleted.' })
      router.push('/login')
    } catch (error) {
      console.error('Error deleting account:', error)
      setNotification({ type: 'error', message: 'Failed to delete account. Please try again.' })
    }
    setIsDeleteAccountOpen(false)
  }

  const handleResetData = async () => {
    try {
      await deleteAllTransactions()
      setNotification({ type: 'success', message: 'Your account data has been reset.' })
    } catch (error) {
      console.error('Error resetting account data:', error)
      setNotification({ type: 'error', message: 'Failed to reset account data. Please try again.' })
    }
    setIsResetDataOpen(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-dot-pattern">
      <Header 
        isAddTransactionOpen={isAddTransactionOpen}
        setIsAddTransactionOpen={setIsAddTransactionOpen}
      />
      <main className="flex-1 p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-4">User Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback>{user?.displayName?.[0] || user?.email?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{user?.displayName || 'User'}</h2>
                <p className="text-sm text-gray-500">Member since {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center mt-1">
                  <Mail className="h-4 w-4 text-gray-500 mr-2" />
                  <Input id="email" value={user?.email || ''} readOnly />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <div className="flex items-center mt-1">
                  <Phone className="h-4 w-4 text-gray-500 mr-2" />
                  <Input id="phone" value={user?.phoneNumber || 'Not provided'} readOnly />
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Button onClick={() => setIsResetPasswordOpen(true)}>
                <Key className="mr-2 h-4 w-4" /> Reset Password
              </Button>
              <Button variant="destructive" onClick={() => setIsDeleteAccountOpen(true)}>
                <Trash className="mr-2 h-4 w-4" /> Delete Account
              </Button>
              <Button variant="outline" onClick={() => setIsResetDataOpen(true)}>
                <RefreshCw className="mr-2 h-4 w-4" /> Reset Account Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset your password? We'll send you an email with instructions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordOpen(false)}>Cancel</Button>
            <Button onClick={handleResetPassword}>Send Reset Email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteAccountOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Account Data Dialog */}
      <Dialog open={isResetDataOpen} onOpenChange={setIsResetDataOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Account Data</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset your account data? This will delete all your transactions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetDataOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleResetData}>Reset Data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {notification && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}
    </div>
  )
}