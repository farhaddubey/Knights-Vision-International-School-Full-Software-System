// Shared fullscreen behavior for all school panels.
import { useEffect } from "react";

export default function useForceFullScreen(reloadKey) {
  useEffect(() => {
    const tryEnterFullscreen = () => {
      // Check if already in fullscreen
      if (document.fullscreenElement) return;

      const element = document.documentElement;

      element.requestFullscreen?.().catch((err) =>
        console.warn("Failed to enter fullscreen:", err)
      );
    };

    const triggerEvents = ["click", "keydown", "touchstart"];

    for (const ev of triggerEvents) {
      window.addEventListener(ev, tryEnterFullscreen);
    }

    return () => {
      for (const ev of triggerEvents) {
        window.removeEventListener(ev, tryEnterFullscreen);
      }
    };
  }, [reloadKey]); // Re-run effect when reloadKey changes
}
