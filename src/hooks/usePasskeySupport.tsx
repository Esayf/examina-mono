import { useState, useEffect } from "react";
import { isPasskeySupported } from "./passkey";

/**
 * A React hook that checks if passkeys are supported in the current browser
 *
 * @returns An object with isSupported (boolean) indicating passkey support
 */
export function usePasskeySupport() {
  const [isSupported, setIsSupported] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // In some environments like SSR, window might not be available initially
    // Only check for passkey support in the browser environment
    const checkSupport = () => {
      try {
        setIsSupported(isPasskeySupported());
      } catch (error) {
        console.error("Error checking passkey support", error);
        setIsSupported(false);
      } finally {
        setIsChecking(false);
      }
    };

    if (typeof window !== "undefined") {
      checkSupport();
    } else {
      // If not in browser environment, mark as not supported
      setIsSupported(false);
      setIsChecking(false);
    }
  }, []);

  return {
    isSupported,
    isChecking,
  };
}
