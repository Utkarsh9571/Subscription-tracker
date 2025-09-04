import { Suspense } from 'react';
import GithubCallbackWrapper from './GithubCallbackWrapper';

export default function GithubCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    }>
      <GithubCallbackWrapper />
    </Suspense>
  );
}