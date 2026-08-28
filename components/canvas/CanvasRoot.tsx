"use client";

import { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PerformanceMonitor, Preload, View } from "@react-three/drei";
import * as THREE from "three";
import { lowerQualityTier, raiseQualityTier } from "@/lib/quality";
import { useAppStore } from "@/lib/store";
import { sceneTokens, tokens } from "@/lib/tokens";
import { Atmosphere } from "./Atmosphere";
import { Lights } from "./Lights";
import { Rig } from "./Rig";

function QualityController() {
  const setDpr = useThree((state) => state.setDpr);
  const lastDeclineAt = useRef(0);
  const tier = useAppStore((state) => state.qualityTier);
  const preference = useAppStore((state) => state.qualityPreference);

  useEffect(() => {
    setDpr(sceneTokens.renderer.dpr[tier][1]);
  }, [setDpr, tier]);

  return (
    <PerformanceMonitor
      flipflops={3}
      onDecline={() => {
        if (preference !== "auto") return;
        lastDeclineAt.current = performance.now();
        const state = useAppStore.getState();
        state.setQualityTier(lowerQualityTier(state.qualityTier));
      }}
      onIncline={() => {
        if (preference !== "auto") return;
        if (performance.now() - lastDeclineAt.current < sceneTokens.quality.upgradeCooldownMs) return;
        const state = useAppStore.getState();
        state.setQualityTier(raiseQualityTier(state.qualityTier));
      }}
    />
  );
}

function VisibilityController() {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) invalidate();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [invalidate]);

  return null;
}

export function CanvasRoot() {
  return (
    <div className="canvas-root" aria-hidden="true">
      <Canvas
        eventSource={document.body}
        eventPrefix="client"
        dpr={[
          sceneTokens.renderer.dpr.standard[0],
          sceneTokens.renderer.dpr.standard[1],
        ]}
        camera={{
          fov: sceneTokens.camera.fov,
          near: sceneTokens.camera.near,
          far: sceneTokens.camera.far,
          position: sceneTokens.camera.position,
        }}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = sceneTokens.renderer.exposure;
          scene.background = new THREE.Color(tokens.void);
          useAppStore.getState().markRendererCreated();
        }}
      >
        <Atmosphere />
        <Lights />
        <Rig />
        <QualityController />
        <VisibilityController />
        <View.Port />
        <Preload all />
      </Canvas>
    </div>
  );
}
