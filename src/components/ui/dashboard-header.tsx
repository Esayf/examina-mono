import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import router, { useRouter } from "next/router";

// Icons
import {
  ArrowRightEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowUpRightIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Choz from "@/images/landing-header/choz.svg";

// Hooks
import { useAppSelector } from "@/app/hooks";
import { hasActiveSession } from "@/features/client/session";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Logout bileşenini içe aktarıyoruz:
import { LogoutButton } from "./logout-button";

interface DashboardHeaderProps {
  withoutNav?: boolean;
  withoutTabs?: boolean;
}

function DashboardHeader({ withoutNav = false, withoutTabs = false }: DashboardHeaderProps) {
  const session = useAppSelector((state) => state.session);
  const isConnected = useAppSelector(hasActiveSession);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"created" | "joined">("created");
  const [menuOpen, setMenuOpen] = useState(false);

  // CLOSE MENU AUTOMATICALLY WHEN RESIZING ABOVE BREAKPOINT
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function setShowConfirm(arg0: boolean): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="bg-brand-secondary-100 border-b border-b-brand-secondary-100">
      <div className="w-full flex justify-between items-center py-3 px-4 lg:px-8">
        {/* SOL: Logo */}
        <div
          className="flex-shrink-0"
          style={{ maxHeight: "52px", alignContent: "center", width: "229.26px" }}
        >
          <Image src={Choz} height={36} alt="Choz Logo" />
        </div>

        {/* NAV (Desktop) */}
        {!withoutNav && (
          <div className="gap-4 hidden md:flex">
            <Link href="/app/dashboard/created">
              <Button
                variant="link"
                className="text-gray-700 text-base no-underline font-book hover:text-brand-primary-950"
              >
                Go to dashboard
              </Button>
            </Link>
          </div>
        )}

        {/* TABS (Desktop) */}
        {!withoutTabs && (
          <div className="flex gap-2">
            <Button
              variant="link"
              size="default"
              className={cn(
                "rounded-full hidden md:block",
                "text-gray-700 font-book hover:text-brand-primary-950"
              )}
              onClick={() => router.push("/app/dashboard/joined")}
            >
              Joined
            </Button>

            <Button
              variant="link"
              size="default"
              className={cn(
                "rounded-full hidden md:block",
                "text-gray-700 font-book hover:text-brand-primary-950"
              )}
              onClick={() => router.push("/app/dashboard/created")}
            >
              Created
            </Button>
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Wallet address (Desktop) */}
          {isConnected && session.session?.walletAddress && (
            <>
              <Button
                variant="outline"
                size="default"
                icon={false}
                className="hidden md:block hover:bg-brand-secondary-200"
              >
                <a
                  href={`https://minascan.io/mainnet/account/${session.session.walletAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-md font-book text-gray-700 no-underline hover:text-brand-primary-950"
                >
                  {session.session.walletAddress.slice(0, 5)}...
                  {session.session.walletAddress.slice(-5)}
                </a>
              </Button>

              {/* Profil Butonu */}
              <Button
                variant="outline"
                size="default"
                icon={false}
                className="hidden md:block hover:bg-brand-secondary-200"
                onClick={() => router.push("/app/user/profile")}
                disabled
              >
                Profil
              </Button>
            </>
          )}

          {/* Logout button (Desktop) */}
          <div className="hidden md:flex items-center">
            <LogoutButton />
          </div>

          {/* Mobile menu toggler */}
          <Button
            onClick={() => setMenuOpen(!menuOpen)}
            variant="default"
            pill
            size="icon"
            className="text-brand-secondary-200 focus:outline-none md:hidden"
          >
            {menuOpen ? <XMarkIcon className="w-8 h-8" /> : <Bars3Icon className="w-8 h-8" />}
          </Button>

          {menuOpen && (
            <div className="absolute top-20 right-4 w-48 z-50 shadow-lg bg-white rounded-3xl border border-gray-200">
              <div className="flex flex-col items-start p-4 gap-4">
                <Button
                  variant="outline"
                  className="w-full bg-white text-left text-gray-700 justify-between hover:bg-brand-secondary-200"
                  icon={false}
                  pill
                  size="default"
                  onClick={() => {
                    router.push("/app/dashboard/created");
                    setMenuOpen(false);
                  }}
                >
                  Created
                  <ArrowUpRightIcon className="w-5 h-5"></ArrowUpRightIcon>
                </Button>

                <Button
                  variant="outline"
                  className="w-full bg-white text-left text-gray-700 justify-between hover:bg-brand-secondary-200"
                  icon={false}
                  pill
                  size="default"
                  onClick={() => {
                    router.push("/app/dashboard/joined");
                    setMenuOpen(false);
                  }}
                >
                  Joined
                  <ArrowUpRightIcon className="w-5 h-5"></ArrowUpRightIcon>
                </Button>

                {/* Logout button (Mobile) */}
                <div className="w-full flex items-center justify-between">
                  <LogoutButton />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
