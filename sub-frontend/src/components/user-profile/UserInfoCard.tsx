"use client";
import React, { useState, useEffect } from "react";
import API_BASE_URL from '@/lib/api';

// Define the shape of your user data for type safety
interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
}

export default function UserMetaCard() {
  const [formData, setFormData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      // Get the token from local storage
      const token = localStorage.getItem("token");

      // Set headers for the API request, including the Authorization header
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      if (!token) {
        setLoading(false);
        console.error("No authentication token found. User is not logged in.");
        return;
      }
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/users/getMe`, {
          method: 'GET',
          headers: headers,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        setFormData(data.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading || !formData) {
    return (
      <div className="p-5 text-center text-gray-500">
        {loading ? "Loading user data..." : "User data not available. Please log in."}
      </div>
    );
  }
  
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                First Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.firstName}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Last Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.lastName || 'add your last name'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.email}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.phone || 'add your phone no.'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Bio
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.bio  || 'add your bio'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
