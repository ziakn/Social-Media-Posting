// app/portal/layout.jsx
'use client';

import { Toaster } from 'sonner';
import PortalShell from '@/components/portal/PortalLayout';

export default function PortalLayout({ children }) {
  return (
    <PortalShell>
      <main>
        <Toaster position="top-right" expand={true} richColors />
        {children}
      </main>
    </PortalShell>
  );
}
