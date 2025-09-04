"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

// Define the props for the AuthGuard component
interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Check for the token once the component mounts
    const token = localStorage.getItem("token");

    if (token) {
      // If a token exists, set the user as authenticated
      setIsAuthenticated(true);
    } else {
      // If no token exists, redirect the user
      router.push("/");
    }
    
    // Mark that the check has been completed
    setHasChecked(true);
  }, [router]);

  // If the check has not been completed yet, show a loading state
  if (!hasChecked) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Once the check is complete, render the children only if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If the user is not authenticated, we return null after the check
  // as the redirect has already happened.
  return null;
}
