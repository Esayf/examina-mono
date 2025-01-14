import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftEndOnRectangleIcon, ArrowRightEndOnRectangleIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { logout } from "@/lib/Client/Auth";
import { ConfirmLogoutModal } from "./confirm-logout-modal";

export const LogoutButton: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      // Örnek: anasayfaya yönlendirme
      window.location.replace(window.location.origin);
    } catch (error) {
      toast.error("Logout failed. Please try again!");
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        pill
        onClick={() => setShowConfirm(true)}
      >
        <ArrowRightEndOnRectangleIcon className="w-6 h-6" />
      </Button>

      <ConfirmLogoutModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          setShowConfirm(false);
          handleLogout();
        }}
      />
    </>
  );
};
