import { motion } from "motion/react";
import { useMemo } from "react";

export default function CosmicBackground() {
  // Generate star field properties once to avoid frame stalls or battery drain
  const starsArray = useMemo(() => {
    return Array.from({ length: 65 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${0.6 + Math.random() * 1.8}px`,
      delay: `${Math.random() * 7}s`,
      duration: `${4 + Math.random() * 6}s`,
      opacity: 0.3 + Math.random() * 0.7,
    }));
  }, []);

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden bg-bg-dark">
      {/* Primary universe starry atmosphere layer */}
      <div className="absolute inset-0 luminous-bg" />

      {/* Radiant Solar Center/Zenith Glow */}
      <div className="absolute top-[-10%] left-[50%] -translate-x-[50%] w-[100vw] h-[75vh] bg-gradient-to-b from-blue-950/20 via-indigo-950/5 to-transparent opacity-90 blur-[130px] pointer-events-none" />

      {/* Atmospheric planetary rings (Vedic concentric orbit lines for alignment feeling) */}
      <div className="absolute top-[25%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-accent/[0.04] pointer-events-none animate-orbit-slow" />
      <div className="absolute top-[25%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full border border-dashed border-accent/[0.03] pointer-events-none animate-orbit-ccw-slow" />
      <div className="absolute top-[25%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] rounded-full border border-white/[0.02] pointer-events-none animate-orbit-slow" style={{ animationDuration: '240s' }} />

      {/* Cosmic Nebula Cloud 1 (Mystic Sapphire Indigo) */}
      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          x: [0, 15, 0],
          y: [0, -10, 0],
          opacity: [0.12, 0.2, 0.12],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[10%] right-[-15%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none"
      />
      
      {/* Cosmic Nebula Cloud 2 (Celestial Gold Aura) */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          x: [0, -20, 0],
          y: [0, 15, 0],
          opacity: [0.03, 0.08, 0.03],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[-15%] left-[-15%] w-[700px] h-[700px] bg-accent/8 rounded-full blur-[110px] pointer-events-none"
      />

      {/* Cosmic Nebula Cloud 3 (Deep Purple Amethyst) */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.05, 0.09, 0.05],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[30%] right-[10%] w-[550px] h-[550px] bg-purple-900/5 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Constellation Star Points */}
      <div className="absolute inset-0 opacity-55 pointer-events-none">
        {starsArray.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)] animate-twinkle"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              "--twinkle-duration": star.duration,
              animationDelay: star.delay,
              animationDuration: star.duration,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
