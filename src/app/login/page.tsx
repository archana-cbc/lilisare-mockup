'use client';

import React from 'react';
import { AppProvider } from '@/context/AppContext';
import { LoginPage } from '@/components/pages/LoginPage';
import { Toast } from '@/components/shell/Toast';

export default function LoginRoute() {
  return (
    <AppProvider>
      <LoginPage />
      <Toast />
    </AppProvider>
  );
}
