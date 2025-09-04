"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export default function VerifyEmailWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setMessage("Invalid verification link.");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5500/api/v1/auth/verify-email?token=${token}`
        );

        if (response.data.success) {
          localStorage.setItem("token", response.data.token);
          setMessage("Email verified successfully! Redirecting you now...");

          setTimeout(() => {
            router.push("/subscriptions");
          }, 2000);
        } else {
          setMessage(response.data.message || "Verification failed. Please try again.");
        }
      } catch (error) {
        console.error("Verification failed:", error);
        setMessage("An error occurred during verification. The link may be invalid or expired.");
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-center">{message}</h1>
    </div>
  );
}