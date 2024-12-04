import Image from "next/image";
import { logout } from "@/lib/Client/Auth";
import toast from "react-hot-toast";

// Images
import Choz from "@/images/landing-header/choz.svg";
import Logout from "@/icons/arrow-right-start-on-rectangle.svg";
import Link from "next/link";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";

// Hooks
import { useAppSelector } from "@/app/hooks";
import { hasActiveSession } from "@/features/client/session";

import { Button } from "@/components/ui/button";

function DashboardHeader({ withoutNav = false }) {
  const session = useAppSelector((state) => state.session);
  const isConnected = useAppSelector(hasActiveSession);

  return (
    <div className="bg-white border-b border-gray-300">
      <div className="w-full flex justify-between items-center py-4 px-8">
        <Link href="/">
          <Image src={Choz} alt="" className="mr-16" />
        </Link>
        {withoutNav === false && (
          <div>
            <p className="text-brand-primary-950 text-base leading-7 no-underline font-book">
              Quizzes
            </p>
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-brand-secondary-100 border border-brand-primary-950 rounded-full">
            <a
              href={`https://minascan.io/mainnet/account/${session.session?.walletAddress}/`}
              target="_blank"
              className="text-base font-book leading-6 no-underline"
            >
              {isConnected &&
                `${session.session.walletAddress.slice(
                  0,
                  5
                )}...${session.session.walletAddress.slice(-5)}`}
            </a>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              logout().then(() => {
                toast.success("Logged out successfully");
                window.location.replace(window.location.origin);
              })
            }
            className="w-6 h-6 stroke-brand-primary-950 cursor-pointer hover:stroke-brand-primary-600 hover:bg-brand-primary-100 rounded-full p-2"
          >
            <ArrowRightStartOnRectangleIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
