import styles from '@/styles/components/DashboardHeader.module.css';
import Image from 'next/image';
import { logout } from '@/lib/Client/Auth';
import toast from 'react-hot-toast';

// Images
import Choz from '@/icons/choz.svg';
import Logout from '@/icons/arrow-right-start-on-rectangle.svg';

import { useAppSelector } from '../../../app/hooks';
import { hasActiveSession } from '@/features/client/session';

function DashboardHeader({ withoutNav = false }) {
  const session = useAppSelector((state) => state.session);

  const isConnected = useAppSelector(hasActiveSession);

  return (
    <div className={styles.dashboard_header}>
      <div className={styles.container}>
        <a href="https://choz.io/">
          <Image src={Choz} alt="" className={styles.logo} />
        </a>
        {withoutNav === false && (
          <div className={styles.header_nav_container}>
            <p className={`${styles.header_nav_item} ${styles.header_nav_item_active}`}>Quizzes</p>
          </div>
        )}
        <div className={styles.profile_container}>
          <div className={styles.wallet_address_container}>
            <a
              href={`https://minascan.io/mainnet/account/${session.session?.walletAddress}/`}
              target="_blank"
              className={styles.wallet_address}
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
                toast.success('Logged out successfully');
                window.location.href = '/';
              })
            }
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
