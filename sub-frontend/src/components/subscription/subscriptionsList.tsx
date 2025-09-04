"use client";

import React, { useEffect, useState, useCallback } from "react";
import SubscriptionCard from "./subscriptonCard";
import { SubscriptionType } from "@/types";
import { toast } from "react-toastify";
import Spinner from "../ui/spinner/spinner";
import { API_URL } from "@/lib/constants";
import { useRouter } from "next/navigation";

const SubscriptionsList: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Helper function to get the JWT from local storage
  const getToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("You are not logged in. Please sign in to continue.");
      router.push("/signin");
      return null;
    }
    return token;
  }, [router]);

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // CRITICAL FIX: Add the Authorization header
        },
      });

      if (response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem('token'); // Clear invalid token
        router.push("/signin");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch subscriptions.");
      }

      const data = await response.json();
      const subscriptionsData = data.data.subscriptions;

      if (Array.isArray(subscriptionsData)) {
        setSubscriptions(subscriptionsData as SubscriptionType[]);
      } else {
        console.error("API response is not an array:", subscriptionsData);
        setSubscriptions([]);
      }
    } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
        // If it's not a standard Error object, provide a generic message
          setError("An unknown error occurred.");
        }
      setSubscriptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, router]);

  const handleCancel = useCallback(async (id: string) => {
    const token = getToken();
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/${id}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // CRITICAL FIX: Add the Authorization header
        },
      });

      if (response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem('token');
        router.push("/signin");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel subscription.");
      }

      toast.success("Subscription cancelled successfully!");
      setSubscriptions((prevSubs) =>
        prevSubs.map((sub) => (sub._id === id ? { ...sub, status: "cancelled" } : sub))
      );
    } catch (err: unknown) {
  if (err instanceof Error) {
    console.error("Cancellation Error:", err.message);
    toast.error(err.message || "An error occurred while canceling.");
  } else {
    // Handle cases where the error is not a standard Error object
    console.error("Cancellation Error:", err);
    toast.error("An unknown error occurred while canceling.");
  }
}
  }, [getToken, router]);

  const handleDelete = useCallback(async (id: string) => {
    const token = getToken();
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/${id}/delete`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`, // CRITICAL FIX: Add the Authorization header
        },
      });

      if (response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem('token');
        router.push("/signin");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to delete subscription.");
      }

      toast.success("Subscription deleted successfully!");
      setSubscriptions((prevSubs) => prevSubs.filter((sub) => sub._id !== id));
    } catch (err: unknown) {
  // Check if the caught error is an instance of a standard Error object
  if (err instanceof Error) {
    console.error("Deletion Error:", err.message);
    toast.error(err.message || "An error occurred while deleting.");
  } else {
    // Handle cases where the error is not a standard Error object
    console.error("Deletion Error:", err);
    toast.error("An unknown error occurred while deleting.");
  }
}
  }, [getToken, router]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

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
    <div className="flex flex-col gap-4">
      {subscriptions.length > 0 ? (
        subscriptions.map((sub) => (
          <SubscriptionCard
            key={sub._id}
            subscription={sub}
            onCancel={() => handleCancel(sub._id)}
            onDelete={() => handleDelete(sub._id)}
          />
        ))
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No subscriptions found.
        </p>
      )}
    </div>
  );
};

export default SubscriptionsList;
