import Image from "next/image";
import { logout } from "@/lib/Client/Auth";
import toast from "react-hot-toast";

// Images
import Choz from "@/icons/choz.svg";
import Logout from "@/icons/arrow-right-start-on-rectangle.svg";
import Link from "next/link";
import { useAppSelector } from "@/app/hooks";
import { hasActiveSession } from "@/features/client/session";

function DashboardHeader({ withoutNav = false }) {
  const session = useAppSelector((state) => state.session);
  const isConnected = useAppSelector(hasActiveSession);

  return (
    <div className="bg-white border-b border-gray-300">
      <div className="w-full max-w-[76rem]  mx-auto flex justify-between items-center py-4 px-0">
        <Link href="/">
          <Image src={Choz} alt="" className="mr-16" />
        </Link>
        {withoutNav === false && (
          <div>
            <p className="text-dark-blue-black text-lg leading-7 tracking-tight no-underline font-bold">
              Quizzes
            </p>
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
            <a
              href={`https://minascan.io/mainnet/account/${session.session?.walletAddress}/`}
              target="_blank"
              className="text-base font-medium leading-6 no-underline"
            >
              {isConnected &&
                `${session.session.walletAddress.slice(
                  0,
                  5
                )}...${session.session.walletAddress.slice(-5)}`}
            </a>
          </div>
          <Image
            src={Logout}
            alt=""
            onClick={() =>
              logout().then(() => {
                toast.success("Logged out successfully");
                window.location.replace("/");
              })
            }
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
