// src/components/ToastContainer/ToastProvider.tsx

"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React from "react";

const ToastProvider = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      // The high z-index with !important should fix the issue
      className="z-[99999] fixed !important"
      theme="colored"
    />
  );
};

export default ToastProvider;