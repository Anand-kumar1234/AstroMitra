import { useState, useRef, useEffect } from "react";
import { Sparkles, MapPin, Calendar, Clock, Compass, Hand, Upload, X, Check, Copy, Camera, ShieldCheck, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, doc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

interface AstrologyFormProps {
  onSuggest: (params: any) => void;
  isLoading: boolean;
  initialData?: any;
}

const zodiacMap: Record<string, string> = {
  "Aries": "मेष", "Taurus": "वृषभ", "Gemini": "मिथुन", "Cancer": "कर्क",
  "Leo": "सिंह", "Virgo": "कन्या", "Libra": "तुला", "Scorpio": "वृश्चिक",
  "Sagittarius": "धनु", "Capricorn": "मकर", "Aquarius": "कुंभ", "Pisces": "मीन"
};

const zodiacSignData = [
  { name: "Aries", hindi: "मेष", icon: "♈", english: "Aries", element: "अग्नि (Fire)", planet: "मंगल (Mars)" },
  { name: "Taurus", hindi: "वृषभ", icon: "♉", english: "Taurus", element: "पृथ्वी (Earth)", planet: "शुक्र (Venus)" },
  { name: "Gemini", hindi: "मिथुन", icon: "♊", english: "Gemini", element: "वायु (Air)", planet: "बुध (Mercury)" },
  { name: "Cancer", hindi: "कर्क", icon: "♋", english: "Cancer", element: "जल (Water)", planet: "चंद्रमा (Moon)" },
  { name: "Leo", hindi: "सिंह", icon: "♌", english: "Leo", element: "अग्नि (Fire)", planet: "सूर्य (Sun)" },
  { name: "Virgo", hindi: "कन्या", icon: "♍", english: "Virgo", element: "पृथ्वी (Earth)", planet: "बुध (Mercury)" },
  { name: "Libra", hindi: "तुला", icon: "♎", english: "Libra", element: "वायु (Air)", planet: "शुक्र (Venus)" },
  { name: "Scorpio", hindi: "वृश्चिक", icon: "♏", english: "Scorpio", element: "जल (Water)", planet: "मंगल (Mars)" },
  { name: "Sagittarius", hindi: "धनु", icon: "♐", english: "Sagittarius", element: "अग्नि (Fire)", planet: "बृहस्पति (Jupiter)" },
  { name: "Capricorn", hindi: "मकर", icon: "♑", english: "Capricorn", element: "पृथ्वी (Earth)", planet: "शनि (Saturn)" },
  { name: "Aquarius", hindi: "कुंभ", icon: "♒", english: "Aquarius", element: "वायु (Air)", planet: "शनि (Saturn)" },
  { name: "Pisces", hindi: "मीन", icon: "♓", english: "Pisces", element: "जल (Water)", planet: "बृहस्पति (Jupiter)" },
];

export default function AstrologyForm({ onSuggest, isLoading, initialData }: AstrologyFormProps) {
  const getInitialRashi = (rashiInput?: string) => {
    if (!rashiInput) return "मेष";
    return zodiacMap[rashiInput] || rashiInput;
  };

  const [activeTab, setActiveTab] = useState<"birth" | "zodiac" | "palmistry">("birth");
  const [formData, setFormData] = useState({
    birthDate: initialData?.birthDate || "",
    birthTime: initialData?.birthTime || "",
    birthPlace: initialData?.birthPlace || "",
    zodiacSign: getInitialRashi(initialData?.rashi),
  });

  const [image, setImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [utr, setUtr] = useState("");
  const [copySuccess, setCopySuccess] = useState("");
  const [compressing, setCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with initial profile data if it updates post-mount
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        birthDate: initialData.birthDate || prev.birthDate,
        birthTime: initialData.birthTime || prev.birthTime,
        birthPlace: initialData.birthPlace || prev.birthPlace,
        zodiacSign: getInitialRashi(initialData.rashi) || prev.zodiacSign,
      }));
    }
  }, [initialData]);

  // Scanning loop messages during loading
  useEffect(() => {
    let timer: any;
    if (isLoading) {
      setScanStep(0);
      timer = setInterval(() => {
        setScanStep(prev => (prev + 1) % 6);
      }, 2000);
    } else {
      setScanStep(0);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  const scanningMessages = [
    "✨ चित्र का सूक्ष्म कोणीय विश्लेषण प्रारंभ हो रहा है...",
    "🔍 हृदय रेखा (Heart Line) के प्रवाह पथ की लंबाई आकलित की जा रही है...",
    "🧠 मस्तिष्क रेखा (Head Line) के रचनात्मक कोण का विश्लेषण हो रहा है...",
    "🌱 जीवन रेखा (Life Line) के मुख्य स्वास्थ्य पर्वतों की ऊर्जा जांची जा रही है...",
    "🪐 शुक्र, गुरु, सूर्य और मकर पर्वतों के गोचर प्रभावों का आकलन जारी है...",
    "🔑 अंतिम ब्रह्मांडीय मार्गदर्शन पत्र प्रस्तुत किया जा रहा है..."
  ];

  const birthCalculationMessages = [
    "✨ आपके जन्म समय और स्थान के अक्षांश-देशांतर निकाले जा रहे हैं...",
    "🪐 वर्तमान भाव चक्र और सूर्य-चन्द्र राशियों का मिलान हो रहा है...",
    "🌟 ब्रह्मांडीय नक्षत्रों की सटीक गोचर गणना की जा रही है...",
    "✨ लग्न प्रभाव और मुख्य महादशा मार्गदर्शिका तैयार हो रही है..."
  ];

  const horoscopeMessages = [
    "🌌 आपकी राशि के वर्तमान आकाशीय चक्र का सूक्ष्म अध्ययन हो रहा है...",
    "🎨 आज के शुभ रंग, भाग्यशाली अंक और सर्वश्रेष्ठ मुहूर्त की गणना जारी है...",
    "✨ वैदिक मंत्र प्रभाव के साथ दैनिक मार्गदर्शन संकलित किया जा रहा है..."
  ];

  const getLoadingMessage = () => {
    if (activeTab === "palmistry") {
      return scanningMessages[scanStep % scanningMessages.length];
    } else if (activeTab === "birth") {
      return birthCalculationMessages[scanStep % birthCalculationMessages.length];
    } else {
      return horoscopeMessages[scanStep % horoscopeMessages.length];
    }
  };

  const compressImage = (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            const base64String = (reader.result as string).split(",")[1];
            resolve({ data: base64String, mimeType: file.type });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          const compressedBase64 = compressedDataUrl.split(",")[1];
          resolve({ data: compressedBase64, mimeType: "image/jpeg" });
        };
        img.onerror = (err) => reject(err);
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("कृपया केवल फोटो फाइल अपलोड करें। (Please select an image file.)");
      return;
    }
    setCompressing(true);
    try {
      const result = await compressImage(file);
      setImage(result);
      setPreview(`data:image/jpeg;base64,${result.data}`);
    } catch (err) {
      console.error("Compression error, falling back:", err);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1];
        setImage({ data: base64String, mimeType: file.type });
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setCompressing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("9162810434@ptyes");
    setCopySuccess("UPI ID कॉपी हो गया!");
    setTimeout(() => setCopySuccess(""), 2500);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "birth") {
      onSuggest({ ...formData, type: "personalized" });
    } else if (activeTab === "zodiac") {
      onSuggest({ zodiacSign: formData.zodiacSign, type: "horoscope" });
    } else if (activeTab === "palmistry") {
      if (!image) {
        alert("कृपया पहले अपनी हथेली की फोटो अपलोड करें। (Please upload a photo of your palm first.)");
        return;
      }
      if (!utr.trim() || utr.trim().length < 6) {
        alert("कृपया भुगतान करने के बाद वैध UTR (Transaction ID) दर्ज करें। (Please enter a valid UTR/UPI Transaction ID after payment.)");
        return;
      }

      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          alert("कृपया आगे बढ़ने के लिए पहले लॉगिन करें। (Please log in first before palm reading.)");
          return;
        }

        const txCollection = collection(db, "transactions");
        const txDoc = doc(txCollection);
        const transactionId = txDoc.id;

        await setDoc(txDoc, {
          transactionId,
          userId: currentUser.uid,
          userEmail: currentUser.email || "",
          displayName: currentUser.displayName || initialData?.displayName || "यात्री",
          utr: utr.trim(),
          amount: 5,
          upiId: "9162810434@ptyes",
          status: "Pending Verification",
          createdAt: new Date().toISOString()
        });

        onSuggest({ image, type: "palmistry", utr: utr.trim() });
      } catch (err) {
        console.error("Error creating transaction in Firestore:", err);
        alert("सत्यापन रिकॉर्ड सहेजने में त्रुटि हुई। कृपया पुनः प्रयास करें। (Error saving verification record. Please try again.)");
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto glass rounded-[2.5rem] overflow-hidden p-6 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border-white/[0.08] relative">
      
      {/* Visual Scanning / Vedic Math Loading Screen overlay directly inside form */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-bg-dark/95 backdrop-blur-md z-40 flex flex-col items-center justify-center p-8 text-center"
          >
            {activeTab === "palmistry" && preview ? (
              <div className="relative w-56 h-56 rounded-full border-2 border-accent/30 overflow-hidden mb-8 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
                <img src={preview} alt="Scanning" className="w-full h-full object-cover opacity-70 animate-pulse" />
                {/* Horizontal shimmering laser line */}
                <motion.div
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_0_15px_#d4af37]"
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
              </div>
            ) : (
              <div className="relative w-40 h-40 mb-10 flex items-center justify-center">
                {/* Astrology Kundli Rotating Mandala */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-accent/20 flex items-center justify-center"
                >
                  <div className="absolute w-[80%] h-[80%] rounded-full border border-double border-accent/30" />
                  <div className="absolute w-[50%] h-[50%] rounded-full border border-dotted border-accent/10" />
                </motion.div>
                <Compass className="text-accent animate-spin w-16 h-16 opacity-80" style={{ animationDuration: '6s' }} />
                <Sparkles className="absolute text-accent-soft w-6 h-6 animate-ping" />
              </div>
            )}

            <h3 className="text-xl md:text-2xl font-serif text-accent uppercase tracking-widest mb-4">
              {activeTab === "palmistry" ? "हस्तरेखा स्कैनिंग प्रक्रिया" : activeTab === "birth" ? "कुण्डली कोष्टक गणना" : "दैनिक गोचर मिलान"}
            </h3>
            
            <p className="text-sm text-white/80 font-light max-w-md min-h-[3rem] italic leading-relaxed tracking-wide animate-pulse">
              {getLoadingMessage()}
            </p>

            <div className="mt-8 flex gap-1.5 justify-center">
              {[0, 1, 2, 3].map((dot) => (
                <motion.div
                  key={dot}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.2 }}
                  className="h-2 w-2 rounded-full bg-accent"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative celestial background details inside form */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-accent/2 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-accent/2 rounded-full blur-3xl pointer-events-none" />

      {/* Modern, elegant tab selectors */}
      <div className="flex gap-1.5 mb-10 p-1.5 bg-black/45 rounded-2xl border border-white/5 relative z-10 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("birth")}
          className={`flex-1 py-3.5 px-4 rounded-xl text-xs tracking-widest uppercase font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "birth"
              ? "bg-gradient-to-br from-accent/90 to-accent-soft text-bg-dark shadow-[0_4px_16px_rgba(212,175,55,0.25)]"
              : "text-white/40 hover:text-white/80 hover:bg-white/5"
          }`}
        >
          <Compass size={14} className={activeTab === 'birth' ? 'stroke-[2.5]' : ''} />
          जन्म कुंडली
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("zodiac")}
          className={`flex-1 py-3.5 px-4 rounded-xl text-xs tracking-widest uppercase font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "zodiac"
              ? "bg-gradient-to-br from-accent/90 to-accent-soft text-bg-dark shadow-[0_4px_16px_rgba(212,175,55,0.25)]"
              : "text-white/40 hover:text-white/80 hover:bg-white/5"
          }`}
        >
          <Sparkles size={14} className={activeTab === 'zodiac' ? 'stroke-[2.5]' : ''} />
          दैनिक राशिफल
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("palmistry")}
          className={`flex-1 py-3.5 px-4 rounded-xl text-xs tracking-widest uppercase font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "palmistry"
              ? "bg-gradient-to-br from-accent/90 to-accent-soft text-bg-dark shadow-[0_4px_16px_rgba(212,175,55,0.25)]"
              : "text-white/40 hover:text-white/80 hover:bg-white/5"
          }`}
        >
          <Hand size={14} className={activeTab === 'palmistry' ? 'stroke-[2.5]' : ''} />
          हस्तरेखा स्कैन
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        
        {/* BIRTH DETAILS TAB */}
        {activeTab === "birth" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            key="birth-fields"
            className="space-y-6"
          >
            <div className="space-y-3 text-left">
              <label htmlFor="birth-date" className="text-[10px] uppercase tracking-[0.2em] text-accent/70 font-semibold flex items-center gap-2">
                <Calendar size={13} className="text-accent" /> जन्म तिथि (Date of Birth) *
              </label>
              <input
                required
                id="birth-date"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full bg-black/35 border border-white/10 rounded-xl px-4 py-3.5 outline-none focus:border-accent/50 focus:bg-white/[0.03] transition-all text-sm font-medium [color-scheme:dark]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-3">
                <label htmlFor="birth-time" className="text-[10px] uppercase tracking-[0.2em] text-accent/70 font-semibold flex items-center gap-2">
                  <Clock size={13} className="text-accent" /> जन्म समय (Birth Time)
                </label>
                <input
                  id="birth-time"
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                  className="w-full bg-black/35 border border-white/10 rounded-xl px-4 py-3.5 outline-none focus:border-accent/50 focus:bg-white/[0.03] transition-all text-sm font-medium [color-scheme:dark]"
                />
              </div>
              <div className="space-y-3">
                <label htmlFor="birth-place" className="text-[10px] uppercase tracking-[0.2em] text-accent/70 font-semibold flex items-center gap-2">
                  <MapPin size={13} className="text-accent" /> जन्म स्थान (Birth Place) *
                </label>
                <input
                  required
                  id="birth-place"
                  type="text"
                  placeholder="उदा. पटना, बिहार"
                  value={formData.birthPlace}
                  onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                  className="w-full bg-black/35 border border-white/10 rounded-xl px-4 py-3.5 placeholder-white/20 outline-none focus:border-accent/50 focus:bg-white/[0.03] transition-all text-sm font-medium"
                />
              </div>
            </div>

            {initialData && (
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-3 text-left">
                <ShieldCheck size={18} className="text-accent shrink-0 animate-pulse" />
                <p className="text-[11px] text-white/50 leading-relaxed">
                  नमस्ते <span className="text-accent/90 font-medium">{initialData.displayName}</span>! आपके प्रोफाइल विवरण से जन्म इतिहास स्वचालित रूप से जोड़ दिया गया है।
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ZODIAC SIGN TAB */}
        {activeTab === "zodiac" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            key="zodiac-fields"
            className="space-y-6"
          >
            <div className="space-y-4 text-left">
              <label className="text-[10px] uppercase tracking-[0.2em] text-accent/70 font-semibold flex items-center gap-2 mb-2">
                <Compass size={13} className="text-accent" /> अपनी राशि का चयन करें (Select Your Zodiac)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {zodiacSignData.map((sign) => {
                  const isSelected = formData.zodiacSign === sign.hindi;
                  return (
                    <button
                      key={sign.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, zodiacSign: sign.hindi })}
                      className={`flex flex-col p-3 rounded-xl border transition-all duration-300 cursor-pointer text-left relative overflow-hidden group ${
                        isSelected
                          ? "bg-accent/[0.08] border-accent/70 shadow-[0_0_20px_rgba(212,175,55,0.15)] bg-gradient-to-b from-accent/5 to-transparent"
                          : "bg-black/25 border-white/5 hover:border-white/20 hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`text-2xl transition-transform duration-500 ${isSelected ? 'scale-110 rotate-12 text-accent' : 'text-white/60 group-hover:scale-105'}`}>
                          {sign.icon}
                        </span>
                        <span className="text-[9px] font-mono opacity-35 uppercase">{sign.english}</span>
                      </div>
                      
                      <div className="font-serif text-sm font-semibold text-white/90 leading-tight">
                        {sign.hindi}
                      </div>

                      <div className="text-[8px] text-white/40 mt-1 uppercase flex flex-col font-mono">
                        <span>तत्व: {sign.element.split(" ")[0]}</span>
                        <span>स्वामी: {sign.planet.split(" ")[0]}</span>
                      </div>

                      {isSelected && (
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-transparent to-accent/20 rounded-tl-full flex items-end justify-end p-1">
                          <Check size={8} className="text-accent" strokeWidth={4} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* PALM SCAN TABS */}
        {activeTab === "palmistry" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            key="palmistry-fields"
            className="space-y-6"
          >
            <div className="space-y-3 text-left">
              <label className="text-[10px] uppercase tracking-[0.2em] text-accent/70 font-semibold flex items-center gap-2">
                <Hand size={13} className="text-accent" /> हथेली की स्पष्ट फोटो (Palm Image Detail) *
              </label>
              
              {!preview ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`w-full aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group p-6 relative overflow-hidden ${
                    isDragging 
                      ? "border-accent bg-accent/5" 
                      : "border-white/10 bg-black/25 hover:bg-white/[0.02] hover:border-accent/40"
                  }`}
                >
                  {compressing ? (
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-10 w-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                      <p className="text-xs text-accent mt-2 animate-pulse font-medium">हस्तरेखा फोटो ऑप्टिमाइज़ की जा रही है...</p>
                      <p className="text-[9px] text-white/30">(Compacting size for instant results)</p>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 rounded-full bg-accent/10 text-accent group-hover:scale-105 shadow-[0_0_20px_rgba(212,175,55,0.06)] transition-all">
                        <Upload size={22} className="stroke-[2.5]" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold tracking-wide text-white/80">हथेली का फोटो अपलोड करें</p>
                        <p className="text-[9px] text-white/40 uppercase tracking-[0.15em] mt-1.5">पिक्चर फाइल (.PNG, .JPG) ड्रैग करें या यहाँ क्लिक करें</p>
                      </div>
                    </>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Glowing Preview Box */}
                  <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/15 shadow-2xl group">
                    <img src={preview} alt="Palm Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
                    
                    {/* Laser Scanner animation preview */}
                    <div className="absolute top-[40%] left-0 right-0 h-[1.5px] bg-accent/80 shadow-[0_0_10px_#d4af37] opacity-60 flex items-center justify-center">
                      <span className="bg-bg-dark border border-accent/40 px-3 py-1 rounded text-[8px] tracking-widest text-accent uppercase font-mono shadow-md">READY TO SCAN</span>
                    </div>

                    <button 
                      type="button"
                      onClick={clearImage}
                      className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                      title="Clear Image"
                    >
                      <X size={15} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* UPI Gateway Module */}
                  <div className="p-6 rounded-3xl border border-accent/15 bg-black/35 space-y-5 shadow-[0_16px_32px_rgba(0,0,0,0.4)] text-left">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <Cpu size={14} className="text-accent" />
                        <span className="text-xs uppercase tracking-widest text-accent font-bold">दक्षिणा: ₹5 (SCAN SERVICES)</span>
                      </div>
                      <span className="text-[9px] text-green-400 bg-green-500/10 border border-green-500/15 px-2 py-0.5 rounded uppercase tracking-wider font-semibold">100% SECURE</span>
                    </div>
                    
                    <p className="text-xs text-white/60 leading-relaxed font-light">
                      अपनी दोनों प्रमुख हस्तरेखाओं का सूक्ष्म आर्टिफिशियल इंटेलिजेंस आधारित वैदिक और वैज्ञानिक हस्तरेखा विवरण प्राप्त करने के लिए कृपया ₹5 का भुगतान करें।
                    </p>

                    {/* QR alignment block */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-1">
                      <div className="bg-white p-2 md:p-3 rounded-2xl flex items-center justify-center w-[140px] h-[140px] shrink-0 shadow-lg border border-white/10">
                        <img 
                          src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi%3A%2F%2Fpay%3Fpa%3D9162810434%40ptyes%26pn%3DCelestial%2520Compass%26am%3D5%26cu%3DINR%26tn%3DPalmistry%2520Scan" 
                          alt="UPI QR Code"
                          className="w-[120px] h-[120px]"
                        />
                      </div>
                      
                      <div className="flex-grow space-y-3.5 w-full text-center sm:text-left">
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-white/30 font-medium">UPI BHIM / GPay / Paytm / PhonePe</div>
                          <div className="text-xs text-white/50 italic mt-0.5">इस कोड को ऐप में सीधे स्कैन करें</div>
                        </div>
                        <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3 max-w-xs mx-auto sm:mx-0">
                          <span className="text-xs font-mono font-semibold text-accent tracking-wide select-all">9162810434@ptyes</span>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-accent transition-colors cursor-pointer"
                            title="Copy UPI ID"
                          >
                            {copySuccess ? <Check size={14} className="text-green-400" /> : <Copy size={13} />}
                          </button>
                        </div>
                        {copySuccess && (
                          <div className="text-[10px] text-green-400 font-medium">{copySuccess}</div>
                        )}
                      </div>
                    </div>

                    {/* Transaction ID block */}
                    <div className="space-y-2 border-t border-white/5 pt-4">
                      <label htmlFor="utr-input" className="text-[10px] uppercase tracking-widest text-[#f0f0f0]/60 font-semibold block">
                        UPI UTR / Transaction ID (12-अंकों का नंबर दर्ज करें) *
                      </label>
                      <input
                        id="utr-input"
                        type="text"
                        required
                        placeholder="उदा. 415486985123"
                        value={utr}
                        onChange={(e) => setUtr(e.target.value.replace(/[^0-9]/g, ""))}
                        className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent/50 text-sm font-mono text-center tracking-widest text-white ring-offset-bg-dark transition-all"
                      />
                      <span className="text-[9px] text-white/30 block text-right">
                        * दर्ज करने पर, हस्तरेखा स्कैन और विवरण तुरंत संचालित किया जायेगा।
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Global Submit trigger */}
        <button
          disabled={isLoading}
          type="submit"
          className="w-full group relative flex items-center justify-center gap-3 py-5 rounded-2xl bg-gradient-to-br from-accent to-accent-soft text-bg-dark font-serif tracking-[0.25em] text-sm font-bold shadow-[0_8px_24px_rgba(212,175,55,0.12)] hover:shadow-[0_12px_32px_rgba(212,175,55,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed overflow-hidden cursor-pointer"
        >
          <Sparkles size={16} className="text-bg-dark font-bold group-hover:scale-110 transition-transform" />
          {activeTab === "palmistry" ? "हस्तरेखा विश्लेषण आरंभ करें" : activeTab === "birth" ? "कुण्डली मार्गदर्शन प्राप्त करें" : "दैनिक राशिफल देखें"}
          <Sparkles size={16} className="text-bg-dark font-bold group-hover:scale-110 transition-transform" />
        </button>
      </form>
    </div>
  );
}
