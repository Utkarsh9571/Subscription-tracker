// src/app/layout.tsx

import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ThemeProvider } from '@/context/ThemeContext';
import ToastProvider from "@/components/ToastContainer/ToastProvider";
import "react-toastify/dist/ReactToastify.css";


export const metadata = {
  title: "Subscription Tracker",
  description: "Manage your subscriptions with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
    <html lang="en">
      <body className={`dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
            <ToastProvider />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}