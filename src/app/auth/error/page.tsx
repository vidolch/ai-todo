"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SignInButton } from "@/components/auth/sign-in-button";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      console.error("Authentication error:", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
          <p className="mt-2 text-gray-600">
            {error === "OAuthCreateAccount"
              ? "There was an error creating your account. Please try again."
              : "An error occurred during authentication. Please try again."}
          </p>
        </div>
        <div className="mt-8">
          <SignInButton />
        </div>
      </div>
    </div>
  );
} 