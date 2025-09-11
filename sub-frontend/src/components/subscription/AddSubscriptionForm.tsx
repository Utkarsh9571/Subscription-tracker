"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "../../context/SidebarContext";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { toast } from "react-toastify";
import { API_URL } from "@/lib/constants";
import { Value } from "react-calendar/dist/shared/types.js";


// Helper function to get the JWT from local storage
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Helper function to handle 401 errors and redirect
const handleAuthError = (message: string) => {
  toast.error(message);
  // Remove the token from local storage to invalidate the session
  localStorage.removeItem("token");
  window.location.href = "/";
};

const INPUT_CLASS_NAME = "mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500";

const AddSubscriptionForm: React.FC = () => {
  const router = useRouter();
  const { isExpanded } = useSidebar();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    currency: "USD",
    frequency: "monthly",
    category: "",
    paymentMethod: "",
    startDate: "",
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

const handleDateChange = (value: Value) => {
  // Check if the value is a single date and not an array or null
  if (value instanceof Date) {
    setFormData((prevData) => ({ 
      ...prevData, 
      startDate: value.toISOString().split('T')[0] 
    }));
  } else {
    // If the value is not a single date (e.g., it's null or an array), set the date to an empty string.
    setFormData((prevData) => ({ 
      ...prevData, 
      startDate: "" 
    }));
  }
  setShowCalendar(false);
};

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) {
      newErrors.name = "Subscription name is required.";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    const priceNumber = parseFloat(formData.price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      newErrors.price = "Price must be a valid number greater than 0.";
    }

    if (!formData.category) {
      newErrors.category = "Category is required.";
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Payment method is required.";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required.";
    } else if (new Date(formData.startDate) > new Date()) {
      newErrors.startDate = "Start date cannot be in the future.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      handleAuthError("Authentication token not found. Please log in.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // This is the critical change: we now manually pass the Authorization header with the JWT.
          "Authorization": `Bearer ${token}`,
        },
        // The 'credentials: "include"' is no longer needed with manual header management.
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      if (response.status === 401) {
        handleAuthError("Session expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add subscription.");
      }

      setSuccessMessage("Subscription added successfully!");
      setFormData({
        name: "",
        price: "",
        currency: "USD",
        frequency: "monthly",
        category: "",
        paymentMethod: "",
        startDate: "",
      });

      setTimeout(() => {
        router.push("/subscriptions");
      }, 1500);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrors({ apiError: error.message || "An unknown error occurred." });
      } else {
        setErrors({ apiError: "An unknown error occurred." });
      }
    }
  };

  return (
    <div className={`
      p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6
      ${isExpanded ? 'w-[700px]' : 'w-[800px]'}
    `}>
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
        Add New Subscription
      </h4>

      {Object.keys(errors).length > 0 && (
        <p className="text-red-500 mb-4 text-sm">Please correct the form errors.</p>
      )}
      {successMessage && <p className="text-green-500 text-sm mb-4">{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
          {/* Subscription Name */}
          <div className="col-span-1 md:col-span-2">
            <Label htmlFor="name">Subscription Name*</Label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Netflix"
              className={INPUT_CLASS_NAME}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="price">Price*</Label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0"
              step="0.01"
              min="0"
              className={INPUT_CLASS_NAME}
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>

          {/* Currency */}
          <div>
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className={INPUT_CLASS_NAME}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="INR">INR</option>
            </select>
          </div>

          {/* Frequency */}
          <div>
            <Label htmlFor="frequency">Frequency</Label>
            <select
              id="frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className={INPUT_CLASS_NAME}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category*</Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={INPUT_CLASS_NAME}
            >
              <option value="">Select a category</option>
              <option value="Streaming">Streaming</option>
              <option value="Software/Tools">Software/Tools</option>
              <option value="Gaming">Gaming</option>
              <option value="News/Media">News/Media</option>
              <option value="Education">Education</option>
              <option value="Health/Fitness">Health/Fitness</option>
              <option value="Finance">Finance</option>
              <option value="Shopping">Shopping</option>
              <option value="Food">Food</option>
              <option value="Utilities">Utilities</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>

          {/* Payment Method */}
          <div>
            <Label htmlFor="paymentMethod">Payment Method*</Label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className={INPUT_CLASS_NAME}
            >
              <option value="">Select a payment method</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Wallets">Wallets</option>
              <option value="Crypto">Crypto</option>
            </select>
            {errors.paymentMethod && <p className="text-red-500 text-xs mt-1">{errors.paymentMethod}</p>}
          </div>

          {/* Start Date */}
          <div className="relative">
            <Label htmlFor="startDate">Start Date*</Label>
            <input
              type="text"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onFocus={() => setShowCalendar(true)}
              readOnly
              className={INPUT_CLASS_NAME}
            />
            {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
            {showCalendar && (
              <div className="absolute z-10 mt-2">
                <Calendar
  onChange={(value: Value) => handleDateChange(value)}
  value={formData.startDate ? new Date(formData.startDate) : new Date()}
/>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 px-2">
          <Button onClick={handleSubmit}>
            Add Subscription
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddSubscriptionForm;
