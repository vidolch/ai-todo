"use client";

import { SignInButton } from "@/components/auth/sign-in-button";

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-8 border border-white/10 rounded-lg bg-white/5">
        <h1 className="text-3xl font-bold text-white text-center mb-8">Welcome to AI TODO</h1>
        <p className="text-gray-400 text-center mb-8">
          Sign in with your Google account to get started
        </p>
        <div className="flex justify-center">
          <SignInButton />
        </div>
      </div>
    </div>
  );
} 