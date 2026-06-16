'use client';

import { useScroll, useTransform, useSpring, motion } from 'framer-motion';
import { useRef, useState, useEffect, useCallback } from 'react';

const FRAME_COUNT = 80;

export default function HeroSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(-1);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: isMobile ? 200 : 150,
    damping: isMobile ? 30 : 25,
    restDelta: 0.001
  });

  const currentFrameFloat = useTransform(smoothProgress, [0, 1], [1, FRAME_COUNT]);
  const canvasScale = useTransform(smoothProgress, [0, 1], [1.04, 1]);

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const initCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap DPR at 2 for performance
    const rect = canvas.getBoundingClientRect();
    
    const targetWidth = Math.round(rect.width * dpr);
    const targetHeight = Math.round(rect.height * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }, []);

  // Draw a frame — uses cover mode on landscape, cover with vertical bias on portrait
  const drawFrame = useCallback((frameFloat: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    const imgs = imagesRef.current;
    if (imgs.length < FRAME_COUNT) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rectWidth = canvas.width / dpr;
    const rectHeight = canvas.height / dpr;
    if (rectWidth === 0 || rectHeight === 0) return;

    const clamped = Math.max(1, Math.min(frameFloat, FRAME_COUNT));
    const frame1Idx = Math.floor(clamped) - 1;
    const frame2Idx = Math.min(Math.ceil(clamped) - 1, FRAME_COUNT - 1);
    const blend = clamped - Math.floor(clamped);

    const img1 = imgs[frame1Idx];
    if (!img1 || !img1.complete) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Fill background black first (for any gaps in contain mode)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, rectWidth, rectHeight);

    const canvasRatio = rectWidth / rectHeight;
    const imgRatio = img1.naturalWidth / img1.naturalHeight;
    
    let drawWidth: number, drawHeight: number, offsetX: number, offsetY: number;

    const isPortrait = rectHeight > rectWidth;

    if (isPortrait) {
      // On portrait screens, scale the image slightly and use exact positioning.
      // This ensures the barber remains visible on the left and leaves a calculated black gap.
      const scale = 1.4; 
      drawWidth = rectWidth * scale;
      drawHeight = drawWidth / imgRatio; // approx 79vw
      
      // Center horizontally 
      offsetX = (rectWidth - drawWidth) / 2;
      
      // Fixed 15% from the top
      offsetY = rectHeight * 0.15; // 15vh
    } else {
      // Standard cover logic for landscape
      if (imgRatio > canvasRatio) {
        drawHeight = rectHeight;
        drawWidth = rectHeight * imgRatio;
        offsetX = (rectWidth - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = rectWidth;
        drawHeight = rectWidth / imgRatio;
        offsetX = 0;
        offsetY = (rectHeight - drawHeight) / 2;
      }
    }

    // Draw base frame at full opacity
    ctx.globalAlpha = 1;
    ctx.drawImage(img1, offsetX, offsetY, drawWidth, drawHeight);

    // Crossfade blend into next frame
    if (blend > 0.01 && frame1Idx !== frame2Idx) {
      const img2 = imgs[frame2Idx];
      if (img2 && img2.complete) {
        ctx.globalAlpha = blend;
        ctx.drawImage(img2, offsetX, offsetY, drawWidth, drawHeight);
        ctx.globalAlpha = 1;
      }
    }
  }, []);

  // Load images once
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = 'async';
      const paddedIndex = i.toString().padStart(3, '0');
      img.src = `/barber-animation/ezgif-frame-${paddedIndex}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === FRAME_COUNT) {
          imagesRef.current = loadedImages;
          initCanvas();
          drawFrame(1);
          setIsLoaded(true);
        }
      };
      loadedImages.push(img);
    }
  }, [initCanvas, drawFrame]);

  // Resize handler — only fires on width change to avoid mobile address bar jank
  useEffect(() => {
    let lastWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (currentWidth === lastWidth) return;
      lastWidth = currentWidth;

      initCanvas();
      if (imagesRef.current.length === FRAME_COUNT) {
        drawFrame(currentFrameFloat.get());
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas, drawFrame, currentFrameFloat]);

  // Scroll-driven render loop
  useEffect(() => {
    const unsubscribe = currentFrameFloat.on('change', (latest) => {
      const rounded = Math.round(latest * 10) / 10;
      if (rounded === lastFrameRef.current) return;
      lastFrameRef.current = rounded;

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => drawFrame(latest));
    });
    return () => {
      unsubscribe();
      cancelAnimationFrame(rafRef.current);
    };
  }, [currentFrameFloat, drawFrame]);

  return (
    <div ref={containerRef} className="h-[200vh] sm:h-[250vh] md:h-[350vh] lg:h-[400vh] w-full relative bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-black">
        
        {/* Loading Spinner */}
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
             <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4"></div>
             <p className="text-amber-500/50 font-bold animate-pulse text-sm sm:text-base">جاري تحميل التجربة...</p>
          </div>
        )}

        <motion.canvas 
          ref={canvasRef} 
          style={{ scale: canvasScale }}
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
        />
        
        {/* Dark gradient overlay for text readability on mobile */}
        <div className={`absolute inset-0 z-[5] bg-gradient-to-b from-black/30 via-transparent to-black/60 md:from-transparent md:via-transparent md:to-transparent transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} />

        {/* Overlay — text positioned responsively */}
        <div className={`absolute inset-0 z-10 w-full h-full transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <style dangerouslySetInnerHTML={{__html: `
            .dynamic-title { top: 26%; }
            .dynamic-subtitle { top: 62%; }
            @media (orientation: portrait) {
              .dynamic-title {
                top: calc(15vh + 20vw);
              }
              .dynamic-subtitle {
                top: calc(15vh + 79vw + 4rem);
              }
            }
          `}} />
          
          {/* Title */}
          <div className="absolute w-full flex justify-center dynamic-title">
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-semibold tracking-wide text-center select-none translate-x-2 sm:translate-x-3 md:translate-x-4"
                style={{ 
                  color: '#fffbf0',
                  textShadow: `
                    0 0 5px #fff,
                    0 0 15px rgba(245, 158, 11, 0.8),
                    0 0 30px rgba(245, 158, 11, 0.8),
                    0 0 60px rgba(217, 119, 6, 1),
                    0 0 100px rgba(180, 83, 9, 1)
                  `
                }}>
              قَصَّة
            </h1>
          </div>

          {/* Subtitle & CTA */}
          <div className="absolute w-full flex flex-col items-center gap-4 sm:gap-6 dynamic-subtitle px-6">
            <p className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-zinc-100 text-center select-none max-w-lg"
               style={{ textShadow: '0 2px 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.5)' }}>
              احجز موعدك الآن بكل سهولة وأناقة
            </p>
            <a href="#services" className="bg-amber-500 hover:bg-amber-400 active:bg-amber-300 text-black px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-black text-base sm:text-lg transition-all shadow-xl shadow-amber-500/20 hover:-translate-y-1 active:translate-y-0">
              اكتشف خدماتنا
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

