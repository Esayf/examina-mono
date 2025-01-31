import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

interface UseUnsavedChangesProps {
  isDirty: boolean;
  isSubmitted?: boolean;
  message?: string;
}

export function useUnsavedChanges({
  isDirty,
  isSubmitted = false,
  message = "You have unsaved changes. Are you sure you want to leave?"
}: UseUnsavedChangesProps) {
  const router = useRouter();
  const isNavigatingToEdit = useRef(false);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Skip warning if navigating to edit page (draft save case)
      if (url.includes('/app/exams/edit/')) {
        isNavigatingToEdit.current = true;
        return;
      }

      if (isDirty && !isSubmitted) {
        const confirmation = window.confirm(message);
        if (!confirmation) {
          router.events.emit("routeChangeError", "Route change aborted.", url, { shallow: false });
          throw "Route change aborted.";
        }
      }
    };

    const handleRouteChangeError = (err: any) => {
      if (err !== "Route change aborted.") return;
      window.history.pushState(null, '', router.asPath);
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSubmitted && !isNavigatingToEdit.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    router.events.on("routeChangeStart", handleRouteChange);
    router.events.on("routeChangeError", handleRouteChangeError);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
      router.events.off("routeChangeError", handleRouteChangeError);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      isNavigatingToEdit.current = false;
    };
  }, [isDirty, isSubmitted, message, router]);
} 