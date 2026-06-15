"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }

    let active = true;

    window.addEventListener("load", () => {
      if (!active) {
        return;
      }

      navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
    });

    return () => {
      active = false;
    };
  }, []);

  return null;
}
