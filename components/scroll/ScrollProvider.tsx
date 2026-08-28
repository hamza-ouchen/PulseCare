"use client";

import { type ReactNode, useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { detectInitialQualityTier } from "@/lib/quality";
import { useAppStore } from "@/lib/store";

type ScrollProviderProps = { children: ReactNode };

export function ScrollProvider({ children }: ScrollProviderProps) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const state = useAppStore.getState();
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setMotionPreference = () => state.setReducedMotion(motionQuery.matches);
    const handlePointerMove = (event: PointerEvent) => {
      state.setPointer(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
      );
    };

    state.setQualityTier(detectInitialQualityTier());
    setMotionPreference();
    motionQuery.addEventListener("change", setMotionPreference);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    lenis.on("scroll", ({ progress, velocity }) => {
      useAppStore.getState().setScroll(progress, velocity);
      ScrollTrigger.update();
    });

    const updateLenis = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      motionQuery.removeEventListener("change", setMotionPreference);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return children;
}
