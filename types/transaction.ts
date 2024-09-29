export interface Transaction {
  id: string;
  amount: number;
  date: Date | string;
  customerName: string;
  notes?: string;
  // Add any other properties that your transactions have
}