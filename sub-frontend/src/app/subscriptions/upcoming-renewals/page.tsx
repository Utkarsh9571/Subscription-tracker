"use client";

import React from "react";
import UpcomingRenewalsList from "@/components/subscription/UpcomingRenewalsList";
import { Suspense } from 'react';

export default function UpcomingRenewalsPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Suspense fallback={<div>Loading...</div>}>
        <UpcomingRenewalsList />
      </Suspense>
    </div>
  );
}
