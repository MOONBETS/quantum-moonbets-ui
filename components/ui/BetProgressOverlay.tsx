import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const steps = [
  "🎉 Your bet has been sealed in the Book of Fate.",
  "✨ Channeling the cosmic energies through Magicblock...",
  "🔮 Whispering to the ancient dice spirits...",
  "🧙‍♂️ A wizard begins to brew your fortune...",
  "🔥 The cauldron bubbles... fate starts to take shape...",
  "🎲 The sacred dice are cast into the ether...",
  "🌌 Time slows... the outcome dances beyond the veil...",
  "🧙 The oracle peers into the result...",
  "🏆 Will glory find you, or will you journey to Valhalla?"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white/10 border border-white/20 text-white text-center p-8 rounded-2xl shadow-xl max-w-sm mx-auto flex flex-col items-center gap-4 backdrop-blur-md"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
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
