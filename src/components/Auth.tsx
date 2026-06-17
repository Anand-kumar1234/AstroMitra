import { useState } from "react";
import { auth } from "../lib/firebase";
import { signInWithPopup, GoogleAuthProvider, signInAnonymously } from "firebase/auth";
import { motion } from "motion/react";
import { Sparkles, Mail, LogIn } from "lucide-react";

interface AuthProps {
  onLogin: () => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onLogin();
    } catch (err: any) {
      console.warn("Google Sign-In failed or blocked: ", err);
      setError("गूगल लॉगिन ब्लॉक या विफल हो गया। आप नीचे दिए गए 'अतिथि प्रवेश' का उपयोग कर सकते हैं। (Google login failed/blocked. You can use Guest Login below.)");
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInAnonymously(auth);
      onLogin();
    } catch (err: any) {
      console.error("Anonymous Sign-In failed: ", err);
      setError("अतिथि प्रवेश डेटाबेस से नहीं जुड़ सका। कृपया इंटरनेट या सेटअप जांचें। (Guest sign-in failed. Please check internet connection.)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto glass rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-50" />
      
      <div className="relative z-10 space-y-8">
        <div className="space-y-4">
          <div className="h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
            <Mail className="text-accent" size={32} />
          </div>
          <h2 className="text-3xl font-serif text-accent">Astral Login</h2>
          <p className="text-sm text-white/50 leading-relaxed">
            सुरक्षित परामर्श और रिकॉर्ड सहेजने के लिए प्रवेश करें। (Enter for secure readings & records.)
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs py-3 px-4 rounded-xl text-left leading-relaxed">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-white border border-white/10 text-black font-semibold hover:bg-white/90 transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                Google के साथ लॉगिन (Sign In)
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleAnonymousLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white/5 border border-white/10 text-accent font-semibold hover:bg-white/10 hover:border-accent/40 transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                अतिथि प्रवेश (Continue as Guest)
              </>
            )}
          </button>
        </div>

        <div className="pt-4">
          <p className="text-[10px] uppercase tracking-widest text-white/20">
            Secure connection via Firebase
          </p>
        </div>
      </div>
    </div>
  );
}
