"use client";

import { useEffect } from "react";

export default function StatusBarFix() {
  useEffect(() => {
    const fixStatusBar = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (Capacitor.isNativePlatform()) {
          const { StatusBar } = await import("@capacitor/status-bar");
          await StatusBar.setOverlaysWebView({ overlay: false });
          await StatusBar.setBackgroundColor({ color: "#ffffff" });
        }
      } catch (e) {
        // Silently catch on non-native environments
      }
    };

    fixStatusBar();
  }, []);

  return null;
}
