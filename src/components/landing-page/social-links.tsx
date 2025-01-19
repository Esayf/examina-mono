import React from "react";
import styles from "@/styles/Landing.module.css";

// İsimlendirme ve import path'leri kendi dosya yapınıza uyacak şekilde olmalı.
// Örneğin Telegram yerine LinkedIn resmi kullanıyorsanız, import'u buna göre düzeltin:
import X from "@/images/logo/x-logo.png";
import Github from "@/images/logo/github-logo.png";
// Örn. Telegram yerine LinkedIn:
import Linkedin from "@/images/logo/linkedin-logo.png";
import Medium from "@/images/logo/medium-logo.png";
import { cn } from "@/lib/utils";

interface SocialLinksProps {
  className?: string;
}
function SocialLinks() {
  return (
    <nav className={styles.hero_social_links}>
      <div className="flex gap-2">
        {/* X */}
        <a
          href="https://x.com/chozapp"
          aria-label="X Account"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={X.src} alt="X Logo" />
        </a>

        {/* GitHub */}
        <a href="https://github.com/Esayf" title="GitHub" target="_blank" rel="noopener noreferrer">
          <img src={Github.src} alt="Github Logo" />
        </a>

        {/* LinkedIn (Eğer Telegram resmi yerine LinkedIn resmi göstermek istiyorsanız) */}
        <a
          href="https://www.linkedin.com/company/chozapp"
          title="LinkedIn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={Linkedin.src} alt="LinkedIn Logo" />
        </a>

        {/* Medium */}
        <a
          href="https://medium.com/choz-rewarding-engagement-redefining-evaluations"
          title="Medium Blog"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={Medium.src} alt="Medium Logo" />
        </a>
      </div>
    </nav>
  );
}

export default SocialLinks;
