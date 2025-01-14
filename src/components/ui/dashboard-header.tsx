import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import router, { useRouter } from "next/router";

// Icons
import { ArrowUpRightIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
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

  return (
    <div className="bg-brand-secondary-50 border-b border-greyscale-light-200">
      <div className="w-full flex justify-between items-center py-2 lg:py-4 px-4 lg:px-8">
        <div className="cursor-pointer" onClick={() => {}}>
          <Image src={Choz} alt="Choz Logo" />
        </div>

        {/* NAV (Desktop) */}
        {!withoutNav && (
          <div className="gap-4 hidden md:flex">
            <Link href="/app/dashboard/created">
              <Button
                variant="link"
                className="text-brand-primary-950 text-base no-underline font-book"
              >
                Go to dashboard
              </Button>
            </Link>
          </div>
        )}

        {/* TABS (Desktop) */}
        {!withoutTabs && (
          <div className="items-center gap-4 justify-center hidden md:flex">
            <Button
              disabled
              variant="link"
              size="default"
              className={cn(
                "rounded-full",
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
              pill
              className="rounded-full text-brand-primary-950 hover:bg-brand-secondary-200"
              onClick={() => setActiveTab("created")}
            >
              Created
            </Button>
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Wallet address (Desktop) */}
          {isConnected && session.session?.walletAddress && (
            <Button
              variant="outline"
              size="default"
              icon={false}
              className="hidden md:block border-2 border-brand-primary-950 hover:bg-brand-primary-200 rounded-full"
            >
              <a
                href={`https://minascan.io/mainnet/account/${session.session.walletAddress}/`}
                target="_blank"
                rel="noreferrer"
                className="text-md font-book text-brand-primary-950 no-underline"
              >
                {session.session.walletAddress.slice(0, 5)}...
                {session.session.walletAddress.slice(-5)}
              </a>
            </Button>
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
            className="text-brand-primary-950 focus:outline-none md:hidden"
          >
            {menuOpen ? <XMarkIcon className="w-8 h-8" /> : <Bars3Icon className="w-8 h-8" />}
          </Button>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="absolute top-20 right-4 w-48 z-50 shadow-lg bg-brand-primary-400 rounded-3xl border border-brand-primary-950">
              <div className="flex flex-col items-start p-4 gap-4">
                <Button
                  variant="outline"
                  className="w-full  bg-brand-secondary-50 text-left text-brand-primary-950"
                  icon={false}
                  pill
                  size="default"
                  onClick={() => {
                    window.location.href = "/app/dashboard/created";
                    setMenuOpen(false);
                  }}
                >
                  Created quizzes
                </Button>

                <Button
                  variant="outline"
                  disabled
                  className="w-full  bg-brand-secondary-50 text-left text-brand-primary-950"
                  icon={false}
                  pill
                  size="default"
                  onClick={() => {
                    window.open("https://choz.medium.com/", "_blank");
                    setMenuOpen(false);
                  }}
                >
                  Joined quizzes
                </Button>

                {/* Logout button (Mobile) */}
                <Button
                  variant="default"
                  pill
                  className="w-full bg-brand-secondary-50 text-brand-primary-950 flex items-center justify-between"
                  onClick={() => {
                    setMenuOpen(false);
                    // Use LogoutButton's logic or your direct logout call
                    // e.g., logout().then(() => window.location.replace("/"));
                  }}
                >
                  Logout
                  <ArrowUpRightIcon className="w-4 h-4" />
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
