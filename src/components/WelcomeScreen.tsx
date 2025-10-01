import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Music,
  Headphones,
  Users,
  Heart,
  Play,
  Sparkles,
  Volume2,
} from "lucide-react";
import { AuthModal } from "./AuthModal";
import { useAuth } from "../context/AuthContext";

export const WelcomeScreen: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  // Nếu user đã đăng nhập, không hiển thị welcome screen
  if (user) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-gradient-to-br from-black via-slate-900 to-gray-800 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {/* Floating music notes */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white/10"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                rotate: Math.random() * 360,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                rotate: 360,
              }}
              transition={{
                duration: Math.random() * 20 + 20,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
              }}
            >
              <Music
                className={`${Math.random() > 0.5 ? "w-8 h-8" : "w-6 h-6"}`}
              />
            </motion.div>
          ))}

          {/* Gradient orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-600/15 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-3/4 right-1/4 w-80 h-80 bg-slate-500/15 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/8 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Sound waves visualization */}
        <div className="absolute bottom-0 left-0 w-full h-40 flex items-end justify-center space-x-1 opacity-15">
          {[...Array(60)].map((_, i) => (
            <motion.div
              key={i}
              className="bg-gradient-to-t from-gray-500 via-slate-400 to-white w-1 rounded-t-full"
              animate={{
                height: [
                  Math.random() * 40 + 10,
                  Math.random() * 120 + 20,
                  Math.random() * 40 + 10,
                ],
              }}
              transition={{
                duration: Math.random() * 3 + 1,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.05,
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-8">
          {/* Logo section */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="relative"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-gray-400 via-slate-300 to-white rounded-full flex items-center justify-center shadow-2xl shadow-gray-500/30">
                  <Music className="w-12 h-12 text-black" />
                </div>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-gray-400 via-slate-300 to-white rounded-full opacity-20"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-7xl font-bold mb-4 welcome-logo-gradient"
            >
              SoundL
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="space-y-2"
            >
              <p className="text-2xl font-light text-gray-300">
                NGHE VÀ KHEN NGAY!!!
              </p>
            </motion.div>
          </motion.div>

          {/* Features grid */}
          

          {/* CTA Section */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="text-center space-y-6"
          >
            <motion.button
              onClick={() => setShowAuthModal(true)}
              className="relative group welcome-button-gradient hover:brightness-110 text-white font-bold px-12 py-4 rounded-full text-lg shadow-2xl shadow-emerald-500/50 transition-all duration-300 transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center">
                <Play className="w-6 h-6 mr-3" />
                Đăng Nhập Ngay
              </span>
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-full"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.button>

            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <Sparkles className="w-4 h-4" />
              <span>
                Miễn phí (đến khi còn tiền) • Không quảng cáo
                (hết tiền thì có) • Chất lượng cao (hên xui)
              </span>
              <Sparkles className="w-4 h-4" />
            </div>
          </motion.div>

          {/* Bottom decorative text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
          ></motion.div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};