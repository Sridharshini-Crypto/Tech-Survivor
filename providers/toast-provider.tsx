'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#18181B',
          border: '1px solid #27272A',
          color: '#FAFAFA',
        },
      }}
      richColors
    />
  );
}
