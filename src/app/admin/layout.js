import AdminShell from '@/components/admin/AdminLayout';

export const metadata = {
  title: "Admin Dashboard",
};

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <body className=" min-h-screen">
        <AdminShell>
          <main >
            {children}
          </main>
        </AdminShell>
      </body>
    </html>
  );
}
