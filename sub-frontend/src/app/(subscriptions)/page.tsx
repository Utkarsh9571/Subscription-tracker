import AuthGuard from "@/components/AuthGuard/AuthGuard";
import SubscriptionsList from "@/components/subscription/subscriptionsList";

export default function SubscriptionsDashboard() {
  return (
    <AuthGuard>
      <div className="flex flex-col flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          My Subscriptions
        </h1>
        <SubscriptionsList />
      </div>
    </AuthGuard>
  );
}
