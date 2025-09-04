"use client";

import React, { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNotifications } from '@/context/NotificationContext';

interface CredentialResponse {
  credential?: string;
  select_by?: string;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: CredentialResponse) => void; auto_prompt: boolean }) => void;
          renderButton: (element: HTMLElement | null, config: { theme?: string; size?: string; type?: string; width?: string }) => void;
        };
      };
    };
  }
};


const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className="w-full h-11 px-4 text-sm font-normal transition-all rounded-lg outline-none text-gray-800 dark:text-white/80 dark:bg-gray-800 bg-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-brand-500"
  />
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="text-sm font-normal text-gray-700 dark:text-white/90">
    {children}
  </label>
);

const Button: React.FC<{ children: React.ReactNode, disabled?: boolean, className?: string }> = ({ children, disabled, className }) => (
  <button
    type="submit"
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-3 w-full px-7 py-3 text-sm font-normal text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-600 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
  >
    {children}
  </button>
);

// Eye icons for password visibility toggle
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="currentColor"
    {...props}
  >
<g id="style=bulk">
<g id="eye-open">
<path id="vector (Stroke)" fillRule="evenodd" clipRule="evenodd" d="M2.28282 9.27342C4.69299 5.94267 8.19618 3.96997 12.0001 3.96997C15.8042 3.96997 19.3075 5.94286 21.7177 9.27392C22.2793 10.0479 22.5351 11.0421 22.5351 11.995C22.5351 12.948 22.2792 13.9424 21.7174 14.7165C19.3072 18.0473 15.804 20.02 12.0001 20.02C8.19599 20.02 4.69264 18.0471 2.28246 14.716C1.7209 13.942 1.46509 12.9478 1.46509 11.995C1.46509 11.0419 1.721 10.0475 2.28282 9.27342Z" fill="#BFBFBF"/>
<path id="vector" d="M15.0001 12C15.0001 13.6592 13.6593 15 12.0001 15C10.3409 15 9.00012 13.6592 9.00012 12C9.00012 10.3408 10.3409 9 12.0001 9C13.6593 9 15.0001 10.3408 15.0001 12Z" fill="#000000"/>
<path id="vector (Stroke)_2" fillRule="evenodd" clipRule="evenodd" d="M12.0001 9.75C10.7551 9.75 9.75012 10.755 9.75012 12C9.75012 13.245 10.7551 14.25 12.0001 14.25C13.2451 14.25 14.2501 13.245 14.2501 12C14.2501 10.755 13.2451 9.75 12.0001 9.75ZM8.25012 12C8.25012 9.92657 9.92669 8.25 12.0001 8.25C14.0736 8.25 15.7501 9.92657 15.7501 12C15.7501 14.0734 14.0736 15.75 12.0001 15.75C9.92669 15.75 8.25012 14.0734 8.25012 12Z" fill="white"/>
</g>
</g>
</svg>
);

const EyeCloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 30 30" 
    fill="currentColor"
    {...props}
  >

  <path fill="#535358" d="M22 16a1 1 0 10-2 0h2zm-6 4a1 1 0 100 2v-2zm-6-4a1 1 0 102 0h-2zm6-4a1 1 0 100-2v2zm-2.776 11.68a1 1 0 00-.448 1.95l.448-1.95zm-7.9-2.007a1 1 0 001.351-1.475l-1.35 1.475zM19.242 8.436a1 1 0 00.518-1.932l-.518 1.932zm7.358 1.822a1 1 0 10-1.34 1.484l1.34-1.484zM28 16c0 .464-.243 1.203-.853 2.116-.593.888-1.471 1.845-2.578 2.727C22.351 22.611 19.314 24 16 24v2c3.866 0 7.329-1.611 9.816-3.593 1.246-.993 2.271-2.099 2.994-3.18C29.515 18.172 30 17.037 30 16h-2zM4 16c0-.464.243-1.203.853-2.116.593-.888 1.471-1.845 2.578-2.727C9.649 9.389 12.686 8 16 8V6c-3.866 0-7.329 1.611-9.816 3.593-1.246.993-2.271 2.098-2.994 3.18C2.485 13.828 2 14.963 2 16h2zm16 0a4 4 0 01-4 4v2a6 6 0 006-6h-2zm-8 0a4 4 0 014-4v-2a6 6 0 00-6 6h2zm4 8c-.952 0-1.881-.114-2.776-.32l-.448 1.95c1.031.236 2.111.37 3.224.37v-2zm0-16c1.118 0 2.205.158 3.24.436l.52-1.932A14.489 14.489 0 0016 6v2zm9.258 3.742c.899.812 1.6 1.655 2.071 2.427.482.79.671 1.423.671 1.831h2c0-.928-.389-1.93-.963-2.872-.586-.962-1.42-1.95-2.438-2.87l-1.34 1.484zM6.675 20.198c-.878-.804-1.563-1.636-2.021-2.395C4.184 17.024 4 16.403 4 16H2c0 .917.38 1.906.941 2.836.573.95 1.389 1.926 2.384 2.837l1.35-1.475z"/>
  <path stroke="#535358" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 25L25 7"/>
</svg>
 
);

const API_URL = "http://192.168.29.162:5500/api/v1/auth/sign-in";
const GOOGLE_AUTH_API_URL = "http://192.168.29.162:5500/api/v1/auth/google";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addNotification } = useNotifications();

  useEffect(() => {
    const verificationStatus = searchParams.get("verification");
    if (verificationStatus === "success") {
      toast.success("Email verified successfully! You can now sign in.");
      addNotification("Your email has been verified. You can now sign in to your account!", "info");
    }
  }, [searchParams, addNotification]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Attempting to sign in with email:", email);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Response status:", response.status);

      if (response.status === 403) {
        toast.error("Your email is not verified. Please check your inbox or sign up again to receive a new verification link.");
        return;
      }

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || "An unexpected error occurred.");
      }

      const responseData = await response.json();
      const token = responseData.data?.token;

      if (!token) {
        throw new Error("No token received from server.");
      }

      console.log("Successfully received token. Setting localStorage...");
      localStorage.setItem('token', token);
      
      toast.success("Login successful!");
      console.log("Attempting to redirect to /subscriptions...");
      router.push("/subscriptions");

    } catch (error: unknown) {
      console.error("Sign-in error:", error);
      const message = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  
    useEffect(() => {
       const handleGoogleCredentialResponse = async (response: CredentialResponse) => {
      if (!response.credential) {
        console.error("No Google credential received.");
        return;
      }
  
      console.log("ID Token received:", response.credential);
      const loadingToastId = toast.loading("Signing in with Google...", { position: "top-center" });
  
      try {
          const res = await fetch(GOOGLE_AUTH_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: response.credential }),
          });
          const data = await res.json();
          if (res.ok) {
              // Correctly handle redirection and authentication
              if (data.success && data.data && data.data.token) {
                  // Save the JWT token to local storage
                  localStorage.setItem('token', data.data.token);
                  
                  toast.update(loadingToastId, {
                    render: "Successfully signed in with Google!",
                    type: "success",
                    isLoading: false,
                    autoClose: 5000,
                    closeOnClick: true
                  });
                  
                  // Redirect the user to the home page or a dashboard
                  router.push('/subscriptions');
              } else {
                  throw new Error("Invalid response from the server.");
              }
          } else {
              throw new Error(data.message || "Failed to sign in with Google.");
          }
      } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to communicate with the server.";
          console.error("Error sending token to backend:", error);
          toast.update(loadingToastId, {
            render: errorMessage,
            type: "error",
            isLoading: false,
            autoClose: 5000,
            closeOnClick: true
          });
      }
    };

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            // The updated line to get your client ID from the environment variable
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: handleGoogleCredentialResponse,
          auto_prompt: false,
          });
  
          window.google.accounts.id.renderButton(
            document.getElementById("google-signin-button"),
            { theme: "outline", size: "large", type: "standard",width: "215" }
          );
        }
      };
  
      document.head.appendChild(script);
  
      return () => {
        const existingScript = document.head.querySelector(`script[src="${script.src}"]`);
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
      };
    });

   const handleGitHubLogin = () => {
       console.log('--- Starting handleGitHubLogin ---');
       
       setGithubLoading(true);
       const githubLoadingToastId = toast.loading("Redirecting to GitHub...", { position: "top-center" });
   
       const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
       const redirectUri = 'http://localhost:3000/callback'; // <-- UPDATED REDIRECT URI
       const scopes = 'user:email';
       
       console.log('Client ID:', clientId);
       console.log('Redirect URI:', redirectUri);
       console.log('Requested Scopes:', scopes);
   
       const state = crypto.randomUUID();
       // Use a cookie to store the state so the server component can access it.
       document.cookie = `github_oauth_state=${state}; path=/; max-age=3600; secure;`;
       
       console.log('Generated and stored state in cookie:', state);
   
       const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&state=${state}`;
       
       console.log('Final authorization URL:', authUrl);
   
       toast.update(githubLoadingToastId, {
         render: "Redirecting...",
         type: "info",
         isLoading: false,
         autoClose: 2000,
         closeOnClick: true
       });
       
       console.log('Redirecting to GitHub in 3 seconds...');
       setTimeout(() => {
         window.location.href = authUrl;
       }, 3000);
       
       console.log('--- handleGitHubLogin finished ---');
     };


  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 items-center justify-center">
              <div id="google-signin-button" className="inline-flex items-center justify-center"></div>

              <button
                onClick={handleGitHubLogin}
                disabled={githubLoading}
                className="inline-flex items-center justify-center gap-3 py-2 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-sm px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="21"
                  height="20"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.6.111.82-.266.82-.591 0-.291-.01-1.06-.015-2.073-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.334-1.756-1.334-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.836 2.809 1.305 3.491.996.108-.775.419-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.467-2.381 1.236-3.22-.124-.301-.537-1.52.117-3.176 0 0 1.006-.322 3.3.996.955-.266 1.96-.399 2.964-.404 1.004.005 2.009.138 2.964.404 2.292-1.318 3.296-.996 3.296-.996.654 1.656.241 2.875.118 3.176.77.839 1.233 1.91 1.233 3.22 0 4.609-2.805 5.626-5.474 5.923.43.37.811 1.096.811 2.219 0 1.606-.015 2.895-.015 3.284 0 .329.217.712.827.594C20.569 21.79 24 17.29 24 12 24 5.373 18.627 0 12 0z"/>
                </svg>
                Sign in with GitHub
              </button>
            </div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                  Or
                </span>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="info@gmail.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                       Keep me logged in
                    </span>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <Button className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
              </div>
            </form>
            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
}
