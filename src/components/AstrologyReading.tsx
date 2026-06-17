import Markdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { Star, ShieldAlert, Share2, Copy, Check } from "lucide-react";
import { useState } from "react";

interface AstrologyReadingProps {
  reading: string | null;
  isLoading: boolean;
}

export default function AstrologyReading({ reading, isLoading }: AstrologyReadingProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (reading) {
      navigator.clipboard.writeText(reading);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!reading) return;
    
    const shareData = {
      title: 'मेरे नक्षत्रों का परामर्श - Celestial Compass',
      text: reading.substring(0, 100) + '...',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for desktop or non-supported browsers
        const textToShare = encodeURIComponent(`नमस्ते! मैंने अभी Celestial Compass पर अपना राशिफल देखा: \n\n${reading.substring(0, 200)}...\n\nअपना भी देखें यहाँ: ${window.location.href}`);
        const whatsappUrl = `https://wa.me/?text=${textToShare}`;
        window.open(whatsappUrl, '_blank');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto py-20 text-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="inline-block"
        >
          <Star size={40} className="text-accent fill-accent/10" />
        </motion.div>
        <p className="text-accent/60 font-serif tracking-[0.3em] text-xs uppercase animate-pulse">
          आकाशगंगा के संकेतों को समझा जा रहा है...
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {reading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl mx-auto mt-16 mb-24"
        >
          <div className="glass rounded-[2rem] overflow-hidden shadow-2xl relative border-white/10">
            {/* Header pattern */}
            <div className="h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
            
            <div className="p-8 md:p-14 relative">
              <div className="absolute top-8 right-8 flex gap-3">
                <button
                  onClick={handleCopy}
                  className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-[#f0f0f0]/40 hover:text-accent"
                  title="Copy reading"
                >
                  {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-[#f0f0f0]/40 hover:text-accent"
                  title="Share"
                >
                  <Share2 size={16} />
                </button>
              </div>

              <div className="markdown-body prose prose-invert max-w-none">
                <Markdown>{reading}</Markdown>
              </div>

              <div className="mt-14 pt-8 border-t border-white/5 flex items-start gap-4">
                <ShieldAlert size={18} className="text-[#f0f0f0]/10 shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#f0f0f0]/30 italic leading-relaxed font-light tracking-wide">
                  अस्वीकरण: ज्योतिष का उद्देश्य आत्म-चिंतन और मार्गदर्शन है। इसे पेशेवर चिकित्सा, कानूनी या वित्तीय सलाह के विकल्प के रूप में नहीं माना जाना चाहिए।
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
