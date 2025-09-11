"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import API_BASE_URL from '@/lib/api';


export default function GithubCallbackWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      console.error('Missing code parameter from URL.');
      toast.error('Authentication failed. Please try again.');
      router.push('/signup');
      return;
    }

    const apiUrl = `${API_BASE_URL}/api/v1/auth/github`;

    const sendAuthCode = async () => {
      try {
        console.log(`Attempting to send code to your backend at: ${apiUrl}`);
        console.log('Sending request body with code:', code);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        console.log('Backend response status:', response.status);
        const data = await response.json();
        console.log('Backend response data:', data);

        if (response.ok && data.success && data.data?.token) {
          console.log('Backend token received. Saving to local storage.');
          localStorage.setItem('token', data.data.token);
          toast.success("Login successful!");
          router.push('/subscriptions');
        } else {
          console.error('Backend signin failed:', data.message || 'Unknown error');
          toast.error("Login failed. Please try again.");
          router.push('/signup');
        }
      } catch (error) {
        console.error('An error occurred during authentication callback:', error);
        toast.error('An error occurred. Please try again.');
        router.push('/signup');
      }
    };

    sendAuthCode();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className="text-xl font-semibold">Authenticating with GitHub...</p>
    </div>
  );
}