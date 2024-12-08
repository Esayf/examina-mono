import Image from "next/image";
import { logout } from "@/lib/Client/Auth";
import toast from "react-hot-toast";

// Images
import Choz from "@/images/landing-header/choz.svg";
import Logout from "@/icons/arrow-right-start-on-rectangle.svg";
import Link from "next/link";
import { ArrowRightStartOnRectangleIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";

// Hooks
import { useAppSelector } from "@/app/hooks";
import { hasActiveSession } from "@/features/client/session";

import { Button } from "@/components/ui/button";

function DashboardHeader({ withoutNav = false }) {
  const session = useAppSelector((state) => state.session);
  const isConnected = useAppSelector(hasActiveSession);

  return (
    <div className="bg-brand-secondary-50 border-b border-greyscale-light-200">
      <div className="w-full flex justify-between items-center py-2 lg:py-4 px-4 lg:px-8">
        <Link href="/">
          <Image src={Choz} alt="" className="mr-16" />
        </Link>
        {withoutNav === false && (
          <div>
            <Button
            variant="link"
            icon={true}
            iconPosition="right"
            className="text-brand-primary-950 text-base leading-7 no-underline font-book"
            onClick={() => {
              window.location.href = "/app";
            }}
          >
            <span className="hidden sm:block">Go to dashboard</span> <ArrowUpRightIcon className="size-5" />
          </Button> 
          </div>
        )}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="default"
            icon={true}
            iconPosition="right"
            className="hidden md:block bg-brand-secondary-100 border-2 border-brand-primary-950 hover:bg-brand-secondary-200 rounded-full"
          >
            <a
              href={`https://minascan.io/mainnet/account/${session.session?.walletAddress}/`}
              target="_blank"
              className="text-md font-book leadtext-brand-primary-950 inline-block align-middle text-nowrap no-underline"
            >
              {isConnected &&
                `${session.session.walletAddress.slice(
                  0,
                  5
                )}...${session.session.walletAddress.slice(-5)}`}
            </a>
          </Button>
          <Button
            variant="outline"
            size="icon"
            pill={true}
            onClick={() =>
              logout().then(() => {
                toast.success("Logged out successfully");
                window.location.replace(window.location.origin);
              })
            }
            className="border-2 border-brand-primary-950 hover:bg-brand-primary-200 p-2"
          >
            <ArrowRightStartOnRectangleIcon className="size-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
