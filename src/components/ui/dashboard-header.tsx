import Image from "next/image";
import { logout } from "@/lib/Client/Auth";
import toast from "react-hot-toast";

// Images
import Choz from "@/images/landing-header/choz.svg";
import Logout from "@/icons/arrow-right-start-on-rectangle.svg";
import Link from "next/link";
import {
  ArrowRightStartOnRectangleIcon,
  ArrowUpRightIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// Hooks
import { useAppSelector } from "@/app/hooks";
import { hasActiveSession } from "@/features/client/session";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

function DashboardHeader({ withoutNav = false, withoutTabs = false }) {
  const session = useAppSelector((state) => state.session);
  const isConnected = useAppSelector(hasActiveSession);
  const [activeTab, setActiveTab] = useState<"created" | "joined">("created");
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="bg-brand-secondary-50 border-b border-greyscale-light-200">
      <div className="w-full flex justify-between items-center py-2 lg:py-4 px-4 lg:px-8">
        <Link href="/">
          <Image src={Choz} alt="" className="mr-16" />
        </Link>
        {withoutNav === false && (
          <div className="gap-4">
            <Button
              variant="link"
              className="text-brand-primary-950 text-base leading-7 no-underline font-book hidden md:block"
              asChild
            >
              <Link href="/app">Go to dashboard</Link>
            </Button>
          </div>
        )}
        {withoutTabs === false && (
          <div className="flex items-center gap-4 justify-center">
            <Button
              disabled
              variant="link"
              size="default"
              className={cn(
                "rounded-full hidden md:block",
                activeTab === "joined"
                  ? "bg-brand-secondary-200 text-brand-primary-950 outline outline-brand-primary-950"
                  : "text-brand-primary-950 hover:bg-brand-secondary-200"
              )}
              onClick={() => setActiveTab("joined")}
            >
              Joined
            </Button>
            <Button
              variant="link"
              size="default"
              pill={true}
              className={cn(
                "rounded-full hidden md:block"
                /* activeTab === "created"
                  ? "bg-brand-secondary-200 text-brand-primary-950 outline outline-brand-primary-950"
                  : "text-brand-primary-950 hover:bg-brand-secondary-200"*/
              )}
              onClick={() => (window.location.href = "/app")}
            >
              Created
            </Button>
          </div>
        )}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="default"
            icon={false}
            className="hidden md:block border-2 border-brand-primary-950 hover:bg-brand-primary-200 rounded-full"
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
          <div className="hidden md:flex items-center">
            <Button
              variant="outline"
              size="icon"
              pill
              onClick={() =>
                logout().then(() => {
                  toast.success("Logged out successfully");
                  window.location.replace(window.location.origin);
                })
              }
            >
              <ArrowRightStartOnRectangleIcon className="w-6 h-6" />
            </Button>
          </div>

          <div className="md:hidden flex items-center">
            <Button
              onClick={() => setMenuOpen(!menuOpen)}
              variant="default"
              pill
              size="icon"
              className="text-brand-primary-950 focus:outline-none"
            >
              {menuOpen ? <XMarkIcon className="w-8 h-8" /> : <Bars3Icon className="w-8 h-8" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="absolute top-20 right-4 w-48 z-50 shadow-lg bg-brand-primary-400 rounded-3xl border border-brand-primary-950">
              <div className="flex flex-col items-start p-4 gap-4">
                <Button
                  className="w-full text-left text-brand-primary-950 bg-brand-secondary-200"
                  icon={false}
                  pill
                  size="default"
                  variant="default"
                  onClick={() => (window.location.href = "/app")}
                >
                  Created quizzes
                </Button>
                <Button
                  disabled
                  className="w-full text-brand-primary-950 bg-brand-secondary-200"
                  icon={false}
                  pill
                  size="default"
                  variant="default"
                  onClick={() => window.open("https://choz.medium.com/", "_blank")}
                >
                  Joined quizzes
                </Button>
                <Button
                  className="w-full bg-brand-secondary-200 text-brand-primary-950"
                  icon={true}
                  variant="default"
                  pill
                  size="default"
                  onClick={() =>
                    logout().then(() => {
                      toast.success("Logged out successfully");
                      window.location.replace(window.location.origin);
                    })
                  }
                >
                  Logout <ArrowUpRightIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
