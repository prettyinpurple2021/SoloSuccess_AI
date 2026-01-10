"use client";

import { useState } from "react";
import { Button} from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import { Input} from "@/components/ui/input";
import { Label} from "@/components/ui/label";
import { Alert, AlertDescription} from "@/components/ui/alert";
import { Mail, AlertCircle, CheckCircle} from "lucide-react";
import Link from "next/link";

export default function AccountRecoveryClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setMessage(data.message || "If an account with this email exists, a password reset link has been sent.");
      setEmail(""); // Clear the input field
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-neon-purple/50 shadow-[0_0_20px_rgba(179,0,255,0.3)] rounded-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold font-orbitron uppercase tracking-wider bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
            Forgot Your Password?
          </CardTitle>
          <CardDescription className="text-gray-300 font-mono">
            No problem. Enter your email below and we&apos;ll send you a link to reset it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordResetRequest} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold font-mono text-neon-cyan uppercase tracking-wider">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  placeholder="you@your-empire.com"
                  required
                  className="pl-10 bg-dark-card border-2 border-gray-700 text-white placeholder:text-gray-500 focus:border-neon-cyan focus:ring-neon-cyan/20 rounded-sm font-mono"
                />
              </div>
            </div>
            
            {message && (
              <Alert variant="success" className="bg-neon-lime/10 border-2 border-neon-lime/50 rounded-sm">
                <CheckCircle className="h-4 w-4 text-neon-lime" />
                <AlertDescription className="text-neon-lime font-mono">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="error">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              variant="cyan"
              className="w-full font-mono font-bold uppercase tracking-wider"
              disabled={loading}
            >
              {loading ? "Sending..." : "🚀 Send Reset Link"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/signin" className="text-sm font-medium text-neon-purple hover:text-neon-cyan font-mono transition-colors">
              Remembered your password? Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

