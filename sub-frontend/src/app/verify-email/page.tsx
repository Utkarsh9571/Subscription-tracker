// src/app/(full-width-pages)/(auth)/verify-email/page.tsx
import { Suspense } from "react";
import VerifyEmailWrapper from "./VerifyEmailWrapper";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading verification page...</div>}>
      <VerifyEmailWrapper />
    </Suspense>
  );
}