"use client";

import React from "react";
import { SubscriptionType, SubscriptionCardProps } from "@/types";

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onCancel,
  onDelete,
}) => {
  const { name, price, frequency, renewalDate, status } = subscription;

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const getStatusColor = (status: SubscriptionType["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      case "expired":
      case "paused":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 transition-transform transform hover:scale-[1.02] duration-200">
      <div className="flex-1 text-center md:text-left">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          ${price.toFixed(2)} / {frequency}
        </p>
      </div>

      <div className="flex-1 text-center md:text-left">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Next Renewal
        </p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          {formatDate(renewalDate)}
        </p>
        <div className="flex items-center mt-2">
          <span className={`w-3 h-3 rounded-full ${getStatusColor(status)} mr-2`}></span>
          <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
            {status}
          </span>
        </div>
      </div>

      <div className="flex space-x-2">
        {status === "active" ? (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={onDelete}
            className="px-4 py-2 text-sm font-medium rounded-lg text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCard;