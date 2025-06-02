"use client"

import LiquidBackground from "@/components/ui/LiquidBackground";
import styles from "./page.module.css";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";


export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main>
      {/* Background */}
      <LiquidBackground />

      {/* Navbar */}
      <div className={styles.NavBar}>
        <div className={styles.NavBarLeft}>
          <Image src="/logo/stuk-hlpbk-logo.png" alt="Logo" width={300} height={300} objectFit="contain" className={styles.NavBarLogo}/>
        </div>
        <div className={styles.NavBarMiddle}>
          <div className={styles.NavLinks}>
            <p>About</p>
            <p>Activities</p>
            <p>Themes</p>
            <p>Community</p>
          </div>
        </div>
        <div className={styles.NavBarRight}>
          <button className={styles.RegisterButton}>Register</button>
        </div>

        <div className={styles.MobileMenu}>
          <div 
            className={`${styles.MenuButtonContainer} ${isMenuOpen ? styles.open : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className={`${styles.MobileMenuDropdown} ${isMenuOpen ? styles.open : ''}`}>
            <div className={styles.MobileMenuLinks}>
              <p>About</p>
              <p>Activities</p>
              <p>Themes</p>
              <p>Community</p>
            </div>
            <button className={styles.MobileMenuButton}>Register</button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className={styles.HeroContainer}>
        <div className={styles.HeroTitleContainer}>
          <Image src="/graphics/title-design.png" alt="Title Design" width={1200} height={1200} objectFit="contain" className={styles.HeroTitle} />
          <h1 className={styles.HeroSubtitle}>Your Gateway to The Future of Tech</h1>
        </div>

        <div className={styles.HeroVideoContainer}>
          <div className={styles.HeroVideo}></div>
          <div className={styles.VideoSubText}>
            <p>A 10-day immersive experience where founders, creators, and curious minds explore the tools, ideas, and opportunities shaping the future of tech and finance.</p>
          </div>
        </div>
      </div>

      {/* Brand Carousel */}
      <div className={styles.BrandCarouselContainer}>
        <div className={styles.BrandCarouselSlide}>
          <div className={styles.BrandLogoContainer}>
            <Image src="/carousel-photos/gemini-chainlink.png" alt="Gemini Chainlink" fill objectFit="contain" className={styles.BrandLogo} />
          </div>
          <div className={styles.BrandLogoContainer}>
            <Image src="/carousel-photos/Solana.png" alt="Solana" fill objectFit="contain" className={styles.BrandLogo} />
          </div>
          <div className={styles.BrandLogoContainer}>
            <Image src="/logo/stuk-hlpbk-logo.png" alt="Logo" fill objectFit="contain" className={styles.BrandLogo} />
          </div> 
        </div>
        <div className={styles.BrandCarouselSlide}>
          <div className={styles.BrandLogoContainer}>
            <Image src="/carousel-photos/gemini-chainlink.png" alt="Gemini Chainlink" fill objectFit="contain" className={styles.BrandLogo} />
          </div>
          <div className={styles.BrandLogoContainer}>
            <Image src="/carousel-photos/Solana.png" alt="Solana" fill objectFit="contain" className={styles.BrandLogo} />
          </div>
          <div className={styles.BrandLogoContainer}>
            <Image src="/logo/stuk-hlpbk-logo.png" alt="Logo" fill objectFit="contain" className={styles.BrandLogo} />
          </div> 
        </div>
      </div>
    </main>
  );
}
