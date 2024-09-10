import styles from "@/styles/app/exams/Layout.module.css";

type Props = {
  children: React.ReactNode;
};

function Layout({ children }: Props) {
  return <div className={styles.container}>{children}</div>;
}

export default Layout;
