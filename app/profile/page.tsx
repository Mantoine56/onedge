'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import { useTransactions } from '@/hooks/useTransactions'
import { Header } from '@/components/Header'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Mail,
  Key,
  Trash,
  RefreshCw,
  UserPlus,
  PlusCircle
} from 'lucide-react'
import { auth, db } from '@/app/firebase'
import { deleteUser, sendPasswordResetEmail } from 'firebase/auth'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import AddTransactionModal from '@/components/AddTransactionModal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Update the Employee interface
interface Employee {
  id: string;
  email: string;
  name: string; // Add this line
  // Add other properties as needed
}

export default function ProfilePage() {
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false)
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)
  const [isResetDataOpen, setIsResetDataOpen] = useState(false)
  const [isInviteUserOpen, setIsInviteUserOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const { user } = useAuth()
  const { deleteAllTransactions } = useTransactions()
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isDeleteEmployeeOpen, setIsDeleteEmployeeOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const fetchEmployees = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const employeesRef = collection(db, 'users');
      const q = query(employeesRef, where('adminId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const employeesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        name: doc.data().name || 'Unknown', // Add this line to provide a default value
      } as Employee));
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setNotification({ type: 'error', message: 'Failed to fetch employees. Please try again.' });
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchEmployees();
    }
  }, [user?.role, fetchEmployees]);

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
    if (!user || !auth.currentUser) return
    try {
      await deleteUser(auth.currentUser)
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

  const handleInviteUser = async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail,
          invitedBy: user.uid,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNotification({ type: 'success', message: 'Invitation sent successfully.' });
        setInviteEmail('');
        setIsInviteUserOpen(false);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      setNotification({ type: 'error', message: 'Failed to send invitation. Please try again.' });
    }
  }

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return
    try {
      await deleteDoc(doc(db, 'users', employeeToDelete.id))
      setNotification({ type: 'success', message: 'Employee deleted successfully.' })
      fetchEmployees() // Refresh the employee list
    } catch (error) {
      console.error('Error deleting employee:', error)
      setNotification({ type: 'error', message: 'Failed to delete employee. Please try again.' })
    }
    setIsDeleteEmployeeOpen(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-dot-pattern">
      <Header 
        isAddTransactionOpen={isAddModalOpen}
        setIsAddTransactionOpen={setIsAddModalOpen}
      />
      <main className="flex-1 p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        {user && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Avatar className="h-16 w-16 mr-4">
                <AvatarFallback>{user.displayName ? user.displayName[0].toUpperCase() : 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{user.displayName || 'User'}</h2>
                <p className="text-sm text-gray-500">
                  Member since {user.creationTime ? new Date(user.creationTime).toLocaleDateString() : 'Unknown'}
                </p>
                <p className="text-sm font-medium mt-1">
                  Role: <span className="capitalize">{user.role || 'Unknown'}</span>
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center mt-1">
                  <Mail className="h-4 w-4 text-gray-500 mr-2" />
                  <Input id="email" value={user?.email || ''} readOnly />
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Button onClick={() => setIsResetPasswordOpen(true)}>
                <Key className="mr-2 h-4 w-4" /> Reset Password
              </Button>
              {user.role === 'admin' && (
                <Button onClick={() => setIsInviteUserOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" /> Invite User
                </Button>
              )}
              <Button variant="destructive" onClick={() => setIsDeleteAccountOpen(true)}>
                <Trash className="mr-2 h-4 w-4" /> Delete Account
              </Button>
              <Button variant="outline" onClick={() => setIsResetDataOpen(true)}>
                <RefreshCw className="mr-2 h-4 w-4" /> Reset Account Data
              </Button>
            </div>
            {user.role === 'admin' && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Employees</h2>
                {employees.length > 0 ? (
                  <ul className="space-y-2">
                    {employees.map((employee) => (
                      <li key={employee.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                        <span>{employee.name} ({employee.email})</span>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            setEmployeeToDelete(employee)
                            setIsDeleteEmployeeOpen(true)
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No employees yet.</p>
                )}
              </div>
            )}
          </div>
        )}
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

      {/* Invite User Dialog */}
      <Dialog open={isInviteUserOpen} onOpenChange={setIsInviteUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Invite a new user to join as an employee. They will have limited functionality.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="inviteEmail">Email</Label>
            <Input
              id="inviteEmail"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteUserOpen(false)}>Cancel</Button>
            <Button onClick={handleInviteUser}>Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Employee Dialog */}
      <Dialog open={isDeleteEmployeeOpen} onOpenChange={setIsDeleteEmployeeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this employee? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteEmployeeOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteEmployee}>Delete Employee</Button>
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

      <Button 
        variant="default" 
        className="fixed bottom-4 right-4 bg-black text-white hover:bg-gray-800 rounded-full p-4 shadow-lg"
        onClick={() => setIsAddModalOpen(true)}
      >
        <PlusCircle className="h-6 w-6" />
        <span className="sr-only">Add Transaction</span>
      </Button>

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        transactionType="income"
      />
    </div>
  )
}