import type { Metadata } from "next";
import React from "react";
import AppSidebar from "@/layout/AppSidebar"; // Import your Sidebar component
import AppHeader from "@/layout/AppHeader"; // Import your Header component

// Add the metadata here
export const metadata: Metadata = {
  title: "Subscriptions Dashboard | My App",
  description: "Your dashboard for subscriptions and analytics.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out lg:ml-[290px]`}
      >
        
      <AppHeader />
        <div className="p-4 mx-auto max-w-7xl md:p-6">{children}</div>
      </div>
    </div>
  );
}