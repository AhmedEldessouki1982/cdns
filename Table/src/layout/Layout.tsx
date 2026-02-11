import HeaderBar from '@/components/headerbar/Headerbar';
import { AppSidebar } from '@/components/sidebar/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';
import { api } from '@/api/client';
import LoginForm from '@/components/login/loginForm';

type LayoutProps = { children: React.ReactNode };

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  if (!api.isAuthenticated()) {
    return <LoginForm />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-linear-to-br from-gray-50 to-blue-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <HeaderBar />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};
