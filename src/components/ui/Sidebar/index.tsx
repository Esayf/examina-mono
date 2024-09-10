"use client";
import styles from "@/styles/components/Sidebar.module.css";
import { useRouter } from "next/router";

// Components
import * as Separator from "@radix-ui/react-separator";

// Icons
import { HomeIcon, Pencil1Icon } from "@radix-ui/react-icons";

// Custom Components
import { SidebarButton } from "../Buttons";

type Props = {};

function Sidebar({}: Props) {
  const router = useRouter();
  const pathname = router.pathname;

  return (
    <div className={styles.container}>
      <div className={styles.logo_container}>
        <h1 className={styles.logo_primary}>
          exa<span className={styles.logo_secondary}>mina</span>
        </h1>
      </div>
      <Separator.Root className={styles.separator} />
      <div className={styles.sidebar_nav_container}>
        <SidebarButton
          label="Dashboard"
          Icon={HomeIcon}
          active={pathname === "/app"}
          onClick={() => router.push("/app")}
        />
        <SidebarButton
          label="Create exam"
          Icon={Pencil1Icon}
          active={pathname === "/app/create-exam"}
          onClick={() => router.push("/app/create-exam")}
        />
        {/* <SidebarButton label="Your exams" Icon={BarChartIcon} />
        <SidebarButton label="Your profile" Icon={PersonIcon} />
        <SidebarButton label="Settings" Icon={GearIcon} /> */}
      </div>
      {/* <div className={styles.logout_container}>
        <SidebarButton
          label="Logout"
          Icon={ExitIcon}
          onClick={() => router.replace("/")}
        />
      </div> */}
    </div>
  );
}

export default Sidebar;
