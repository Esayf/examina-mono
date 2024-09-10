import styles from "@/styles/components/Header.module.css";
import { useState } from "react";

type Props = {};

function Header({}: Props) {
  const [search, setSearch] = useState<string>("");

  // console.log(search);

  return (
    <div className={styles.container}>
      <div className={styles.greeting_container}>
        <h2 className={styles.greeting_primary}>Welcome,</h2>
        <p className={styles.greeting_secondary}>Have a good day!</p>
      </div>
      {/* <input
        className={styles.input}
        type="text"
        placeholder="Search"
        maxLength={120}
        onChange={(e) => setSearch(e.target.value)}
      /> */}
    </div>
  );
}

export default Header;
