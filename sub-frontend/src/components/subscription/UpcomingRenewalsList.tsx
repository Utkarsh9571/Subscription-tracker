"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import Spinner from "../ui/spinner/spinner";

interface Subscription {
  _id: string;
  name: string;
  price: number;
  currency: string;
  frequency: string;
  category: string;
  paymentMethod: string;
  startDate: string; // ISO string format
  renewalDate: string;
  // Add any other properties your subscription objects have
}

const API_URL = "http://192.168.29.162:5500/api/v1/subscriptions";

// Helper function to get the JWT from local storage
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Helper function to handle 401 errors, clear the token, and redirect
const handleAuthError = (message: string) => {
  toast.error(message);
  // This is the critical change: we remove the token from local storage
  // to force a fresh login.
  localStorage.removeItem("token");
  window.location.href = "/";
};

// Helper function to fetch data
const fetchUpcomingRenewals = async () => {
  const token = getAuthToken();
  if (!token) {
    handleAuthError("Authentication token not found. Please log in.");
    return;
  }

  const response = await fetch(`${API_URL}/upcoming-renewals`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // This is the critical change: we now manually pass the Authorization header with the JWT.
      "Authorization": `Bearer ${token}`,
    },
    // The 'credentials: "include"' is no longer needed with manual header management.
  });

  if (response.status === 401) {
    handleAuthError("Session expired. Please log in again.");
    return;
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch data");
  }

  return response.json();
};

export default function UpcomingRenewalsList() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchUpcomingRenewals();
      setSubscriptions(data?.data?.upcomingRenewals || []);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCancel = useCallback(async (id: string) => {
    const token = getAuthToken();
    if (!token) {
      handleAuthError("Authentication token not found. Please log in.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Pass the JWT here as well
        },
      });

      if (response.status === 401) {
        handleAuthError("Session expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel subscription.");
      }

      toast.success("Subscription cancelled successfully!");
      setSubscriptions((prevSubs) => prevSubs.filter((sub) => sub._id !== id));
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Cancellation Error:", error.message);
        toast.error(error.message);
      } else {
        console.error("Cancellation Error: An unknown error occurred.");
        toast.error("An unknown error occurred while canceling.");
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500 dark:text-red-400">
        Error: {error}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Upcoming Renewals</h2>
      {subscriptions.length > 0 ? (
        subscriptions.map((sub) => (
          <div
            key={sub._id}
            className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-transform transform hover:scale-[1.01]"
          >
            <div className="flex-1 text-center md:text-left mb-2 md:mb-0">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {sub.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Renews on {new Date(sub.renewalDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex-shrink-0 text-center md:text-right mb-2 md:mb-0">
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                ${sub.price}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {sub.frequency}
              </p>
            </div>
            <div className="flex-shrink-0 mt-2 md:mt-0 md:ml-4">
              <button
                onClick={() => handleCancel(sub._id)}
                className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No upcoming renewals found.
        </p>
      )}
    </div>
  );
}
