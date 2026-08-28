"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "@/lib/store";
import { sceneTokens, tokens } from "@/lib/tokens";

const atmosphereVertex = /* glsl */ `
  varying float vDistance;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vDistance = -viewPosition.z;
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = 2.0 * (1.0 / max(vDistance, 0.1));
  }
`;

const atmosphereFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    float distanceToCenter = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.0, distanceToCenter) * uOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

const backgroundVertex = /* glsl */ `
  varying vec3 vDirection;
  void main() {
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const backgroundFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uVoid;
  uniform vec3 uDeep;
  varying vec3 vDirection;
  void main() {
    float radial = smoothstep(-0.7, 0.85, vDirection.y);
    float livingVariation = sin(vDirection.x * 3.0 + vDirection.y * 2.0 + uTime * 0.02) * 0.025;
    gl_FragColor = vec4(mix(uVoid, uDeep, clamp(radial * 0.62 + livingVariation, 0.0, 1.0)), 1.0);
  }
`;

export function Atmosphere() {
  const points = useRef<THREE.Points>(null);
  const scene = useThree((state) => state.scene);
  const tier = useAppStore((state) => state.qualityTier);
  const reducedMotion = useAppStore((state) => state.reducedMotion);
  const count = sceneTokens.atmosphere.particles[tier];
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);
    const halfVolume = sceneTokens.atmosphere.volume / 2;
    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      values[offset] = (Math.random() - 0.5) * sceneTokens.atmosphere.volume;
      values[offset + 1] = (Math.random() - 0.5) * sceneTokens.atmosphere.volume;
      values[offset + 2] = -Math.random() * halfVolume;
    }
    return values;
  }, [count]);
  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(tokens["vital-cyan"]) },
    uOpacity: { value: sceneTokens.atmosphere.opacity },
  }), []);
  const backgroundUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uVoid: { value: new THREE.Color(tokens.void) },
    uDeep: { value: new THREE.Color(tokens.deep) },
  }), []);

  useEffect(() => {
    scene.fog = new THREE.FogExp2(tokens.abyss, sceneTokens.environment.fogDensity);
    return () => { scene.fog = null; };
  }, [scene]);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    backgroundUniforms.uTime.value += delta;
    if (points.current) {
      points.current.rotation.y += delta * sceneTokens.atmosphere.drift;
    }
  });

  return (
    <>
      <mesh renderOrder={-2} frustumCulled={false}>
        <sphereGeometry args={[80, 24, 16]} />
        <shaderMaterial
          vertexShader={backgroundVertex}
          fragmentShader={backgroundFragment}
          uniforms={backgroundUniforms}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <points ref={points} frustumCulled={false} renderOrder={-1}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={atmosphereVertex}
          fragmentShader={atmosphereFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}
