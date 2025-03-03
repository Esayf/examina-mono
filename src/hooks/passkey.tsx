import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
} from "@simplewebauthn/browser";
import axios from "axios";
import toast from "react-hot-toast";
import { setSession } from "@/features/client/session";
import { store } from "@/app/store";

// API base URL - update this to point to your backend server
const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";

// Function to check if the user has any registered passkeys
export async function hasRegisteredPasskey(username?: string): Promise<boolean> {
  try {
    console.log("Checking for existing passkeys", username ? `for: ${username}` : "");

    // Query the server to check if there are registered passkeys
    const response = await axios.post(`${API_BASE_URL}/passkey/credentials-exist`, {
      ...(username ? { username } : {}),
    });

    return response.data.exists;
  } catch (error) {
    console.error("Error checking for existing passkeys:", error);
    // If there's an error, assume no passkeys exist to be safe
    return false;
  }
}

// Function to register a new passkey
export async function registerPasskey(username: string, displayName: string): Promise<boolean> {
  try {
    console.log("Starting passkey registration for:", username);

    // 1. Get registration options from the server
    console.log("Fetching registration options from server...");
    const optionsResponse = await axios.post(`${API_BASE_URL}/passkey/register-options`, {
      username,
      displayName,
    });

    console.log("Registration options received:", JSON.stringify(optionsResponse.data, null, 2));

    // 2. Start the WebAuthn registration process
    console.log("Starting WebAuthn registration process...");
    const registrationResponse = await startRegistration(optionsResponse.data);

    console.log("Registration response received:", JSON.stringify(registrationResponse, null, 2));

    // 3. Verify the registration with the server
    const verifyResponse = await axios.post(`${API_BASE_URL}/passkey/register-verify`, {
      username,
      response: registrationResponse,
    });

    // 4. Check if verification was successful
    if (verifyResponse.data.verified) {
      toast.success("Passkey registered successfully!");

      // If the server returned a session, update it
      if (verifyResponse.data.session) {
        store.dispatch(setSession(verifyResponse.data.session));
      }

      return true;
    } else {
      throw new Error("Passkey verification failed");
    }
  } catch (error) {
    console.error("Error registering passkey:", error);
    let errorMessage = "Failed to register passkey";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data.message || errorMessage;
    }

    toast.error(errorMessage);
    return false;
  }
}

// Function to authenticate with passkey
export async function authenticateWithPasskey(username?: string): Promise<boolean> {
  try {
    console.log("Starting passkey authentication", username ? `for: ${username}` : "");

    // 1. Get authentication options from the server
    const optionsResponse = await axios.post(`${API_BASE_URL}/passkey/auth-options`, {
      // Optionally include username if provided
      ...(username ? { username } : {}),
    });

    console.log("Authentication options received:", optionsResponse.data);

    // 2. Start the WebAuthn authentication process
    const authenticationResponse = await startAuthentication(optionsResponse.data);

    console.log("Authentication response received:", authenticationResponse);

    // 3. Verify the authentication with the server
    const verifyResponse = await axios.post(`${API_BASE_URL}/passkey/auth-verify`, {
      response: authenticationResponse,
    });

    // 4. Check if verification was successful and get session
    if (verifyResponse.data.verified && verifyResponse.data.token) {
      // 5. Update Redux store with session data
      store.dispatch(setSession(verifyResponse.data.token));

      toast.success("Authentication successful!", {
        duration: 15000,
        className: "chozToastSuccess",
      });

      return true;
    } else {
      throw new Error("Authentication failed");
    }
  } catch (error) {
    console.error("Error authenticating with passkey:", error);
    let errorMessage = "Failed to authenticate with passkey";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data.message || errorMessage;
    }

    toast.error(errorMessage);
    return false;
  }
}

// Combined function to handle both registration and authentication
export async function handlePasskeyAction(
  username?: string,
  displayName?: string
): Promise<boolean> {
  try {
    // Check if the user has any registered passkeys
    const hasPasskey = await hasRegisteredPasskey(username);

    if (hasPasskey) {
      // If passkeys exist, authenticate
      console.log("Existing passkeys found, proceeding with authentication");
      return await authenticateWithPasskey(username);
    } else {
      // If no passkeys exist and we have username/displayName, register
      if (username && displayName) {
        console.log("No passkeys found, proceeding with registration");
        return await registerPasskey(username, displayName);
      } else {
        // We need username/displayName for registration
        toast.error("Please provide a username to create a passkey");
        return false;
      }
    }
  } catch (error) {
    console.error("Error handling passkey action:", error);
    toast.error("Failed to process passkey action");
    return false;
  }
}

// Function to check if passkey is supported in the current browser
export function isPasskeySupported(): boolean {
  return window && typeof window !== "undefined" && browserSupportsWebAuthn();
}
