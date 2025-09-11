"use client";

// @ts-nocheck

import React, { useState, FormEvent, ChangeEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';


// Type declarations for the Google Sign-In SDK
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

interface CredentialResponse {
  credential?: string;
  select_by?: string;
}

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

const EyeCloseIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M3.988 5.75c-.765 1.517-1.181 3.253-1.181 5.25a10.87 10.87 0 00.916 4.673c.123.23.256.45.398.665.485.733 1.103 1.488 1.838 2.213a.75.75 0 001.06-1.06c-.524-.523-1.02-1.077-1.47-1.662-.12-.158-.23-.31-.337-.457-.393-.564-.672-1.22-.843-1.933a9.29 9.29 0 010-3.328c.171-.714.45-1.37.843-1.933.107-.147.217-.29.337-.457.45-.585.946-1.14 1.47-1.662a.75.75 0 10-1.06-1.06c-.735.725-1.353 1.48-1.838 2.213-.142.215-.275.435-.398.665a10.87 10.87 0 01-.916 4.673 10.87 10.87 0 01.916 4.673c.123.23.256.435.398.665.485.733 1.103 1.488 1.838 2.213a.75.75 0 101.06-1.06c-.524-.523-1.02-1.077-1.47-1.662-.12-.158-.23-.31-.337-.457-.393-.564-.672-1.22-.843-1.933a9.29 9.29 0 010-3.328c.171-.714.45-1.37.843-1.933.107-.147.217-.29.337-.457.45-.585.946-1.14 1.47-1.662a.75.75 0 10-1.06-1.06z" />
    </svg>
  );
};

const SIGNUP_API_URL = `${API_BASE_URL}/api/v1/auth/sign-up`;
const RESEND_API_URL = `${API_BASE_URL}/api/v1/auth/resend-verification`;
const GOOGLE_AUTH_API_URL = `${API_BASE_URL}/api/v1/auth/google`;

export default function SignUpForm() {
  console.log('This component is rendering');

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState<string | null>(null);

  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstName) newErrors.firstName = "First name is required.";
    if (!formData.lastName) newErrors.lastName = "Last name is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email address is invalid.";
    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the form errors.");
      return;
    }

    setLoading(true);
    setEmailToVerify(null);

    const loadingToastId = toast.loading("Creating account...", { position: "top-center" });

    try {
      const response = await fetch(SIGNUP_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Sign up failed.");
      }
      
      toast.update(loadingToastId, {
        render: "Account created successfully! Please check your email for a verification link.",
        type: "success",
        isLoading: false,
        autoClose: 5000,
        closeOnClick: true
      });
      setEmailToVerify(formData.email);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast.update(loadingToastId, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeOnClick: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!emailToVerify) {
      toast.error("No email to resend verification to.");
      return;
    }
    setLoading(true);
    const loadingToastId = toast.loading("Resending verification email...", { position: "top-center" });

    try {
      const response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailToVerify }),
      });

      if (response.ok) {
        toast.update(loadingToastId, {
          render: "Verification email resent! Please check your inbox.",
          type: "success",
          isLoading: false,
          autoClose: 5000,
          closeOnClick: true
        });
      } else {
        const responseData = await response.json();
        throw new Error(responseData.message || "Failed to resend email.");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast.update(loadingToastId, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeOnClick: true
      });
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
            if (data.success && data.data && data.data.token) {
                localStorage.setItem('token', data.data.token);
                
                toast.update(loadingToastId, {
                  render: "Successfully signed in with Google!",
                  type: "success",
                  isLoading: false,
                  autoClose: 5000,
                  closeOnClick: true
                });
                
                router.push('/subscriptions');
            } else {
                throw new Error("Invalid response from the server.");
            }
        } else {
            throw new Error(data.message || "Failed to sign in with Google.");
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to communicate with the server.";
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
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!, 
          callback: handleGoogleCredentialResponse,
          auto_prompt: false,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signup-button"),
          { theme: "outline", size: "large", type: "standard", width: "215"  }
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
    const redirectUri = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI || 'http://localhost:3000/callback'; // <-- UPDATED REDIRECT URI
    const scopes = 'user:email';
    
    console.log('Client ID:', clientId);
    console.log('Redirect URI:', redirectUri);
    console.log('Requested Scopes:', scopes);

    const state = uuidv4();
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
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your details to create an account!
            </p>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 items-center justify-center">
              <div id="google-signup-button" className="inline-flex items-center justify-center"></div>

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
                Sign up with GitHub
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
            {!emailToVerify ? (
              <form onSubmit={handleSubmit}>
                {errors.global && (
                  <div className="mb-4 text-center text-red-500 font-medium">
                    {errors.global}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6">
                  <div>
                    <Label>
                      First Name <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      placeholder="Enter your first name"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label>
                      Last Name <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      placeholder="Enter your last name"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <Label>
                      Email <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      placeholder="info@gmail.com"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <Label>
                      Password <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
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
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <Button className="w-full" disabled={loading}>
                      {loading ? "Creating..." : "Sign up"}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="text-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Verification Required
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  A verification link has been sent to **{emailToVerify}**. Please check your inbox and click the link to activate your account.
                </p>
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-normal text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Resending..." : "Resend Verification Email"}
                </button>
              </div>
            )}
            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign In
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