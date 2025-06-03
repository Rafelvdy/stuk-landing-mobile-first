"use client"

import LiquidBackground from "@/components/ui/LiquidBackground";
import styles from "./page.module.css";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [deltaY, setDeltaY] = useState(0);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [inputType, setInputType] = useState('');
  const touchStartY = useRef(0);
  const lastTouchY = useRef(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openAccordionIndex, setOpenAccordionIndex] = useState(-1);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isLeftSwipeVisible, setIsLeftSwipeVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const touchSwipeTimeout = useRef<NodeJS.Timeout | null>(null);
  const isProcessingSwipe = useRef(false);
  const [isCommunityVisible, setIsCommunityVisible] = useState(false);
  
  // Add throttling refs
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTime = useRef(0);

  // Memoized functions to prevent recreating on every render
  const checkIfAtBottom = useCallback(() => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    const atBottom = scrollTop + windowHeight >= docHeight - 5;
    const percentage = Math.min((scrollTop / (docHeight - windowHeight)) * 100, 100);

    setIsAtBottom(atBottom);
    setScrollPercentage(percentage);
  }, []);

  const handleNavVisibility = useCallback((delta: number) => {
    if (Math.abs(delta) > 10) {
      if (delta > 0) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
    }
  }, []);

  const handleLeftSwipeVisibility = useCallback((delta: number, inputType: string) => {
    if (Math.abs(delta) < 10) return;

    // Different logic for wheel vs touch
    if (inputType === 'wheel') {
      if (isAtBottom && delta > 0 && !isLeftSwipeVisible) {
        setIsLeftSwipeVisible(true);
      } else if (isLeftSwipeVisible && delta < 0) {
        setIsLeftSwipeVisible(false);
      }

      if (isLeftSwipeVisible && delta > 0) {
        setIsCommunityVisible(true);
      } else if (isLeftSwipeVisible && delta < 0) {
        setIsCommunityVisible(false);
      }
    } else if (inputType === 'touch') {
      if (isAtBottom && delta > 0 && !isLeftSwipeVisible) {
        setIsLeftSwipeVisible(true);
      } else if (isLeftSwipeVisible && delta < 0) {
        setIsLeftSwipeVisible(false);
      }

      if (isLeftSwipeVisible && delta > 0) {
        setIsCommunityVisible(true);
      } else if (isLeftSwipeVisible && delta < 0) {
        setIsCommunityVisible(false);
      }
    }
  }, [isAtBottom, isLeftSwipeVisible]);

  useEffect(() => {
    if (!isNavVisible && isMenuOpen) {
      setIsMenuOpen(false);
    }

    // Throttled scroll handler
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollTime.current < 16) return; // Throttle to ~60fps
      lastScrollTime.current = now;

      const currentScrollY = window.scrollY;
      const delta = currentScrollY - prevScrollY;
      
      setScrollY(currentScrollY);
      setDeltaY(delta);
      setPrevScrollY(currentScrollY);

      checkIfAtBottom();

      // Only process nav/swipe logic if not touch input
      if (inputType !== 'touch') {
        handleNavVisibility(delta);
        handleLeftSwipeVisibility(delta, inputType);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      lastTouchY.current = e.touches[0].clientY;
      setInputType('touch');
      isProcessingSwipe.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isProcessingSwipe.current) return;

      const currentTouchY = e.touches[0].clientY;
      const touchDelta = lastTouchY.current - currentTouchY;
      lastTouchY.current = currentTouchY;

      if (Math.abs(touchDelta) < 5) return;

      // Update delta based on touch movement
      setDeltaY(touchDelta);
      setInputType('touch');

      handleNavVisibility(touchDelta);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isProcessingSwipe.current) return;

      const touchEndY = e.changedTouches[0].clientY;
      const totalDelta = touchStartY.current - touchEndY;

      if (Math.abs(totalDelta) > 30) {
        isProcessingSwipe.current = true;
        handleLeftSwipeVisibility(totalDelta, 'touch');
        handleNavVisibility(totalDelta);

        // Clear processing flag after animation
        setTimeout(() => {
          isProcessingSwipe.current = false;
        }, 350); // Slightly longer than transition duration
      }
    };

    // Simplified wheel handler
    const handleWheel = (e: WheelEvent) => {
      setDeltaY(e.deltaY);
      setInputType('wheel');
      handleLeftSwipeVisibility(e.deltaY, 'wheel');
    };

    const handleMouseMove = () => {
      if (inputType !== 'touch') {
        setInputType('mouse');
      }
    };

    // Add all event listeners with proper options
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Initial check
    checkIfAtBottom();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousemove', handleMouseMove);

      if (touchSwipeTimeout.current) {
        clearTimeout(touchSwipeTimeout.current);
      }
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [prevScrollY, inputType, isAtBottom, isLeftSwipeVisible, isMenuOpen, isNavVisible, checkIfAtBottom, handleNavVisibility, handleLeftSwipeVisibility]);

  return (
    <main>
      {/* Background */}
      <LiquidBackground />

      {/* Fixed display panel */}
      <div className="hidden fixed top-20 right-4 bg-black text-white p-4 rounded-lg shadow-lg z-50 font-mono text-sm min-w-[200px]">
        <div>Scroll Y: {scrollY}px</div>
        <div>Delta Y: {deltaY.toFixed(1)}px</div>
        <div className={`${deltaY > 0 ? 'text-red-400' : deltaY < 0 ? 'text-green-400' : 'text-gray-400'}`}>
          Direction: {deltaY > 0 ? '↓ Down' : deltaY < 0 ? '↑ Up' : '— Static'}
        </div>
        <div className="text-blue-400 text-xs mt-1">
          Input: {inputType || 'none'}
        </div>
        <div className={`text-yellow-400 text-xs mt-1 ${isAtBottom ? 'font-bold' : ''}`}>
          At Bottom: {isAtBottom ? 'YES' : 'NO'}
        </div>
        <div className={`text-purple-400 text-xs mt-1 ${isLeftSwipeVisible ? 'font-bold' : ''}`}>
          Map Visible: {isLeftSwipeVisible ? 'YES' : 'NO'}
        </div>
        <div className="text-gray-400 text-xs mt-1">
          Scroll %: {scrollPercentage.toFixed(1)}%
        </div>
      </div>

      {/* Navbar */}
      <div 
        className={styles.NavBar}
        style={{
          transform: isNavVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        <div className={styles.NavBarLeft}>
          <a href="/"><Image src="/carousel-photos/LSV lander/Logos - Header.png" alt="Logo" width={300} height={300} objectFit="contain" className={styles.NavBarLogo}/></a>
        </div>
        <div className={styles.NavBarMiddle}>
          <div className={styles.NavLinks}>
            <a href="#about"><p>About</p></a>
            <a href="#activities"><p>Activities</p></a>
            <a href="#themes"><p>Themes</p></a>
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
              <a href="#about"><p>About</p></a>
              <a href="#activities"><p>Activities</p></a>
              <a href="#themes"><p>Themes</p></a>
              <p>Community</p>
            </div>
            <button className={styles.MobileMenuButton}>Register</button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className={styles.HeroContainer} id="about">
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
      <div className={styles.ActivitiesContainer} id="activities">
        {/* Brand Carousel */}
        <div className={styles.BrandCarouselContainer}>
          <div className={styles.BrandCarouselSlide}>
            <div className={styles.BrandLogoContainer}>
              <Image rel="preload" src="/carousel-photos/LSV lander/chainlink.png" alt="Gemini Chainlink" fill objectFit="contain" className={styles.BrandLogo} />
            </div>
            <div className={styles.BrandLogoContainer}>
              <Image rel="preload" src="/carousel-photos/LSV lander/Group 66.png" alt="Solana" fill objectFit="contain" className={styles.BrandLogo} />
            </div>
            <div className={styles.BrandLogoContainer}>
              <Image rel="preload" src="/carousel-photos/LSV lander/Helpbank.png" alt="Logo" fill objectFit="contain" className={styles.BrandLogo} />
            </div>
            <div className={styles.BrandLogoContainer}>
              <Image rel="preload" src="/carousel-photos/LSV lander/Solana.png" alt="Logo" fill objectFit="contain" className={styles.BrandLogo} />
            </div>  
          </div>
          <div className={styles.BrandCarouselSlide}>
          <div className={styles.BrandLogoContainer}>
              <Image rel="preload" src="/carousel-photos/LSV lander/chainlink.png" alt="Gemini Chainlink" fill objectFit="contain" className={styles.BrandLogo} />
            </div>
            <div className={styles.BrandLogoContainer}>
              <Image rel="preload" src="/carousel-photos/LSV lander/Group 66.png" alt="Solana" fill objectFit="contain" className={styles.BrandLogo} />
            </div>
            <div className={styles.BrandLogoContainer}>
              <Image rel="preload" src="/carousel-photos/LSV lander/Helpbank.png" alt="Logo" fill objectFit="contain" className={styles.BrandLogo} />
            </div>
            <div className={styles.BrandLogoContainer}>
              <Image rel="preload" src="/carousel-photos/LSV lander/Solana.png" alt="Logo" fill objectFit="contain" className={styles.BrandLogo} />
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

      <div className={styles.LeftSwipeContainer}>
        <div className={styles.SwipeDownContainer}>
          <div className={styles.SwipeDownText}>Swipe Down</div>
          <Image src="/icons/down-arrow.png" alt="Swipe Down" width={64} height={64} className={styles.SwipeDownIcon} />
        </div>
        <div className={styles.BlurWrapper}>
          {/* Themes*/}
          <div className={styles.ThemesContainer} id="themes"
            style={{
              transform: isLeftSwipeVisible ? 'translateX(-100%)' : 'translateX(0)',
              transition: 'transform 0.3s ease-in-out'
            }}>
            <div className={styles.ThemesTitle}>
              <h1>Explore Each Day at Startup Village</h1>
            </div>

            <div className={styles.ThemesContent}>
              <div className={styles.ThemesGraphic}></div>
              <h2 className={styles.ThemesGraphicSubtitle}>Each day at Startup Village is themed around a different frontier of tech.</h2>
              <div className={styles.ThemesXtraInfo}>
                <div className={styles.ThemesXtraInfoTextList}>
                  <p>- Dive into our interactive digital gallery</p>
                  <p>- Test your knowledge with a daily quiz</p>
                  <p>- Catch two expert speakers sharing real insights and future-facing ideas.</p>
                </div>
                <p className={styles.ThemesXtraInfoText}>Check back daily for new content, new talks, new opportunities.</p>
              </div>
            </div>
          </div>

          {/* map */}
          <div 
            className={styles.MapContainer}
            style={{
              transform: isLeftSwipeVisible ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.3s ease-in-out'
            }}
            id="map"
          >
            <div className={styles.MapContent}>
              <div className={styles.MapGraphicTitle}>MAP</div>
              <div className={styles.MapGraphic}></div>
              <div className={styles.RegisterText}>Register To Startup Village</div>
              <div className={styles.RegisterButtonWide}>Register</div>
            </div>
          </div>
        </div>

        <div className={styles.CommunityContainer}
          style={{
            width: isCommunityVisible ? '100%' : '0%',
            height: isCommunityVisible ? '100vh' : '0vh',
            transition: 'all 0.3s ease-in-out'
          }}
        >
          <div className={styles.CommunityContent}>
            <div className={styles.CommunityTitleContainer}>
              <div className={styles.CommunityTitle}>What&apos;s Next? <b>Join Your Local Community on Telegram</b></div>
            </div>
            <div className={styles.LinksContainer}>
              <div className={styles.SolanaLink}>
                <button className={styles.SolanaButton}>Solana UK</button>
              </div>
              <div className={styles.SectorLinks}></div>
              <div className={styles.LocationLinks}></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}