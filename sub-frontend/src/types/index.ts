// src/types/index.ts

// Type definition for a single subscription object
export interface SubscriptionType {
  _id: string;
  name: string;
  price: number;
  currency: string;
  frequency: string;
  category: string;
  paymentMethod: string;
  status: "active" | "cancelled" | "paused" | "expired";
  startDate: string;
  renewalDate: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

// Props definition for the SubscriptionCard component
export interface SubscriptionCardProps {
  subscription: SubscriptionType;
  onCancel: () => void;
  onDelete: () => void;
}