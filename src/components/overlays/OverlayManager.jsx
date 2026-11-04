import { useEffect } from "react";

import { AnimatePresence, motion } from "framer-motion";

import Sidebar from "../Sidebar";
// Import other overlays here as you create them.

export default function OverlayManager({
  activeOverlay,
  onClose,
  openOverlay,
}) {
  useEffect(() => {
    if (!activeOverlay) return;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeOverlay, onClose]);

  return (
    <AnimatePresence>
      {activeOverlay && (
        <motion.div
          className="overlay-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            ease: "linear",
            duration: 0.15,
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          {activeOverlay === "sidebar" && (
            <motion.div
              className="sidebar-overlay"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                ease: [0.25, 0.1, 0.25, 1],
                duration: 0.25,
              }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <Sidebar onClose={onClose} />
            </motion.div>
          )}

          {/* Add other overlays here. */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
