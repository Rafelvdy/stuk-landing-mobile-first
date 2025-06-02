"use client"

import LiquidBackground from "@/components/ui/LiquidBackground";
import styles from "./page.module.css";
import Image from "next/image";
import { useState } from "react";


export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openAccordionIndex, setOpenAccordionIndex] = useState(-1);

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
          <Image rel="preload" src="/graphics/title-design.png" alt="Title Design" width={1200} height={1200} objectFit="contain" className={styles.HeroTitle} />
          <h1 className={styles.HeroSubtitle}>Your Gateway to The Future of Tech</h1>
        </div>

        <div className={styles.HeroVideoContainer}>
          <div className={styles.HeroVideo}></div>
          <div className={styles.VideoSubText}>
            <p>A 10-day immersive experience where founders, creators, and curious minds explore the tools, ideas, and opportunities shaping the future of tech and finance.</p>
          </div>
        </div>
      </div>

      

      {/* Activities Container */}
      <div className={styles.ActivitiesContainer}>
        {/* Brand Carousel */}
        <div className={styles.BrandCarouselContainer}>
          <div className={styles.BrandCarouselSlide}>
            <div className={styles.BrandLogoContainer}>
              <Image rel="preload" src="/carousel-photos/gemini-chainlink.png" alt="Gemini Chainlink" fill objectFit="contain" className={styles.BrandLogo} />
            </div>
            <div className={styles.BrandLogoContainer}>
              <Image rel="preload" src="/carousel-photos/Solana.png" alt="Solana" fill objectFit="contain" className={styles.BrandLogo} />
            </div>
            <div className={styles.BrandLogoContainer}>
              <Image rel="preload" src="/logo/stuk-hlpbk-logo.png" alt="Logo" fill objectFit="contain" className={styles.BrandLogo} />
            </div> 
          </div>
          <div className={styles.BrandCarouselSlide}>
            <div className={styles.BrandLogoContainer}>
              <Image rel="preload" src="/carousel-photos/gemini-chainlink.png" alt="Gemini Chainlink" fill objectFit="contain" className={styles.BrandLogo} />
            </div>
            <div className={styles.BrandLogoContainer}>
              <Image rel="preload" src="/carousel-photos/Solana.png" alt="Solana" fill objectFit="contain" className={styles.BrandLogo} />
            </div>
            <div className={styles.BrandLogoContainer}>
              <Image rel="preload" src="/logo/stuk-hlpbk-logo.png" alt="Logo" fill objectFit="contain" className={styles.BrandLogo} />
            </div> 
            </div>
          </div>

          <div className={styles.ActivitiesTitleContainer}>
              <h1 className={styles.ActivitiesTitle}>Things To Do at Startup Village</h1>
          </div>

          <div className={styles.ActivitiesAccordionContainer}>
            <div className={styles.ActivitiesAccordion}>
              <div className={styles.AccordionItem}>
                <button
                  className={styles.AccordionHeader}
                  type="button"
                  aria-expanded={openAccordionIndex === 0}
                  aria-controls="pitch-content"
                  onClick={() => setOpenAccordionIndex(openAccordionIndex === 0 ? -1 : 0)}
                >
                  <span className={styles.AccordionTitle}>Pitch Your Dream</span>
                </button>
                <div
                  id="pitch-content"
                  className={styles.AccordionContent}
                  aria-hidden={openAccordionIndex !== 0}
                  style={{ 
                    maxHeight: openAccordionIndex === 0 ? '2000px' : '0px',
                    visibility: openAccordionIndex === 0 ? 'visible' : 'hidden'
                  }}
                >
                  <section className={styles.PitchSection}>
                    <p className={styles.PitchSubtitle}>
                      In collaboration with HelpBnk, step up to the iconic doorbell and pitch your startup idea. Short, raw, and direct.
                    </p>
                    <p className={styles.PitchDescription}>
                      You&apos;re not just pitching into the void. Your moment could be seen by some of the biggest names in tech.<br/>
                      Top pitches will get a shot at the <span className={styles.PitchHighlight}>$100,000 grant pool and accelerator.</span>
                    </p>
                    <div className={styles.PlaceholderRow}>
                    {[1,2,3,4].map((i) => (
                      <div className={styles.PlaceholderCard} key={i}>
                        <div className={styles.PlaceholderImage}></div>
                        <div className={styles.PlaceholderText}>
                          <div className={styles.PlaceHolderItem}>Name</div>
                          <div className={styles.PlaceHolderItem}>Company</div>
                          <div className={styles.PlaceHolderItem}>Title</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  </section>
                </div>
                <hr className={styles.AccordionSeparator} />
              </div>
              {/* Learn. Earn. Build. */}
              <div className={styles.AccordionItem}>
                <button
                  className={styles.AccordionHeader}
                  type="button"
                  aria-expanded={openAccordionIndex === 1}
                  aria-controls="learn-content"
                  onClick={() => setOpenAccordionIndex(openAccordionIndex === 1 ? -1 : 1)}
                >
                  <span className={styles.AccordionTitle}>Learn. Earn. Build.</span>
                </button>
                <div
                  id="learn-content"
                  className={styles.AccordionContent}
                  aria-hidden={openAccordionIndex !== 1}
                  style={{ 
                    maxHeight: openAccordionIndex === 1 ? '2000px' : '0px',
                    visibility: openAccordionIndex === 1 ? 'visible' : 'hidden'
                  }}
                >
                  <div className={styles.ThingsToDoContainer}>
                    <div className={styles.ToDoItemContainer}>
                      <div className={styles.ToDoItem}>Find Collectables at Gallery</div>
                      <div className={styles.ToDoItem}>Pass Quizes for Prizes</div>
                      <div className={styles.ToDoItem}>Daily Content Challenge</div>
                      <div className={styles.ToDoItem}>24hr Hackathon</div>
                    </div>
                    
                    <div className={styles.ToDoItemWide}>
                      <h1>Every day, we&apos;re rewarding great storytelling...</h1>
                      <h1 className={styles.ScrollDown}>V</h1>
                      <div className={styles.ExpandedDescription}>
                        <p>Post your experience at Startup Village, whether its a tweet, photo, thread, or video and earn up to $100 each day!</p>
                        <p>Main Prizes to Top 3 posts, but everyone is able to claim <b>$1 in USDC per quality post</b> (up to 3 per day).</p>
                        <p>Tag <b><a href="https://x.com/SuperteamUK" target="_blank" rel="noopener noreferrer">@SuperteamUK</a></b>,<b><a href="https://x.com/helpbnk" target="_blank" rel="noopener noreferrer"> @HelpBnk</a></b> and use <b>#LondonStartupVillage</b> to enter.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <hr className={styles.AccordionSeparator} />
              </div>
            </div>
          </div>
        </div>

      <div className={styles.BlurWrapper}>
        {/* Themes*/}
        <div className={styles.ThemesContainer}>
          <div className={styles.ThemesTitle}>
            <h1>Explore Each Day at Startup Village</h1>
          </div>

          <div className={styles.ThemesGraphic}></div>
          <h2 className={styles.ThemesGraphicSubtitle}>Each day at Startup Village is themed around a different frontier of tech.</h2>
          <div className={styles.ThemesXtraInfo}>
            <p>Dive into our interactive digital gallery, test your knowledge with a daily quiz, and catch two expert speakers sharing real insights and future-facing ideas.</p>
            <p>Check back daily for new content, new talks, new opportunities.</p>
          </div>
        </div>

        {/* map */}
        <div className={styles.MapContainer}>
          <div className={styles.MapContent}>
            <div className={styles.MapGraphicTitle}>MAP</div>
            <div className={styles.MapGraphic}></div>
            <div className={styles.RegisterText}>Register To Startup Village</div>
            <div className={styles.RegisterButtonWide}>Register</div>
          </div>
        </div>
      </div>
    </main>
  );
}
