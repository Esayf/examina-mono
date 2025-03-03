"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerPasskey, isPasskeySupported } from "@/hooks/passkey";
import { KeyIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface PasskeyRegistrationProps {
  onSuccess?: () => void;
  className?: string;
}

export function PasskeyRegistration({ onSuccess, className = "" }: PasskeyRegistrationProps) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    // Check if passkeys are supported in this browser
    setIsSupported(isPasskeySupported());
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !displayName) {
      toast.error("Username and display name are required.");
      return;
    }

    setIsRegistering(true);

    try {
      const success = await registerPasskey(username, displayName);
      if (success && onSuccess) {
        onSuccess();
      }
    } finally {
      setIsRegistering(false);
    }
  };

  if (!isSupported) {
    return (
      <div
        className={`p-6 rounded-lg bg-brand-secondary-100 border border-brand-primary-300 ${className}`}
      >
        <div className="flex flex-col items-center text-center gap-3">
          <KeyIcon className="w-12 h-12 text-brand-primary-500" />
          <h2 className="text-xl font-medium">Passkeys Not Supported</h2>
          <p className="text-sm text-gray-600 max-w-sm">
            Your browser doesn't support passkeys. Please use a modern browser like Chrome, Safari,
            or Firefox to register a passkey.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-6 rounded-lg bg-brand-secondary-100 border border-brand-primary-300 ${className}`}
    >
      <div className="mb-4">
        <h2 className="text-xl font-medium mb-2">Register Passkey</h2>
        <p className="text-sm text-gray-600">
          Create a passkey to securely access your account without remembering a password.
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
            className="border-brand-primary-300"
          />
        </div>

        <div>
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your display name"
            required
            className="border-brand-primary-300"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-brand-primary-900 hover:bg-brand-primary-800 text-brand-secondary-50"
          disabled={isRegistering}
        >
          {isRegistering ? "Registering..." : "Register Passkey"}
        </Button>
      </form>

      <div className="mt-4 text-xs text-gray-500">
        <p>
          Note: Passkeys are stored securely on your device and cannot be lost or forgotten like
          passwords.
        </p>
      </div>
    </div>
  );
}
