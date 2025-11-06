// app/admin/layout.jsx
'use client';

import { Toaster } from 'sonner';
import AdminShell from '@/components/admin/AdminLayout';

export default function AdminLayout({ children }) {
  return (
    <AdminShell>
      <main>
        <Toaster position="top-right" expand={true} richColors />
        {children}
      </main>
    </AdminShell>
  );
}
