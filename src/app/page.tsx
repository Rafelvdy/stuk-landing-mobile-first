"use client"

import LiquidBackground from "@/components/ui/LiquidBackground";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [deltaY, setDeltaY] = useState(0);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [inputType, setInputType] = useState('');
  const touchStartY = useRef(0);
  const lastTouchY = useRef(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeToDoItem, setActiveToDoItem] = useState<number | null>(null);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isLeftSwipeVisible, setIsLeftSwipeVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const touchSwipeTimeout = useRef<NodeJS.Timeout | null>(null);
  const isProcessingSwipe = useRef(false);
  const [isCommunityVisible, setIsCommunityVisible] = useState(false);
  const [isSwipeDownVisible, setIsSwipeDownVisible] = useState(true);

  const [sectorExpanded, setSectorExpanded] = useState(false);
  const [locationExpanded, setLocationExpanded] = useState(false);
  
  // Add touchpad-specific state
  const [touchpadSwipeStage, setTouchpadSwipeStage] = useState(0); // 0: normal, 1: map, 2: community
  const wheelBuffer = useRef<number[]>([]);
  const lastWheelTime = useRef(0);
  const wheelAccumulator = useRef(0);
  
  // Add throttling refs
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTime = useRef(0);

  const Carousel = () => {
    const totalSlides = 9;
    const [currentSlide, setCurrentSlide] = useState(totalSlides);

    const handleNext = () => {
      if (currentSlide < totalSlides) {
        setCurrentSlide(prev => prev + 1);
      }
    };

    const handlePrevious = () => {
      if (currentSlide > 1) {
        setCurrentSlide(prev => prev - 1);
      }
    };

    return (
      <div className={styles.ThemesGraphic}>
        <div className={styles.GraphicSlider}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((slideNumber) => (
            <div 
              key={slideNumber}
              className={styles.GraphicItem}
              style={{
                transform: slideNumber === currentSlide ? 'translateX(0%)' : 
                          slideNumber > currentSlide ? 'translateX(0%)' : 'translateX(100%)',
                zIndex: totalSlides - slideNumber + 1
              }}
            >
              <h1>{slideNumber}</h1>
            </div>
          ))}
        </div>
        <button 
            className={styles.GraphicNext}
            onClick={handleNext}
            disabled={currentSlide >= totalSlides}
          >
            {'>'}
          </button>
          <button 
            className={styles.GraphicPrevious}
            onClick={handlePrevious}
            disabled={currentSlide <= 1}
          >
            {'<'}
          </button>
      </div>
    );
  };

  // Memoized functions to prevent recreating on every render
  const checkIfAtBottom = useCallback(() => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    const atBottom = scrollTop + windowHeight >= docHeight - 10; // Increased threshold
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
      // For touchpad/wheel, use staged approach with stricter conditions
      if (isAtBottom && delta > 0) {
        if (touchpadSwipeStage === 0 && Math.abs(wheelAccumulator.current) > 150) { // Increased threshold
          setIsLeftSwipeVisible(true);
          setTouchpadSwipeStage(1);
          setDeltaY(0);
          wheelAccumulator.current = 0; // Reset immediately
          return;
        } else if (touchpadSwipeStage === 1 && Math.abs(wheelAccumulator.current) > 200 && isLeftSwipeVisible) { // Much higher threshold for community
          setIsCommunityVisible(true);
          setIsSwipeDownVisible(false);
          setTouchpadSwipeStage(2);
          setDeltaY(0); 
          wheelAccumulator.current = 0; // Reset immediately
          return;
        }
      } else if (delta < 0) { // Changed from delta < 1 to delta < 0 for stricter upward detection
        if (touchpadSwipeStage === 2 && isCommunityVisible && Math.abs(wheelAccumulator.current) > 100) {
          setIsCommunityVisible(false);
          setIsSwipeDownVisible(true);
          setTouchpadSwipeStage(1);
          wheelAccumulator.current = 0;
        } else if (touchpadSwipeStage === 1 && !isCommunityVisible && Math.abs(wheelAccumulator.current) > 100) {
          setIsLeftSwipeVisible(false);
          setTouchpadSwipeStage(0);
          wheelAccumulator.current = 0;
        }
      }
    } else if (inputType === 'touch') {
      // Keep original touch logic but with stricter thresholds
      if (isAtBottom && delta > 30 && !isLeftSwipeVisible) { // Increased threshold
        setIsLeftSwipeVisible(true);
      } else if (isLeftSwipeVisible && delta < -30 && !isCommunityVisible) { // Increased threshold
        setIsLeftSwipeVisible(false);
      }
      if (isLeftSwipeVisible && delta > 50) { // Increased threshold
        setIsCommunityVisible(true);
        setIsSwipeDownVisible(false);
      } else if (isLeftSwipeVisible && delta < -50) { // Increased threshold
        setIsCommunityVisible(false);
        setIsSwipeDownVisible(true);
      }
    }
  }, [isAtBottom, isLeftSwipeVisible, touchpadSwipeStage, isCommunityVisible]);
  // Reset touchpad stage when not at bottom
  useEffect(() => {
    if (!isAtBottom && touchpadSwipeStage > 0) {
      setTouchpadSwipeStage(0);
      setIsLeftSwipeVisible(false);
      setIsCommunityVisible(false);
      setIsSwipeDownVisible(true);
    }
  }, [isAtBottom, touchpadSwipeStage]);

  useEffect(() => {
    if (!isNavVisible && isMenuOpen) {
      setIsMenuOpen(false);
    }

    // Improved scroll handler with better touchpad detection
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
    
      // Only process nav visibility logic, not swipe logic
      if (inputType !== 'touch') {
        handleNavVisibility(delta);
        // Remove the handleLeftSwipeVisibility call from here entirely
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

      if (isAtBottom && touchDelta > 0) {
        e.preventDefault();
      }

      if (isLeftSwipeVisible && touchDelta < 30 && !isCommunityVisible) {
        e.preventDefault();
      }

      if (touchDelta < 30 && isCommunityVisible) {
        e.preventDefault();
      }

      // Update delta based on touch movement
      setDeltaY(touchDelta);
      setInputType('touch');

      handleNavVisibility(touchDelta);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isProcessingSwipe.current) return;

      const touchEndY = e.changedTouches[0].clientY;
      const totalDelta = touchStartY.current - touchEndY;

      if (isAtBottom && totalDelta > 30) {
        e.preventDefault();
      }

      if (isLeftSwipeVisible && totalDelta < 30 && !isCommunityVisible) {
        e.preventDefault();
      }

      if (totalDelta < 30 && isCommunityVisible) {
        e.preventDefault();
      }

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

    // Improved wheel handler with better touchpad gesture detection
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      const timeDiff = now - lastWheelTime.current;
      lastWheelTime.current = now;
      
      setDeltaY(e.deltaY);
      setInputType('wheel');
      
      // Buffer wheel events to detect intentional swipes vs normal scrolling
      wheelBuffer.current.push(e.deltaY);
      if (wheelBuffer.current.length > 3) { // Reduced buffer size for more responsive detection
        wheelBuffer.current.shift();
      }
      
      // Accumulate wheel delta for gesture detection
      if (timeDiff < 150) { // Slightly longer window for gesture detection
        wheelAccumulator.current += e.deltaY;
      } else {
        wheelAccumulator.current = e.deltaY; // Reset if too much time has passed
      }
      
      // Only trigger swipe logic for significant accumulated movement and when at bottom
      const avgDelta = wheelBuffer.current.reduce((sum, val) => sum + val, 0) / wheelBuffer.current.length;
      const isSignificantGesture = Math.abs(wheelAccumulator.current) > 100 && Math.abs(avgDelta) > 30;
      
      // Only process swipe gestures when at bottom or already in a swipe state
      if (isSignificantGesture && (isAtBottom || touchpadSwipeStage > 0)) {
        handleLeftSwipeVisibility(wheelAccumulator.current, 'wheel');
        // Don't reset accumulator here - let the handleLeftSwipeVisibility function handle it
      }
      
      // Clear accumulator after longer period of inactivity
      setTimeout(() => {
        if (now - lastWheelTime.current > 500) { // Increased timeout
          wheelAccumulator.current = 0;
          wheelBuffer.current = [];
        }
      }, 600);
    };

    const handleMouseMove = () => {
      if (inputType !== 'touch') {
        setInputType('mouse');
      }
    };

    // Add all event listeners with proper options
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
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
  }, [prevScrollY, inputType, isAtBottom, isLeftSwipeVisible, isMenuOpen, isNavVisible, checkIfAtBottom, handleNavVisibility, handleLeftSwipeVisibility, isCommunityVisible, isSwipeDownVisible, touchpadSwipeStage]);

  return (
    <main>
      {/* Background */}
      <LiquidBackground />

      {/* Fixed display panel */}
      <div className="fixed top-20 right-4 bg-black text-white p-4 rounded-lg shadow-lg z-50 font-mono text-sm min-w-[200px]">
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
          <Link href="/"><Image src="/carousel-photos/LSV lander/Logos - Header.png" alt="Logo" width={300} height={300} objectFit="contain" className={styles.NavBarLogo}/></Link>
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
          <a href="https://lu.ma/LondonStartupVillage" target="_blank" rel="noopener noreferrer"><button className={styles.RegisterButton}>Register</button></a>
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
            <a href="https://lu.ma/LondonStartupVillage" target="_blank" rel="noopener noreferrer"><button className={styles.MobileMenuButton}>Register</button></a>
          </div>
        </div>
      </div>

      <div className={styles.SwipeDownContainer} style={{visibility: isSwipeDownVisible ? 'visible' : 'hidden'}}>
          <div className={styles.SwipeDownText}>Swipe Down</div>
          <Image src="/icons/down-arrow.png" alt="Swipe Down" width={64} height={64} className={styles.SwipeDownIcon} />
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
              <div className={styles.AccordionHeader}>
                <span className={styles.AccordionTitle}>Pitch Your Dream</span>
              </div>
              <div
                id="pitch-content"
                className={styles.AccordionContent}
                aria-hidden="false"
                style={{ 
                  maxHeight: '2000px',
                  visibility: 'visible'
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
              <div className={styles.AccordionHeader}>
                <span className={styles.AccordionTitle}>Learn. Earn. Build.</span>
              </div>
              <div
                id="learn-content"
                className={styles.AccordionContent}
                aria-hidden="false"
                style={{ 
                  maxHeight: '2000px',
                  visibility: 'visible'
                }}
              >
                <div className={styles.ThingsToDoContainer}>
                  <div className={styles.ToDoItemContainer}>
                    <div 
                      className={`${styles.ToDoItem} ${activeToDoItem === 0 ? styles.active : ''}`}
                      onClick={() => setActiveToDoItem(activeToDoItem === 0 ? null : 0)}
                    >
                      Find Collectables and pass quizzes for prizes
                      <div className={styles.DropDownIcon}>
                        <Image src="/icons/down-arrow.png" alt="Down Arrow" width={24} height={24} />
                      </div>
                    </div>
                    <div 
                      className={`${styles.ToDoItem} ${activeToDoItem === 1 ? styles.active : ''}`}
                      onClick={() => setActiveToDoItem(activeToDoItem === 1 ? null : 1)}
                    >
                      Daily Content Challenge
                      <div className={styles.DropDownIcon}>
                        <Image src="/icons/down-arrow.png" alt="Down Arrow" width={24} height={24} />
                      </div>
                    </div>
                    <div 
                      className={`${styles.ToDoItem} ${activeToDoItem === 2 ? styles.active : ''}`}
                      onClick={() => setActiveToDoItem(activeToDoItem === 2 ? null : 2)}
                    >
                      24hr Hackathon
                      <div className={styles.DropDownIcon}>
                        <Image src="/icons/down-arrow.png" alt="Down Arrow" width={24} height={24} />
                      </div>
                    </div>
                  </div>
                  
                  {activeToDoItem === 0 && (
                    <div className={styles.ExpandedToDoItem}>
                      <p>Dive into our interactive digital gallery, test your knowledge with a daily quiz, and catch two expert speakers sharing real insights and future facing ideas.</p>
                    </div>
                  )}
                  
                  {activeToDoItem === 1 && (
                    <div className={styles.ExpandedToDoItem}>
                      <h1>Every day, we&apos;re rewarding great storytelling...</h1>
                      <p>Post your experience at Startup Village, whether its a tweet, photo, thread, or video and earn up to $100 each day!</p>
                      <p>Main Prizes to Top 3 posts, but everyone is able to claim <b>$1 in USDC per quality post</b> (up to 3 per day).</p>
                      <p>Tag <b><a href="https://x.com/SuperteamUK" target="_blank" rel="noopener noreferrer">@SuperteamUK</a></b>,<b><a href="https://x.com/helpbnk" target="_blank" rel="noopener noreferrer"> @HelpBnk</a></b> and use <b>#LondonStartupVillage</b> to enter.</p>
                    </div>
                  )}
                  
                  {activeToDoItem === 2 && (
                    <div className={styles.ExpandedToDoItem}>
                      <p>A 24hr hackathon, focused on shipping mobile apps fast. Go from idea to app in minutes, not days.  All building toward the Seeker launch this August</p>
                    </div>
                  )}
                </div>
              </div>
              <hr className={styles.AccordionSeparator} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.LeftSwipeContainer}>
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

         
                {/* <div className={styles.GraphicSlider}>
                  <div className={styles.GraphicItem}><h1>1</h1></div>
                  <div className={styles.GraphicItem}><h1>2</h1></div>
                  <div className={styles.GraphicItem}><h1>3</h1></div>
                  <div className={styles.GraphicItem}><h1>4</h1></div>
                  <div className={styles.GraphicItem}><h1>5</h1></div>
                  <div className={styles.GraphicItem}><h1>6</h1></div>
                  <div className={styles.GraphicItem}><h1>7</h1></div>
                  <div className={styles.GraphicItem}><h1>8</h1></div>
                  <div className={styles.GraphicItem}><h1>9</h1></div>
                  <button className={styles.GraphicNext}>{'>'}</button>
                  <button className={styles.GraphicPrevious}>{'<'}</button>
                </div> */}
                <Carousel />
             

              <h2 className={styles.ThemesGraphicSubtitle}>Each day at Startup Village is themed around a different frontier of tech.</h2>
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
              {/* <div className={styles.MapGraphic}><Image src="/graphics/map.png" alt="Map" width={1200} height={1200} objectFit="contain" /></div> */}
              {/* <Image src="/graphics/map.png" alt="Map" width={900} height={900} objectFit="contain" /> */}
              {/* <Image src="/graphics/Inside Leaflet.svg" alt="Map" width={1200} height={1200} objectFit="contain" /> */}
              <Image src="/graphics/Inside Lealflet-min.png" alt="Map" width={900} height={900} objectFit="contain" className={styles.MapGraphic}/>
              <div className={styles.RegisterText}>Register To Startup Village</div>
              <button 
                className={styles.RegisterButtonWide} 
                onClick={() => window.open('https://lu.ma/LondonStartupVillage', '_blank')}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                style={{ touchAction: 'manipulation', zIndex: 10 }}
                >
                  Register
                </button>
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
        <div className={styles.EventInfoContainer}>
          <div className={styles.EventInfoTitle}>Did you know we have weekly events every friday in 7 cities?</div>
          <div className={styles.EventInfoButtonContainer}>
            <div className={styles.EventInfoButtonText}>Find all our events on</div>
            <div className={styles.EventInfoButton}>Find them here</div>
          </div>
        </div>
        
        <div className={styles.MainContentContainer}>
          <div className={styles.CommunityTitleContainer}>
            <div className={styles.CommunityTitle}>What&apos;s Next? <b>Join Your Local Community on Telegram</b></div>
          </div>
          
          <div className={styles.LinksContainer}>
            <div className={styles.SolanaLink}>
              <button 
                className={styles.SolanaButton}
                onClick={() => window.open('https://t.me/+oznd043p-Fw4NDc0', '_blank')}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                style={{ touchAction: 'manipulation' }}
              >
                Solana UK
              </button>
            </div>
          
            <div className={styles.ExpandableButtonsRow}></div>
            <div className={styles.SectorLinks}>
              <div 
                className={`${styles.SectorButton} ${sectorExpanded ? styles.expanded : ''}`}
                onClick={() => setSectorExpanded(!sectorExpanded)}
                onMouseEnter={() => setSectorExpanded(true)}
                onMouseLeave={() => setSectorExpanded(false)}
              >
                <div className={styles.SectorButtonMain}>SECTORS</div>
                <div className={`${styles.SectorButtonsContainer} ${sectorExpanded ? styles.visible : ''}`}>
                  <div 
                    className={styles.CreatorButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('https://t.me/+-EtHEi2L1LYyYzdk', '_blank');
                    }}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                    style={{ touchAction: 'manipulation' }}
                  >
                    CREATOR
                  </div>
                  <div className={styles.CreatorButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('https://t.me/+ccdcCEXZy4EzZTRk', '_blank');
                    }}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                    style={{ touchAction: 'manipulation' }}
                  >
                    ENGINEER
                  </div>
                  <div className={styles.CreatorButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('https://t.me/+Pxxr0XHZjBJiMTg0', '_blank');
                    }}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                    style={{ touchAction: 'manipulation' }}
                  >
                    BUSINESS
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.LocationLinks}>
              <div 
                className={`${styles.LocationContainer} ${locationExpanded ? styles.expanded : ''}`}
                onClick={() => setLocationExpanded(!locationExpanded)}
                onMouseEnter={() => setLocationExpanded(true)}
                onMouseLeave={() => setLocationExpanded(false)}
              >
                <div className={styles.LocationButtonMain}>LOCATIONS</div>
                <div className={`${styles.LocationButtonsContainer} ${locationExpanded ? styles.visible : ''}`}>
                  <div 
                    className={styles.ManButton} 
                    data-full="MANCHESTER" 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('https://t.me/+jr1ZlPz7ePI5ZDlk', '_blank');
                    }}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                    style={{ touchAction: 'manipulation' }}
                  >
                    MAN
                  </div>
                  <div 
                    className={styles.GlasButton} 
                    data-full="GLASGOW"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('https://t.me/STUK_COW_GLA', '_blank');
                    }}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                    style={{ touchAction: 'manipulation' }}
                  >
                    GLA
                  </div>
                  <div 
                    className={styles.BirButton} 
                    data-full="BIRMINGHAM"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('https://t.me/+5Ew0ehETXAA0ZDRk', '_blank');
                    }}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                    style={{ touchAction: 'manipulation' }}
                  >
                    BIR
                  </div>
                  <div 
                    className={styles.NewButton} 
                    data-full="NEWCASTLE"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('https://t.me/+znstcLhWIYJjM2I0', '_blank');
                    }}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                    style={{ touchAction: 'manipulation' }}
                  >
                    NEW
                  </div>
                  <div 
                    className={styles.ExeButton} 
                    data-full="EXETER"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('https://t.me/+9i3c0XmADT9kZjFk', '_blank');
                    }}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                    style={{ touchAction: 'manipulation' }}
                  >
                    EXE
                  </div>
                  <div 
                    className={styles.BriButton} 
                    data-full="BRIGHTON"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('https://t.me/+7nu6ZOw8VWExZGVk', '_blank');
                    }}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                    style={{ touchAction: 'manipulation' }}
                  >
                    BRI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </main>
  );
}