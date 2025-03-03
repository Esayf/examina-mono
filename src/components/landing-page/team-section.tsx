import { FC } from "react";
import Image from "next/image";

// Örnek resim importları. Kendi dosya yollarınızı düzenleyin:
import Secgin from "@/../src/images/landing_team/secgin-karagulle.png";
import Mert from "@/../src/images/landing_team/mert-akyazi.png";
import Esra from "@/../src/images/landing_team/esra-akyazi.png";
import Yavuz from "@/../src/images/landing_team/yavuz-selim-tuncer.png";
import Ege from "@/../src/images/landing_team/ege-palaz.png";
import Deniz from "@/../src/images/landing_team/deniz-altun.png";

// CSS Module dosyası (örneğin: team.module.css)
import styles from "@/styles/team.module.css";

const TeamSection: FC = () => {
  return (
    <section className={styles.team_section_container}>
      {/* Asıl içerik */}
      <section className={styles.team_section}>
        <div className={styles.team_grid}>
          {/* Üye 1*/}
          <a
            href="https://www.linkedin.com/in/uiesraakyazi"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.team_card_link}
          >
            <div className={styles.team_card}>
              <div className={styles.team_photo_container}>
                <Image className={styles.team_photo} src={Esra} alt="Esra Akyazı" />
              </div>
              <h3>Esra Akyazı</h3>
              <p>Co-Founder & CEO</p>
            </div>
          </a>

          {/* Üye 2 */}
          <a
            href="https://www.linkedin.com/in/mertakyazi/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.team_card_link}
          >
            <div className={styles.team_card}>
              <div className={styles.team_photo_container}>
                <Image className={styles.team_photo} src={Mert} alt="Mert Akyazı" />
              </div>
              <h3>Mert Akyazı</h3>
              <p>Co-Founder & CTO</p>
            </div>
          </a>

          {/* Üye 3 */}
          <a
            href="https://www.linkedin.com/in/yavuz-selim-tun%C3%A7er-6634581b4/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.team_card_link}
          >
            <div className={styles.team_card}>
              <div className={styles.team_photo_container}>
                <Image className={styles.team_photo} src={Yavuz} alt="Yavuz Selim Tunçer" />
              </div>
              <h3>Yavuz Selim Tunçer</h3>
              <p>Co-Founder & Backend Dev.</p>
            </div>
          </a>

          {/* Üye 4 */}
          <a
            href="https://www.linkedin.com/in/deniz-altun-5842b6175/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.team_card_link}
          >
            <div className={styles.team_card}>
              <div className={styles.team_photo_container}>
                <Image className={styles.team_photo} src={Deniz} alt="Deniz Altun" />
              </div>
              <h3>Deniz Altun</h3>
              <p>Fullstack Dev. & AI Engineer</p>
            </div>
          </a>

          {/* Üye 5 */}
          <a
            href="https://www.linkedin.com/in/egepalaz/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.team_card_link}
          >
            <div className={styles.team_card}>
              <div className={styles.team_photo_container}>
                <Image className={styles.team_photo} src={Ege} alt="Ege Palaz" />
              </div>
              <h3>Ege Palaz</h3>
              <p>Marketing Manager</p>
            </div>
          </a>
          {/* Üye 6 */}
          <a
            href="https://github.com/scgnkrgll"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.team_card_link}
          >
            <div className={styles.team_card}>
              <div className={styles.team_photo_container}>
                <Image className={styles.team_photo} src={Secgin} alt="Seçgin Karagülle" />
              </div>
              <h3>Seçgin Karagülle</h3>
              <p>Advisor & Sr. Frontend Dev.</p>
            </div>
          </a>
        </div>
      </section>
    </section>
  );
};

export default TeamSection;
