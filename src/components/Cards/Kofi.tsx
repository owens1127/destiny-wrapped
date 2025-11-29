"use client";

import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useColor } from "@/ui/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { trackEvent } from "@/analytics/posthog-client";

export function KofiCard({ idx }: { idx: number }) {
  const colorClass = useColor(idx);

  return (
    <DestinyWrappedCard
      className={`bg-gradient-to-br ${colorClass} relative overflow-hidden`}
    >
      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-10 left-10 text-6xl opacity-20"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        ✨
      </motion.div>
      <motion.div
        className="absolute top-20 right-16 text-5xl opacity-20"
        animate={{
          y: [0, -15, 0],
          rotate: [0, -10, 10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        🎉
      </motion.div>
      <motion.div
        className="absolute bottom-16 left-16 text-4xl opacity-20"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 15, -15, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        ⭐
      </motion.div>

      <CardHeader className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <CardTitle className="text-4xl font-black text-center text-white drop-shadow-lg mb-2">
              You&apos;re done! 🎉
            </CardTitle>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-white/80 text-lg"
          >
            Thanks for exploring your Destiny 2 year!
          </motion.p>
        </motion.div>
      </CardHeader>
      <CardContent className="relative z-10 p-4 text-white flex flex-col items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="text-center space-y-6"
        >
          <motion.p
            className="text-xl font-semibold"
            animate={{
              opacity: [1, 0.8, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Enjoyed your wrapped? Share it with the tag{" "}
            <motion.span
              className="text-cyan-300 font-bold"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            >
              #Destiny2Wrapped2025
            </motion.span>{" "}
            and consider supporting this project!
          </motion.p>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
          >
            <a
              href="https://ko-fi.com/newo1"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackEvent("kofi_button_clicked", { location: "card" });
              }}
              className="relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#13C3FF] via-[#0ea5e9] to-[#13C3FF] bg-[length:200%_100%] hover:bg-[length:200%_100%] text-white rounded-xl transition-all font-bold text-lg shadow-2xl hover:shadow-[#13C3FF]/50 hover:scale-110 overflow-hidden group"
              style={{
                backgroundPosition: "0% 50%",
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#0ea5e9] via-[#13C3FF] to-[#0ea5e9] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  backgroundSize: "200% 100%",
                  backgroundPosition: "100% 50%",
                }}
              />
              <motion.span
                className="text-2xl relative z-10"
                animate={{
                  rotate: [0, 15, -15, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ☕
              </motion.span>
              <span className="relative z-10">Buy me a coffee</span>
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
            </a>
          </motion.div>
        </motion.div>
      </CardContent>
    </DestinyWrappedCard>
  );
}
