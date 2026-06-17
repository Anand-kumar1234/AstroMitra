import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Compass, Sparkles, Orbit, Gem, Info, Sun, Moon, Zap, Waves, Flame, Globe } from "lucide-react";

interface SignDetail {
  chinese?: string;
  element: string;
  planet: string;
  gem: string;
  mantra: string;
  deity: string;
  quality: string;
}

const MANDALA_SIGNS = [
  { name: "Aries", hindi: "मेष", icon: "♈", element: "Agni (Fire)", planet: "मंगल (Mars)", gem: "मूंगा (Red Coral)", mantra: "ॐ भौमाय नमः", deity: "कार्तिकेय (Lord Kartikeya)", quality: "साहस और नेतृत्व (Courage & Leadership)" },
  { name: "Taurus", hindi: "वृषभ", icon: "♉", element: "Prithvi (Earth)", planet: "शुक्र (Venus)", gem: "हीरा (Diamond)", mantra: "ॐ शुक्राय नमः", deity: "लक्ष्मी देवी (Goddess Lakshmi)", quality: "स्थिरता और कला (Stability & Fine Arts)" },
  { name: "Gemini", hindi: "मिथुन", icon: "♊", element: "Vayu (Air)", planet: "बुध (Mercury)", gem: "पन्ना (Emerald)", mantra: "ॐ बुधाय नमः", deity: "श्रीमन्नारायण (Lord Vishnu)", quality: "बुद्धि और संचार (Intellect & Communication)" },
  { name: "Cancer", hindi: "कर्क", icon: "♋", element: "Jal (Water)", planet: "चंद्रमा (Moon)", gem: "मोती (Pearl)", mantra: "ॐ चंद्राय नमः", deity: "भगवान शिव (Lord Shiva)", quality: "संवेदनशीलता और अंतर्ज्ञान (Empathy & Intuition)" },
  { name: "Leo", hindi: "सिंह", icon: "♌", element: "Agni (Fire)", planet: "सूर्य (Sun)", gem: "माणिक्य (Ruby)", mantra: "ॐ सूर्याय नमः", deity: "श्री राम (Lord Rama)", quality: "तेज और आत्मविश्वास (Splendor & Self-Confidence)" },
  { name: "Virgo", hindi: "कन्या", icon: "♍", element: "Prithvi (Earth)", planet: "बुध (Mercury)", gem: "पन्ना (Emerald)", mantra: "ॐ बुधाय नमः", deity: "गायत्री माता (Goddess Gayatri)", quality: "विश्लेषण और सटीकता (Analytical & Perfection)" },
  { name: "Libra", hindi: "तुला", icon: "♎", element: "Vayu (Air)", planet: "शुक्र (Venus)", gem: "ओपल (Opal)", mantra: "ॐ शुक्राय नमः", deity: "लक्ष्मी माता (Goddess Lakshmi)", quality: "संतुलन और न्याय (Harmony & Justice)" },
  { name: "Scorpio", hindi: "वृश्चिक", icon: "♏", element: "Jal (Water)", planet: "मंगल (Mars)", gem: "मूंगा (Red Coral)", mantra: "ॐ भौमाय नमः", deity: "हनुमान जी (Lord Hanuman)", quality: "रहस्य और दृढ़ता (Mystery & Determination)" },
  { name: "Sagittarius", hindi: "धनु", icon: "♐", element: "Agni (Fire)", planet: "बृहस्पति (Jupiter)", gem: "पुखराज (Yellow Sapphire)", mantra: "ॐ गुरुवे नमः", deity: "भगवान ब्रह्मा (Lord Brahma)", quality: "ज्ञान और आध्यात्मिकता (Wisdom & Philosophy)" },
  { name: "Capricorn", hindi: "मकर", icon: "♑", element: "Prithvi (Earth)", planet: "शनि (Saturn)", gem: "नीलम (Blue Sapphire)", mantra: "ॐ शनैश्चराय नमः", deity: "कालभैरव (Lord Bhairava)", quality: "कर्म और अनुशासन (Karma & Discipline)" },
  { name: "Aquarius", hindi: "कुंभ", icon: "♒", element: "Vayu (Air)", planet: "शनि (Saturn)", gem: "एमेथिस्ट (Amethyst)", mantra: "ॐ शनैश्चराय नमः", deity: "भगवान विश्वकर्मा (Lord Vishwakarma)", quality: "विचारशीलता और मानवता (Visionary & Benevolent)" },
  { name: "Pisces", hindi: "मीन", icon: "♓", element: "Jal (Water)", planet: "बृहस्पति (Jupiter)", gem: "पुखराज (Yellow Sapphire)", mantra: "ॐ गुरुवे नमः", deity: "भगवान दक्षिणामूर्ति (Lord Dakshinamurthy)", quality: "आध्यात्म और मोक्ष (Mysticism & Soul Liberation)" },
];

export default function ZodiacMandala() {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const currentSign = MANDALA_SIGNS[selectedIdx];

  const getElementIcon = (element: string) => {
    if (element.includes("Fire") || element.includes("Agni")) return <Flame className="text-red-400 w-4 h-4" />;
    if (element.includes("Water") || element.includes("Jal")) return <Waves className="text-blue-400 w-4 h-4" />;
    if (element.includes("Air") || element.includes("Vayu")) return <Zap className="text-indigo-300 w-4 h-4" />;
    return <Globe className="text-emerald-400 w-4 h-4" />;
  };

  return (
    <div className="w-full max-w-xl mx-auto glass rounded-[2.5rem] p-6 md:p-8 border-white/[0.08] relative overflow-hidden select-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
      {/* Golden accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-accent to-transparent" />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="text-left">
            <h3 className="font-serif text-sm font-semibold text-accent uppercase tracking-wider flex items-center gap-2">
              <Orbit className="text-accent animate-spin w-4 h-4" style={{ animationDuration: '8s' }} />
              नक्षत्र स्थिति मंडल (CELESTIAL TRANSIT ORRERY)
            </h3>
            <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mt-0.5">Explore your planetary ruler & attributes</p>
          </div>
          <span className="text-[10px] text-accent font-serif border border-accent/20 px-2.5 py-1 rounded-full bg-accent/5 font-semibold">
            राशि चक्र
          </span>
        </div>

        {/* Dynamic Interactive Zodiac circular array / wheel */}
        <div className="relative flex justify-center py-6">
          <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full border border-white/5 flex items-center justify-center bg-black/15 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]">
            
            {/* Spinning background planetary circles */}
            <div className="absolute inset-4 rounded-full border border-dashed border-accent/10 pointer-events-none animate-orbit-slow" />
            <div className="absolute inset-12 rounded-full border border-dotted border-white/5 pointer-events-none animate-orbit-ccw-slow" />
            
            {/* Celestial center sun disk */}
            <div className="absolute w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-accent/25 via-accent/5 to-transparent border border-accent/20 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.08)] pointer-events-none z-10">
              <Sun className="text-accent w-6 h-6 animate-pulse" />
              <div className="text-[8px] font-serif font-bold text-accent-soft mt-1 leading-none uppercase">KUNDALI</div>
            </div>

            {/* Render 12 circular sign buttons distributed evenly */}
            {MANDALA_SIGNS.map((sign, index) => {
              const total = 12;
              const angle = (index * 360) / total;
              const radius = 100; // Radius in pixels for button layout
              const radians = (angle * Math.PI) / 180;
              const x = Math.round(radius * Math.cos(radians));
              const y = Math.round(radius * Math.sin(radians));

              const isSelected = selectedIdx === index;

              return (
                <button
                  key={sign.name}
                  type="button"
                  onClick={() => setSelectedIdx(index)}
                  className={`absolute w-10 h-10 rounded-full border flex flex-col items-center justify-center transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 ${
                    isSelected
                      ? "bg-gradient-to-br from-accent to-accent-soft border-accent text-bg-dark scale-115 shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                      : "bg-[#0b0e14]/90 border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 hover:scale-105"
                  }`}
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                  }}
                  title={sign.hindi}
                >
                  <span className="text-base leading-none">{sign.icon}</span>
                  <span className="text-[8px] font-serif tracking-tight font-medium opacity-85">{sign.hindi}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Sign attribute card displaying deep Vedic information */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSign.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="p-5 rounded-2xl bg-black/30 border border-white/5 shadow-inner text-left space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-2xl text-accent">{currentSign.icon}</span>
                <div>
                  <h4 className="text-sm font-serif font-bold text-white tracking-wide">{currentSign.hindi} ({currentSign.name})</h4>
                  <p className="text-[10px] text-white/40 font-mono tracking-wider">{currentSign.quality}</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-accent/80 font-mono flex items-center gap-1.5 bg-accent/5 px-2.5 py-1 rounded-full border border-accent/10">
                {getElementIcon(currentSign.element)}
                {currentSign.element.split(" ")[0]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="text-[9px] uppercase tracking-wider text-white/30 font-medium flex items-center gap-1.5">
                  <Moon className="w-3 h-3 text-accent" /> सत्तारूढ़ ग्रह (Ruling Planet)
                </div>
                <div className="font-semibold text-white/85">{currentSign.planet}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[9px] uppercase tracking-wider text-white/30 font-medium flex items-center gap-1.5">
                  <Gem className="w-3 h-3 text-accent" /> भाग्यशाली रत्न (Gemstone)
                </div>
                <div className="font-semibold text-white/85">{currentSign.gem}</div>
              </div>

              <div className="space-y-1 col-span-2 border-t border-white/5 pt-2">
                <div className="text-[9px] uppercase tracking-wider text-white/30 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-accent" /> सत्तारूढ़ देवता (Ruling Deity)
                </div>
                <div className="font-serif text-xs font-semibold text-accent-soft">{currentSign.deity}</div>
              </div>

              <div className="space-y-1 col-span-2 border-t border-white/5 pt-2">
                <div className="text-[9px] uppercase tracking-wider text-white/30 font-medium flex items-center gap-1.5">
                  <Info className="w-3 h-3 text-accent" /> सिद्ध बीज मंत्र (Celestial Mantra chant)
                </div>
                <div className="font-mono text-xs font-semibold text-accent-soft tracking-wider flex items-center gap-2">
                  <span>{currentSign.mantra}</span>
                  <span className="text-[8px] text-white/30 uppercase font-sans">(108 बार जाप करें)</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
