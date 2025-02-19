import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { logout } from "@/lib/Client/Auth";
import { ConfirmLogoutModal } from "./confirm-logout-modal";

export const LogoutButton: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      window.location.replace(window.location.origin);
    } catch (error) {
      toast.error("Logout failed. Please try again!");
    }
  };

  return (
    <>
      {/* Mobil (md'den küçük) => Yazılı, size="default" */}
      <div className="md:hidden">
        <Button
          variant="outline"
          size="default"
          pill
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 w-[158px] justify-between"
        >
          Logout
          <ArrowRightEndOnRectangleIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Desktop (md ve üzeri) => Sadece ikon, size="icon" */}
      <div className="hidden md:block">
        <Button
          variant="outline"
          size="icon"
          className="hover:bg-brand-secondary-200"
          pill
          onClick={() => setShowConfirm(true)}
        >
          <ArrowRightEndOnRectangleIcon className="w-6 h-6" />
        </Button>
      </div>

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
