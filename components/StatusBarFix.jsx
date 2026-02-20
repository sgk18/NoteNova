"use client";

import { useEffect } from "react";
import { StatusBar } from "@capacitor/status-bar";

export default function StatusBarFix() {
  useEffect(() => {
    const fixStatusBar = async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setBackgroundColor({ color: "#ffffff" }); // for white theme
      } catch (e) {
        console.log("Not running on mobile");
      }
    };

    fixStatusBar();
  }, []);

  return null;
}
