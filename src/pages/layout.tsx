import { useSession } from "@/hooks/useSession";
import React from "react";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";

// Components

// Custom hooks
// ! - This is a custom hook that is not yet implemented
// import { useContractStatus } from '../../hooks/useContractStatus';

type Props = {
  children: React.ReactNode;
};

function Layout({ children }: Props) {
  useSession();
  return (
    <main className="bg-brand-secondary-100">
      {children}
      <Toaster position="top-left" />
    </main>
  );
}

export default Layout;
