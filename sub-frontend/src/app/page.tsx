"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React from "react";

export default function LandingPage() {
  const router = useRouter();

  // Check for authentication on page load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // User is logged in, redirect them to the subscriptions page
      router.push("/subscriptions");
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-center p-4">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome to Your Subscription Tracker
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
        Manage all your subscriptions in one place. Stay on top of your bills,
        track spending, and never forget a renewal date again.
      </p>
      <div className="flex space-x-4">
        <Link href="/signin">
          <span className="inline-block px-8 py-3 bg-brand-500 text-white font-semibold rounded-lg shadow-md hover:bg-brand-600 transition-colors cursor-pointer">
            Sign In
          </span>
        </Link>
        <Link href="/signup">
          <span className="inline-block px-8 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors cursor-pointer">
            Sign Up
          </span>
        </Link>
      </div>
    </div>
  );
}