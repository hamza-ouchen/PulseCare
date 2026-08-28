"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "@/lib/store";
import { sceneTokens } from "@/lib/tokens";

export function Rig() {
  const camera = useThree((state) => state.camera);

  useFrame((_, delta) => {
    const state = useAppStore.getState();
    const pointerEnabled = !state.reducedMotion && Math.abs(state.scrollVelocity) <= 0.4;
    const targetX = pointerEnabled ? state.pointer.x * sceneTokens.camera.parallaxX : 0;
    const targetY = sceneTokens.camera.position[1]
      + (pointerEnabled ? state.pointer.y * sceneTokens.camera.parallaxY : 0);

    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      targetX,
      sceneTokens.camera.damping,
      delta,
    );
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      targetY,
      sceneTokens.camera.damping,
      delta,
    );
    camera.lookAt(0, 0, 0);
  });

  return null;
}
