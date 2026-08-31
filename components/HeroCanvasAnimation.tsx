'use client';
import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useVelocity } from 'framer-motion';

const TOTAL_FRAMES = 128;
const FRAME_PATH = '/frames';

export default function HeroCanvasAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const scrollVelocity = useVelocity(scrollYProgress);
  const yOffset = useTransform(
    scrollVelocity,
    [-1, 0, 1],
    [15, 0, -15]
  );

  const frameIndex = useTransform(
    smoothProgress,
    [0, 1],
    [0, TOTAL_FRAMES - 1]
  );

  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.src = `${FRAME_PATH}/frame_${i}.jpg`;
          img.onload = () => {
            setLoadProgress((prev) => prev + (100 / TOTAL_FRAMES));
            resolve(img);
          };
          img.onerror = reject;
        });
      });
      const loadedImages = await Promise.all(imagePromises);
      setImages(loadedImages);
      setImagesLoaded(true);
    };
    loadImages();
  }, []);

  useEffect(() => {
    if (!imagesLoaded || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const renderFrame = () => {
      const currentFrame = Math.round(frameIndex.get());
      const img = images[Math.max(0, Math.min(currentFrame, TOTAL_FRAMES - 1))];
      if (img) {
        let scale = Math.min(
          window.innerWidth / img.width,
          window.innerHeight / img.height
        );
        scale = Math.min(scale * 0.85, 1.2);

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    };
    const unsubscribe = frameIndex.on('change', renderFrame);
    renderFrame();
    const handleResize = () => renderFrame();
    window.addEventListener('resize', handleResize);
    return () => {
      unsubscribe();
      window.removeEventListener('resize', handleResize);
    };
  }, [imagesLoaded, images, frameIndex]);

  const section1Opacity = useTransform(smoothProgress, [0, 0.1, 0.2, 0.25], [0, 1, 1, 0]);
  const section2Opacity = useTransform(smoothProgress, [0.3, 0.35, 0.5, 0.55], [0, 1, 1, 0]);
  const section3Opacity = useTransform(smoothProgress, [0.6, 0.65, 0.8, 0.85], [0, 1, 1, 0]);
  const section4Opacity = useTransform(smoothProgress, [0.9, 0.92, 0.98, 1], [0, 1, 1, 0]);
  const scrollIndicatorOpacity = useTransform(smoothProgress, [0, 0.1], [1, 0]);

  return (
    <div ref={containerRef} style={{ position: 'relative' }} className={`relative ${!imagesLoaded ? "h-screen overflow-hidden" : "h-[500vh]"}`}>
      {!imagesLoaded && (
        <div className="fixed inset-0 bg-[#2A1B24] flex flex-col items-center justify-center z-50">
          <div className="w-64 h-2 bg-[#5C354C]/40 rounded-full overflow-hidden mb-4 border border-[#5C354C]">
            <motion.div
              className="h-full bg-gradient-to-r from-[#E63E8C] to-[#E0B0FF]"
              initial={{ width: '0%' }}
              animate={{ width: `${loadProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-[#FFF0F5]/80 text-lg font-['Inter']">
            Loading Experience... {Math.round(loadProgress)}%
          </p>
        </div>
      )}

      {imagesLoaded && (
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <motion.div style={{ y: yOffset }} className="w-full h-full flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="rounded-[3rem] shadow-2xl ring-1 ring-[#5C354C]/50 shadow-[#E63E8C]/10"
            />
          </motion.div>

          <div className="absolute inset-0 pointer-events-none">
            {/* Section 1 */}
            <motion.div
              style={{ opacity: section1Opacity }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
            >
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-['Playfair_Display'] font-bold text-[#FFF0F5] mb-4 tracking-tight drop-shadow-md">
                Experience Coffee
              </h1>
              <p className="text-xl md:text-2xl text-[#E0B0FF] font-['Inter'] font-light">
                Where every sip defies gravity
              </p>
            </motion.div>

            {/* Section 2 */}
            <motion.div
              style={{ opacity: section2Opacity }}
              className="absolute inset-0 flex flex-col justify-center items-start px-8 md:px-[10%] lg:px-[15%]"
            >
              <div className="max-w-2xl text-left">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-['Playfair_Display'] font-semibold text-[#FFF0F5] mb-3">
                  Crafted to Perfection
                </h2>
                <p className="text-lg md:text-xl text-[#FFF0F5]/80 font-['Inter']">
                  From bean to cup, excellence floats in every drop
                </p>
              </div>
            </motion.div>

            {/* Section 3 */}
            <motion.div
              style={{ opacity: section3Opacity }}
              className="absolute inset-0 flex flex-col justify-center items-end px-8 md:px-[10%] lg:px-[15%]"
            >
              <div className="max-w-2xl text-right">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-['Playfair_Display'] font-semibold text-[#FFF0F5] mb-3">
                  Uncompromising Quality
                </h2>
                <p className="text-lg md:text-xl text-[#FFF0F5]/80 font-['Inter']">
                  Every brew is an extraordinary balance of depth, aroma, and soul.
                </p>
              </div>
            </motion.div>

            {/* Section 4 */}
            <motion.div
              style={{ opacity: section4Opacity }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
            >
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-['Playfair_Display'] font-bold text-[#FFF0F5] mb-6">
                Discover Your Blend
              </h2>
              <motion.button
                onClick={() => {
                  const showcase = document.getElementById('signature-blends');
                  showcase?.scrollIntoView({ behavior: 'smooth' });
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-[#E63E8C] to-[#C93375] text-white rounded-full text-lg font-semibold shadow-2xl shadow-[#E63E8C]/40 pointer-events-auto transition-transform"
              >
                Explore Collection ↓
              </motion.button>
            </motion.div>
          </div>

          <motion.div
            style={{ opacity: scrollIndicatorOpacity }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <p className="text-[#E0B0FF] text-sm font-['Inter'] tracking-wider uppercase">
              Scroll to Explore
            </p>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-6 h-10 border-2 border-[#E0B0FF]/60 rounded-full flex items-start justify-center p-2"
            >
              <div className="w-1 h-3 bg-[#E63E8C] rounded-full" />
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
