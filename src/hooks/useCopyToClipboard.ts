import { useCallback, useState } from "react";

type CopiedValue = string | null;

type CopyFn = (text: string, timeout?: number) => Promise<boolean>;

export function useCopyToClipboard(): [CopiedValue, CopyFn] {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);

  const copy: CopyFn = useCallback(async (text, timeout = 2000) => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      return false;
    }

    // Try to save to clipboard then save it in the state if worked
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);

      if (timeout === 0) {
        return true;
      }
      // Clear the copied text after the timeout
      setTimeout(() => {
        setCopiedText(null);
      }, timeout);

      return true;
    } catch (error) {
      console.warn("Copy failed", error);
      setCopiedText(null);
      return false;
    }
  }, []);

  return [copiedText, copy];
}
