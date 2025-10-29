import { Toaster } from 'sonner';
import AdminShell from '@/components/admin/AdminLayout';

// export const metadata = {
//   title: "Admin Dashboard",
// };

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AdminShell>
          <main >
          <Toaster position="top-right" expand={true} richColors/>
            {children}
          </main>
        </AdminShell>
      </body>
    </html>
  );
}
