import { useState } from 'react';
import { IndianRupee } from 'lucide-react';
import AdminPayments from './AdminPayments';
import ResidentPayments from './ResidentPayments';

export default function PaymentDashboard({ user, society }) {
  const isAdmin = ['chairman', 'secretary'].includes(user.role);

  return (
    <div className="pb-24 md:pb-6">
      {isAdmin ? (
        <AdminPayments user={user} society={society} />
      ) : (
        <ResidentPayments user={user} society={society} />
      )}
    </div>
  );
}
