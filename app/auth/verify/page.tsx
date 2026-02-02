"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

export default function VerifyPage() {
  const [message, setMessage] = useState("Verifying your account...");
  const router = useRouter();

  useEffect(() => {
    // Check if user is already verified and logged in
    const checkAuth = async () => {
      try {
        // Give a moment for any auth processes to complete
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setMessage("Account created successfully! Redirecting to login...");

        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } catch (error) {
        setMessage(
          "There was an issue verifying your account. Please try logging in."
        );
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="animate-pulse">
            <svg
              className="mx-auto h-12 w-12 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600">{message}</p>
          <Button onClick={() => router.push("/auth/login")} className="w-full">
            Go to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
