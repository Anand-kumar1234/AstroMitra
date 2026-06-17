import { useState, useEffect } from "react";
import { db, auth, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { motion } from "motion/react";
import { User, MapPin, Sparkles, Book, Users, Star, Calendar, Clock } from "lucide-react";

const ZODIAC_SIGNS = [
  { value: "मेष", label: "मेष (Aries)" },
  { value: "वृषभ", label: "वृषभ (Taurus)" },
  { value: "मिथुन", label: "मिथुन (Gemini)" },
  { value: "कर्क", label: "कर्क (Cancer)" },
  { value: "सिंह", label: "सिंह (Leo)" },
  { value: "कन्या", label: "कन्या (Virgo)" },
  { value: "तुला", label: "तुला (Libra)" },
  { value: "वृश्चिक", label: "वृश्चिक (Scorpio)" },
  { value: "धनु", label: "धनु (Sagittarius)" },
  { value: "मकर", label: "मकर (Capricorn)" },
  { value: "कुंभ", label: "कुंभ (Aquarius)" },
  { value: "मीन", label: "मीन (Pisces)" }
];

interface ProfileSetupProps {
  onComplete: () => void;
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    displayName: auth.currentUser?.displayName || "",
    location: "",
    religion: "",
    caste: "",
    rashi: "मेष",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
  });

  useEffect(() => {
    async function loadExisting() {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setFetching(false);
      }
    }
    loadExisting();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    const userId = auth.currentUser.uid;
    const profilePath = `users/${userId}`;

    try {
      await setDoc(doc(db, profilePath), {
        ...formData,
        userId,
        updatedAt: new Date().toISOString(),
      });
      onComplete();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, profilePath);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto glass rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
      <div className="space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-serif text-accent uppercase tracking-widest italic">अपना विवरण भरें</h2>
          <p className="text-white/40 text-sm italic tracking-wide">Enter your details to align the stars with your path.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] text-accent/60 font-bold flex items-center gap-2">
              <User size={12} strokeWidth={3} /> नाम (Name)
            </label>
            <input
              required
              placeholder="आपका नाम"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent/40 outline-none transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] text-accent/60 font-bold flex items-center gap-2">
              <MapPin size={12} strokeWidth={3} /> स्थान (Location)
            </label>
            <input
              placeholder="आपका शहर"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent/40 outline-none transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] text-accent/60 font-bold flex items-center gap-2">
              <Book size={12} strokeWidth={3} /> धर्म (Religion)
            </label>
            <input
              placeholder="आपका धर्म"
              value={formData.religion}
              onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent/40 outline-none transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] text-accent/60 font-bold flex items-center gap-2">
              <Users size={12} strokeWidth={3} /> जाति (Caste)
            </label>
            <input
              placeholder="आपकी जाति"
              value={formData.caste}
              onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent/40 outline-none transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] text-accent/60 font-bold flex items-center gap-2">
              <Star size={12} strokeWidth={3} /> राशि (Rashi)
            </label>
            <select
              value={formData.rashi}
              onChange={(e) => setFormData({ ...formData, rashi: e.target.value })}
              className="w-full bg-[#111422] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent/40 outline-none transition-all appearance-none cursor-pointer text-white"
            >
              {ZODIAC_SIGNS.map(sign => <option key={sign.value} value={sign.value} className="bg-bg-dark text-white">{sign.label}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] text-accent/60 font-bold flex items-center gap-2">
              <Calendar size={12} strokeWidth={3} /> जन्म तिथि (Birth Date)
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent/40 outline-none transition-all [color-scheme:dark] text-white"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] text-accent/60 font-bold flex items-center gap-2">
              <Clock size={12} strokeWidth={3} /> जन्म का समय (Birth Time)
            </label>
            <input
              type="time"
              value={formData.birthTime}
              onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent/40 outline-none transition-all [color-scheme:dark] text-white"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] text-accent/60 font-bold flex items-center gap-2">
              <MapPin size={12} strokeWidth={3} /> जन्म स्थान (Birth Place)
            </label>
            <input
              placeholder="शहर, देश"
              value={formData.birthPlace}
              onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent/40 outline-none transition-all"
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              disabled={loading}
              type="submit"
              className="w-full group relative flex items-center justify-center gap-3 py-5 rounded-2xl bg-gradient-to-br from-accent to-accent-soft text-bg-dark font-serif tracking-[0.25em] text-sm font-bold transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-bg-dark/30 border-t-bg-dark rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={16} /> प्रोफाइल अपडेट करें (SAVE PROFILE)
                  <Sparkles size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
