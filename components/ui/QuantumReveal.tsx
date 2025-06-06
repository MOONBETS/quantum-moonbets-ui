import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export interface AnimatedValues {
  quantum: number;
  adjustedChance: number;
  entropy: number;
  confidence: number;
  variation: number;
}

interface QuantumAnimationProps {
  visible: boolean;
  animatedValues: AnimatedValues;
  revealed: boolean;
  finalLog?: { success: boolean };
  verified?: boolean;
  onClose?: () => void;
  particlesResolved: boolean;
}

const QuantumAnimation: React.FC<QuantumAnimationProps> = ({
  visible,
  animatedValues,
  revealed,
  finalLog,
  verified,
  onClose,
  particlesResolved,
}) => {
  // Local state for the displayed (animated) values.
  const [displayedVals, setDisplayedVals] = useState<AnimatedValues>({
    quantum: 0,
    adjustedChance: 0,
    entropy: 0,
    confidence: 0,
    variation: 0,
  });

  const animRef = useRef<number | null>(null);

  // Animate toward target values over a given duration.
  const animateTowardTarget = (
    target: AnimatedValues,
    current: AnimatedValues,
    duration = 5000
  ) => {
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      const newValues: AnimatedValues = {
        quantum: current.quantum + (target.quantum - current.quantum) * eased,
        adjustedChance:
          current.adjustedChance +
          (target.adjustedChance - current.adjustedChance) * eased,
        entropy: current.entropy + (target.entropy - current.entropy) * eased,
        confidence:
          current.confidence + (target.confidence - current.confidence) * eased,
        variation:
          current.variation + (target.variation - current.variation) * eased,
      };

      setDisplayedVals(newValues);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  // When animatedValues change and the animation is not yet revealed, animate toward the new target.
  useEffect(() => {
    if (!animatedValues) return;
    if (!revealed) {
      // Clear any previous animation frame.
      if (animRef.current) cancelAnimationFrame(animRef.current);
      animateTowardTarget(animatedValues, displayedVals);
    } else {
      // If revealed, immediately set displayed values to the target.
      setDisplayedVals(animatedValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animatedValues, revealed]);

  const handleBackgroundClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent clicks inside the content from closing the modal.
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackgroundClick} // dismiss modal on background click
        >
          <motion.div
            className="relative bg-white/10 border border-white/20 text-white text-center p-8 rounded-2xl shadow-xl max-w-sm mx-auto flex flex-col items-center gap-4 backdrop-blur-md"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleContentClick}
          >
            {/* "X" button to close modal */}
            {onClose && (
              <button
                className="absolute top-2 right-2 text-white text-xl"
                onClick={onClose}
              >
                ✖
              </button>
            )}
            {!revealed && (
              <>
                <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
                <div>
                  <div>
                    <strong>Quantum (Q):</strong>{" "}
                    {displayedVals.quantum.toFixed(10)}
                  </div>
                  <div>
                    <strong>Adjusted Chance (P):</strong>{" "}
                    {(displayedVals.adjustedChance * 100).toFixed(5)}%
                  </div>
                  <div>
                    <strong>Entropy (E):</strong>{" "}
                    {displayedVals.entropy.toFixed(10)}
                  </div>
                  <div>
                    <strong>Confidence (C):</strong>{" "}
                    {displayedVals.confidence.toFixed(10)}
                  </div>
                  <div>
                    <strong>Variation (V):</strong>{" "}
                    {displayedVals.variation.toFixed(10)}
                  </div>
                </div>
                <div className="text-blue-500 font-medium">
                  🔄 Reading quantum state...
                </div>
              </>
            )}
            {revealed && (
              <>
                {/* Result display */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`mb-8 text-4xl font-bold ${
                    particlesResolved ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {particlesResolved ? "TO THE MOON!" : "CRASHED!"}
                </motion.div>
                <div className={verified ? "text-green-500" : "text-red-500"}>
                  {verified ? "✔️ Verified fair" : "⚠️ Verification failed"}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuantumAnimation;
