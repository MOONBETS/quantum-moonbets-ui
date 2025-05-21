import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const steps = [
  "🎉 Bet placed successfully!",
  "✨ Hang tight... Fetching randomness from Magicblock...",
  "🔮 Contacting the dice spirits...",
  "🧙‍♂️ Brewing your result...",
  "🎲 Rolling the dice...",
  "🚀 Almost there..."
];

interface BetProgressOverlayProps {
  visible: boolean;
  onComplete?: () => void;
}

export default function BetProgressOverlay({ visible, onComplete }: BetProgressOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;

    setStepIndex(0);
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(interval);
        if (onComplete) onComplete();
        return prev;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#0a0a1a]/80 to-[#1a1a3a]/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white/10 border border-white/20 text-white text-center p-8 rounded-2xl shadow-2xl max-w-sm mx-auto flex flex-col items-center gap-4 backdrop-blur-lg"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
            <p className="text-lg font-medium">{steps[stepIndex]}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
