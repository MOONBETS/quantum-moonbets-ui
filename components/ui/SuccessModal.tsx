import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

interface SuccessModalProps {
  visible: boolean;
  message: string;
  duration?: number; // in ms
  onClose?: () => void;
}

export default function SuccessModal({
  visible,
  message,
  duration = 4000,
  onClose,
}: SuccessModalProps) {
  const [internalVisible, setInternalVisible] = useState(visible);

  useEffect(() => {
    setInternalVisible(visible);
    if (visible) {
      const timer = setTimeout(() => {
        setInternalVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  return (
    <AnimatePresence>
      {internalVisible && (
        <motion.div
          className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
            <CheckCircle2 className="text-green-400 w-6 h-6" />
            <span className="text-md font-medium">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
