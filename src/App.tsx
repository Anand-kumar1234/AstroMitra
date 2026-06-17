import { useState, useEffect } from "react";
import CosmicBackground from "./components/CosmicBackground";
import AstrologyForm from "./components/AstrologyForm";
import AstrologyReading from "./components/AstrologyReading";
import ProfileSetup from "./components/ProfileSetup";
import Auth from "./components/Auth";
import AdminPanel from "./components/AdminPanel";
import ZodiacMandala from "./components/ZodiacMandala";
import { auth, db } from "./lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { 
  Moon, 
  Sun, 
  LogOut, 
  User as UserIcon, 
  Settings, 
  Share2, 
  ShieldAlert, 
  History, 
  Trash2, 
  Calendar, 
  Compass, 
  Sparkles, 
  ChevronRight,
  Hand
} from "lucide-react";

interface SavedConsultation {
  id: string;
  type: "personalized" | "horoscope" | "palmistry";
  title: string;
  summary: string;
  timestamp: string;
  text: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [reading, setReading] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // History manager state
  const [historyList, setHistoryList] = useState<SavedConsultation[]>([]);

  // Load user and local history on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid);
        // Load history saved for this specific user to maintain offline-friendly profile isolation
        const localHistory = localStorage.getItem(`cosmic_history_${currentUser.uid}`);
        if (localHistory) {
          try {
            setHistoryList(JSON.parse(localHistory));
          } catch (e) {
            console.error("Error parsing history list:", e);
          }
        } else {
          setHistoryList([]);
        }
      } else {
        setProfile(null);
        setHistoryList([]);
      }
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchProfile = async (uid: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
        setShowProfileSetup(false);
      } else {
        setShowProfileSetup(true);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const handleConsult = async (params: any) => {
    setIsLoading(true);
    setReading(null);
    try {
      const response = await fetch("/api/get-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        let errMsg = "ब्रह्मांडीय ऊर्जा से संपर्क नहीं हो पा रहा है।";
        try {
          const errData = await response.json();
          errMsg = errData.error || errMsg;
        } catch (e) {
          errMsg = `त्रुटि ${response.status}: सर्वर से अमान्य प्रतिक्रिया मिली। (Server returned unexpected response style)`;
        }
        throw new Error(errMsg);
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error("सर्वर से अमान्य JSON उत्तर मिला। (Server returned invalid JSON response)");
      }

      const generatedReading = data.reading || null;
      setReading(generatedReading);

      // Save consultation to client-side localStorage history
      if (user && generatedReading) {
        let title = "संशोधित परामर्श";
        if (params.type === "personalized") {
          title = `जन्म पत्री - ${params.birthPlace || "वैदिक"}`;
        } else if (params.type === "horoscope") {
          title = `${params.zodiacSign || "राशि"} दैनिक फल`;
        } else if (params.type === "palmistry") {
          title = "हस्तरेखा स्कैन विश्लेषण";
        }

        const newConsult: SavedConsultation = {
          id: Date.now().toString(),
          type: params.type,
          title,
          summary: generatedReading.replace(/[#*`-]/g, "").substring(0, 80) + "...",
          timestamp: new Date().toISOString(),
          text: generatedReading
        };

        const updatedHistory = [newConsult, ...historyList].slice(0, 10); // Keep last 10 records
        setHistoryList(updatedHistory);
        localStorage.setItem(`cosmic_history_${user.uid}`, JSON.stringify(updatedHistory));
      }

      setTimeout(() => {
        const readingEl = document.getElementById("reading-section");
        readingEl?.scrollIntoView({ behavior: "smooth" });
      }, 150);

    } catch (error: any) {
      console.error(error);
      alert(error.message || "नक्षत्र वर्तमान में धुंधले हैं। कृपया बाद में पुनः प्रयास करें। (The stars are currently obscured. Please try again later.)");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: SavedConsultation) => {
    setReading(item.text);
    setTimeout(() => {
      const readingEl = document.getElementById("reading-section");
      readingEl?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleClearHistory = () => {
    if (!user) return;
    if (confirm("क्या आप अपने सभी संचित परामर्श परिणामों को हटाना चाहते हैं?")) {
      setHistoryList([]);
      localStorage.removeItem(`cosmic_history_${user.uid}`);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleShareApp = async () => {
    const shareData = {
      title: 'Celestial Guide - आपका भविष्य, सितारों की नज़र से',
      text: 'मैंने अभी Celestial Guide पर अपनी कुंडली और हस्तरेखा का विश्लेषण प्राप्त किया। आप भी प्रयास करें!',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const textToShare = encodeURIComponent(`नमस्ते! मैंने अभी Celestial Guide पर अपना भविष्य देखा। \n\nकुंडली, हस्तरेखा स्कैन और दैनिक राशिफल परामर्श के लिए देखें: ${window.location.href}`);
        const whatsappUrl = `https://wa.me/?text=${textToShare}`;
        window.open(whatsappUrl, '_blank');
      }
    } catch (err) {
      console.error('Error sharing app:', err);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="relative">
          <div className="h-12 w-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <div className="absolute inset-0 m-auto h-4 w-4 bg-accent rounded-full animate-ping" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-[#f0f0f0] selection:bg-accent/30 font-sans pb-24 scroll-smooth">
      <CosmicBackground />
      
      {/* Header controls layout */}
      <header className="pt-20 pb-12 md:pt-28 md:pb-16 px-6 text-center relative max-w-5xl mx-auto flex flex-col items-center select-none">
        {user && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-6 right-6 flex items-center gap-2.5 z-50 bg-black/30 backdrop-blur-md px-3 py-2 rounded-full border border-white/5"
          >
            {user?.email === "gulshankumar9934293812@gmail.com" && (
              <button
                onClick={() => {
                  setShowAdminPanel(!showAdminPanel);
                  setShowProfileSetup(false);
                }}
                className={`p-2 rounded-full transition-all cursor-pointer ${showAdminPanel ? "bg-accent/15 border border-accent text-accent shadow-[0_0_10px_rgba(212,175,55,0.2)]" : "border border-transparent hover:bg-white/5 text-accent"}`}
                title={showAdminPanel ? "Show Customer View" : "Admin Panel"}
              >
                <ShieldAlert size={18} />
              </button>
            )}
            <button
              onClick={handleShareApp}
              className="p-2 rounded-full border border-transparent hover:bg-white/5 transition-all text-accent cursor-pointer"
              title="Share App"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={() => {
                setShowProfileSetup(!showProfileSetup);
                setShowAdminPanel(false);
              }}
              className={`p-2 rounded-full transition-all cursor-pointer ${showProfileSetup ? "bg-accent/15 border border-accent text-accent" : "border border-transparent hover:bg-white/5 text-accent"}`}
              title="Profile Settings"
            >
              <Settings size={18} />
            </button>
            <div className="h-4 w-[1px] bg-white/10" />
            <button
              onClick={handleLogout}
              className="p-2 rounded-full border border-transparent hover:bg-red-500/10 hover:border-red-500/25 text-white/40 hover:text-red-400 transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </motion.div>
        )}

        {/* Brand Text Header */}
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="text-center space-y-2 mt-4"
        >
          <h1 className="text-accent font-serif tracking-[10px] text-3xl sm:text-4xl md:text-5xl font-light cursor-default drop-shadow-[0_0_12px_rgba(212,175,55,0.25)] select-none uppercase">
            CELESTIAL GUIDE
          </h1>
          <p className="text-[10px] font-mono uppercase tracking-[6px] text-white/30 font-light max-w-sm mx-auto">
            Vedic & modern cosmic pathfinder
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="inline-flex items-center gap-5 mt-10 md:mt-12"
        >
          <div className="h-[1px] w-12 md:w-24 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          <div className="bg-white/[0.02] backdrop-blur-md px-6 py-2.5 rounded-full text-[9px] md:text-xs tracking-[3px] uppercase font-semibold text-accent/80 border border-white/5 shadow-xl">
            {new Date().toLocaleDateString('hi-IN', { month: 'long', day: 'numeric', year: 'numeric' })} • नक्षत्रों का योग
          </div>
          <div className="h-[1px] w-12 md:w-24 bg-gradient-to-l from-transparent via-accent/30 to-transparent" />
        </motion.div>
      </header>

      <main className="container mx-auto px-4 relative z-10 max-w-6xl">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-center"
            >
              <Auth onLogin={() => {}} />
            </motion.div>
          ) : showProfileSetup ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-center"
            >
              <ProfileSetup onComplete={() => fetchProfile(user.uid)} />
            </motion.div>
          ) : showAdminPanel ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AdminPanel />
            </motion.div>
          ) : (
            <motion.div
              key="app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-12"
            >
              <div className="text-center select-none space-y-1 bg-gradient-to-b from-white/5 to-transparent py-4 px-6 rounded-3xl border border-white/[0.03] max-w-md mx-auto shadow-inner">
                <p className="text-accent/80 font-serif italic text-lg sm:text-xl capitalize flex items-center justify-center gap-1.5 font-medium">
                  <Sparkles size={16} className="text-accent animate-pulse" />
                  सादर प्रणाम, {profile?.displayName || 'आध्यात्मिक यात्री'}
                </p>
                <p className="text-[10px] text-white/40 font-mono uppercase tracking-[0.2em] font-light">
                  आपकी आकाशीय ऊर्जा का संरेखण सुचारू है
                </p>
              </div>

              {/* High-fidelity dual-column visual dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                
                {/* Primary Astrology engine (takes 7 cols) */}
                <div className="lg:col-span-7 space-y-12">
                  <AstrologyForm onSuggest={handleConsult} isLoading={isLoading} initialData={profile} />
                  
                  {/* Reading Viewer Screen (displays parsed output) */}
                  <div id="reading-section" className="scroll-mt-24">
                    <AstrologyReading reading={reading} isLoading={isLoading} />
                  </div>
                </div>

                {/* Secondary astronomical tools & records (takes 5 cols) */}
                <div className="lg:col-span-5 space-y-12">
                  
                  {/* Rotating Stellar Mandala */}
                  <ZodiacMandala />

                  {/* Saved Consultation History Card */}
                  {historyList.length > 0 && !isLoading && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full glass rounded-[2rem] p-6 md:p-8 space-y-6"
                    >
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <div className="flex items-center gap-2.5 text-left">
                          <History size={16} className="text-accent animate-pulse" />
                          <h3 className="text-sm font-serif font-semibold text-accent uppercase tracking-wider">
                            परामर्श इतिहास (SAVED READINGS)
                          </h3>
                        </div>
                        <button
                          onClick={handleClearHistory}
                          className="p-1 px-2.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-[10px] text-white/40 hover:text-red-400 border border-transparent hover:border-red-500/15 transition-all cursor-pointer font-bold uppercase tracking-widest flex items-center gap-1.5"
                          title="Clear History"
                        >
                          <Trash2 size={11} /> HATAIN
                        </button>
                      </div>

                      <div className="divide-y divide-white/[0.03] max-h-[350px] overflow-y-auto scrollbar-none pr-1 space-y-3">
                        {historyList.map((item) => (
                          <div 
                            key={item.id} 
                            onClick={() => handleSelectHistoryItem(item)}
                            className="flex items-center justify-between p-3.5 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all text-left cursor-pointer group"
                          >
                            <div className="space-y-1 pr-4 flex-grow">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-serif font-bold text-accent-soft group-hover:text-accent transition-colors">
                                  {item.title}
                                </span>
                                <span className="h-1 w-1 bg-white/20 rounded-full" />
                                <span className="text-[9px] text-white/30 font-mono">
                                  {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[10px] text-white/45 truncate max-w-[280px] font-light">
                                {item.summary}
                              </p>
                            </div>
                            <ChevronRight size={14} className="text-white/20 group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Standard premium footer */}
      <footer className="mt-36 pt-12 pb-10 border-t border-white/[0.04] mx-6 md:mx-20 relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left select-none">
        <div className="text-[10px] uppercase tracking-widest opacity-25 max-w-xl leading-loose font-semibold">
          बुद्धिमान व्यक्ति अपने सितारों पर शासन करता है, मूर्ख उनकी आज्ञा मानता है। प्रदान की गई व्याख्याएं केवल व्यक्तिगत चिंतन और वैचारिक मार्गदर्शन के लिए हैं।
        </div>
        <div className="text-[10px] opacity-25 font-mono tracking-[4px] uppercase border border-white/10 px-4 py-2 rounded-lg">
          V.4.5.3-ASTRO • {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
