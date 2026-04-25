import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { Auth } from "./components/Auth";
import { supabase } from "./lib/supabase";
import {
  ThemeProvider,
  useTheme,
} from "./contexts/ThemeContext";
import { WalkieTalkieProvider } from "./contexts/WalkieTalkieContext";
import { Home } from "./components/Home";
import { Maps } from "./components/Maps";
import { StartRide } from "./components/StartRide";
import { Groups } from "./components/Groups";
import { Profile } from "./components/Profile";
import { AllPosts } from "./components/AllPosts";
import { Settings } from "./components/Settings";
import { Chat } from "./components/Chat";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { BottomNav } from "./components/BottomNav";
import { RideProvider } from "./contexts/RideContext";
import { ToastProvider } from "./contexts/ToastContext";
import { LiveRoomProvider, useLiveRoom } from "./contexts/LiveRoomContext";
import { Settings as SettingsGearIcon, Search } from "lucide-react";
import { RideRoom } from "./components/RideRoom";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useToast } from "./contexts/ToastContext";
import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { AnimatePresence, motion } from "framer-motion";




function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isOffline, setIsOffline] = useState(!window.navigator.onLine);
  const { theme } = useTheme();
  const { activeRide, liveKitToken } = useLiveRoom();
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast("System Back Online", "success");
    };
    const handleOffline = () => {
      setIsOffline(true);
      toast("Operational in Offline Mode", "error");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Capacitor Back Button Handling
    let backListener: any = null;
    if (Capacitor.isNativePlatform()) {
      backListener = CapApp.addListener("backButton", (data) => {
        if (location.pathname !== "/") {
          navigate(-1);
        } else {
          // Exit app if on home
          CapApp.exitApp();
        }
      });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (backListener) {
        backListener.then((l: any) => l.remove());
      }
    };
  }, [location, toast, navigate]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      // Only enable hide-on-scroll for the Home view as requested
      if (location.pathname !== "/") {
        setIsNavVisible(true);
        return;
      }

      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  const renderView = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="min-h-full"
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/maps" element={<Maps />} />
            <Route path="/start" element={<StartRide />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/allposts" element={<AllPosts />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/rideroom" element={<RideRoom />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    );
  };

  const isNavigableBaseView = 
    location.pathname === "/" || 
    location.pathname === "/maps" || 
    location.pathname === "/start" || 
    location.pathname === "/groups" || 
    location.pathname === "/profile";

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={liveKitToken || ""}
      serverUrl={import.meta.env.VITE_LIVEKIT_URL || "ws://localhost:7880"}
      connect={!!liveKitToken}
    >
    <div className={`min-h-screen relative ${theme === "light" ? "bg-slate-50 text-slate-900" : "bg-[#0B0F19] text-white"}`}>
      <RoomAudioRenderer />
      
      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] py-1 text-center sticky top-[env(safe-area-inset-top)] z-50">
          Neural Link Offline • Some services restricted
        </div>
      )}

      {/* Top Navbar */}
      <header className={`sticky top-0 z-40 pt-[env(safe-area-inset-top)] ${theme === "light" ? "bg-slate-50/90" : "bg-[#0B0F19]/90"} backdrop-blur-xl border-b border-white/5`}>
        <div className="px-5 py-3 flex items-center justify-between">
          <h1 className="font-black text-xl tracking-tighter bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Velocity
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/groups")}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <SettingsGearIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24 overflow-x-hidden">{renderView()}</main>

      {/* Bottom Navigation */}
      {isNavigableBaseView && (
          <BottomNav 
            visible={isNavVisible}
          />
        )}
    </div>
    </LiveKitRoom>
  );
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch(err => {
      console.error("Session sync failed:", err);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ThemeProvider>
          <ToastProvider>
            <RideProvider>
              <WalkieTalkieProvider>
                <LiveRoomProvider>
                  {loading ? (
                    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>
                  ) : !session ? (
                    <Auth onAuthComplete={() => {}} />
                  ) : (
                    <AppContent />
                  )}
                </LiveRoomProvider>
              </WalkieTalkieProvider>
            </RideProvider>
          </ToastProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
