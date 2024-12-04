import { useSession } from "@/hooks/useSession";
import React from "react";
import { Toaster } from "react-hot-toast";

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
    <div>
      <main className="bg-brand-secondary-50">{children}</main>
      <Toaster position="top-left" />
    </div>
  );
}

export default Layout;
