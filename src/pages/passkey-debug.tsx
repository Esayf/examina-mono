import React, { useState, useEffect } from "react";
import {
  registerPasskey,
  authenticateWithPasskey,
  isPasskeySupported,
  hasRegisteredPasskey,
  handlePasskeyAction,
} from "@/hooks/passkey";

export default function PasskeyDebugPage() {
  const [username, setUsername] = useState("testuser");
  const [displayName, setDisplayName] = useState("Test User");
  const [isSupported, setIsSupported] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasPasskey, setHasPasskey] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // Add a log message
  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toISOString().split("T")[1].split(".")[0]}: ${message}`,
    ]);
  };

  useEffect(() => {
    // Check if passkeys are supported
    try {
      const supported = isPasskeySupported();
      setIsSupported(supported);
      addLog(`Passkey support detected: ${supported}`);
    } catch (error) {
      addLog(`Error checking support: ${error}`);
      setIsSupported(false);
    } finally {
      setIsChecking(false);
    }

    // Log navigator and environment info
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      vendor: navigator.vendor,
      secure: window.isSecureContext,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      apiUrl: apiUrl,
      rpID: process.env.NEXT_PUBLIC_RP_ID || "localhost",
      origin: process.env.NEXT_PUBLIC_ORIGIN || "http://localhost:3000",
    };
    addLog(`Environment info: ${JSON.stringify(info)}`);
  }, []);

  const checkForPasskeys = async () => {
    addLog(`Checking for passkeys for ${username}`);
    try {
      const exists = await hasRegisteredPasskey(username);
      setHasPasskey(exists);
      addLog(`Passkeys exist for ${username}: ${exists}`);
    } catch (error) {
      addLog(`Error checking passkeys: ${error}`);
    }
  };

  const handleRegister = async () => {
    addLog(`Starting registration for ${username}`);
    try {
      const success = await registerPasskey(username, displayName);
      addLog(`Registration result: ${success ? "Success" : "Failed"}`);
      if (success) {
        setHasPasskey(true);
      }
    } catch (error) {
      addLog(`Registration error: ${error}`);
    }
  };

  const handleAuthenticate = async () => {
    addLog("Starting authentication");
    try {
      const success = await authenticateWithPasskey(username);
      addLog(`Authentication result: ${success ? "Success" : "Failed"}`);
    } catch (error) {
      addLog(`Authentication error: ${error}`);
    }
  };

  const handleSmartAction = async () => {
    addLog(`Starting smart passkey action for ${username}`);
    try {
      const success = await handlePasskeyAction(username, displayName);
      addLog(`Smart action result: ${success ? "Success" : "Failed"}`);
      if (success) {
        setHasPasskey(true);
      }
    } catch (error) {
      addLog(`Smart action error: ${error}`);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Passkey Debug</h1>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <p>Passkey Support: {isChecking ? "Checking..." : isSupported ? "Yes" : "No"}</p>
        <p>API URL: {apiUrl}</p>
        <p>RP ID: {process.env.NEXT_PUBLIC_RP_ID || "localhost"}</p>
        <p>Origin: {process.env.NEXT_PUBLIC_ORIGIN || "http://localhost:3000"}</p>
        <p>Has Passkey: {hasPasskey === null ? "Unknown" : hasPasskey ? "Yes" : "No"}</p>
        <button
          onClick={checkForPasskeys}
          className="mt-2 bg-gray-500 text-white px-3 py-1 rounded text-sm"
        >
          Check for Passkeys
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Register</h2>
          <div className="mb-3">
            <label className="block mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          <button
            onClick={handleRegister}
            disabled={!isSupported}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Register Passkey
          </button>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Authenticate</h2>
          <p className="mb-3">Attempt to authenticate with a passkey</p>
          <button
            onClick={handleAuthenticate}
            disabled={!isSupported}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Authenticate
          </button>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Smart Action</h2>
          <p className="mb-3">Auto-detect whether to register or authenticate</p>
          <button
            onClick={handleSmartAction}
            disabled={!isSupported}
            className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Smart Passkey Action
          </button>
        </div>
      </div>

      <div className="bg-black text-white p-4 rounded h-64 overflow-auto">
        <h2 className="text-xl font-semibold mb-2">Logs</h2>
        <pre className="text-sm">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </pre>
      </div>
    </div>
  );
}
