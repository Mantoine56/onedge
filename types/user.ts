export interface User {
  id: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'employee' | null;
  creationTime?: string;
  adminId?: string;
}