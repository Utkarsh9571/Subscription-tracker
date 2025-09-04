// src/contexts/NotificationContext.tsx
"use client";
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of a notification
export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
  timestamp: Date;
}

// Define the shape of the context's value
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type: 'success' | 'info' | 'error') => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Function to add a new notification
  const addNotification = (message: string, type: 'success' | 'info' | 'error') => {
    const newNotification: Notification = {
      id: Date.now().toString(), // Use a unique ID like a timestamp
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  // Function to remove a notification (e.g., when the user clicks 'Clear all')
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}