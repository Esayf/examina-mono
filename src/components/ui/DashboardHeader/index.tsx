import styles from "@/styles/components/DashboardHeader.module.css";
import Image from "next/image";
import { useSelector } from "react-redux";
import { logout } from "@/lib/Client/Auth";
import toast from "react-hot-toast";

// Images
import Choz from "@/icons/choz.svg";
import Logout from "@/icons/arrow-right-start-on-rectangle.svg";
import Link from "next/link";

function DashboardHeader({ withoutNav = false }) {
  const session = useSelector((state: any) => state.session);
  return (
    <div className={styles.dashboard_header}>
      <div className={styles.container}>
        <Link href="/">
          <Image src={Choz} alt="" className={styles.logo} />
        </Link>
        {withoutNav === false && (
          <div className={styles.header_nav_container}>
            <p className={`${styles.header_nav_item} ${styles.header_nav_item_active}`}>Quizzes</p>
          </div>
        )}
        <div className={styles.profile_container}>
          <div className={styles.wallet_address_container}>
            <a
              href={`https://minascan.io/mainnet/account/${session?.walletAddress}/`}
              target="_blank"
              className={styles.wallet_address}
            >
              {session.walletAddress &&
                `${(session.walletAddress as string).slice(0, 5)}...${(
                  session.walletAddress as string
                ).slice(-5)}`}
            </a>
          </div>
          <Image
            src={Logout}
            alt=""
            onClick={() =>
              logout().then(() => {
                toast.success("Logged out successfully");
                window.location.href = "/";
              })
            }
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
