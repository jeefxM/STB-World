'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import styles from './LandingPage.module.css';

export const LandingPage = () => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleGameSelection = (gameId: string) => {
    router.push(`/game/${gameId}`);
  };

  // Ensure video plays immediately
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log('Video autoplay failed:', error);
      });
    }
  }, []);

  return (
    <div className={styles.container}>
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={styles.backgroundVideo}
      >
        <source src="/background/stb_backgound_video_2.webm" type="video/webm" />
      </video>

      {/* Overlay */}
      <div className={styles.overlay} />

      {/* Content */}
      <div className={styles.content}>
        {/* Title */}
        <h1 className={styles.title}>Spot The Ball</h1>

        {/* Game Options */}
        <div className={styles.gameOptions}>
          {/* Play with 2 WLD */}
          <button
            onClick={() => handleGameSelection('game-wld')}
            className={`${styles.gameButton} ${styles.buttonWLD}`}
          >
            <span className={styles.buttonLabel}>Play with 2</span>
            <span className={styles.buttonAmount}>$WLD</span>
          </button>

          {/* Play with 1 USDC */}
          <button
            onClick={() => handleGameSelection('game-usdc')}
            className={`${styles.gameButton} ${styles.buttonUSDC}`}
          >
            <span className={styles.buttonLabel}>Play with 1</span>
            <span className={styles.buttonAmount}>$USDC</span>
          </button>

          {/* Your Game Here */}
          <button className={`${styles.gameButton} ${styles.buttonPlaceholder}`}>
            <span className={styles.yourGameText}>Your Game Here</span>
          </button>
        </div>

        {/* Bottom Section */}
        <div className={styles.bottomSection}
            onClick={() => router.push('/about')}
        
        >
          <div className={styles.charityBadge}>
            <span className={styles.treeIcon}>🌳</span>
            <span className={styles.charityText}>20% of $ to Silvi's</span>
            <span className={styles.treeIcon}>🌳</span>
          </div>
          
          <div className={styles.callToAction}>
            <p className={styles.ctaText}>Create your game now</p>
            <p className={styles.ctaText}>to make a difference!</p>
          </div>

         <span className={styles.websiteLink}>
            www.spottheball.world
          </span> 
        </div>
      </div>
    </div>
  );
};
