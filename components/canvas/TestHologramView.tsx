"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PerspectiveCamera, View } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "@/lib/store";
import { sceneTokens, tokens } from "@/lib/tokens";
import styles from "./TestHologramView.module.css";

const testVertex = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewDirection;
  varying float vScan;
  void main() {
    vec3 transformed = position + normal * sin(uTime * 0.9 + position.y * 4.0) * 0.012;
    vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vViewDirection = cameraPosition - worldPosition.xyz;
    vScan = 0.5 + 0.5 * sin(transformed.y * 42.0 - uTime * 1.6);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const testFragment = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vViewDirection;
  varying float vScan;
  void main() {
    float rim = pow(1.0 - clamp(dot(normalize(vViewDirection), normalize(vNormal)), 0.0, 1.0), 2.6);
    vec3 color = uColor * (0.18 + vScan * 0.16 + rim * 1.4);
    gl_FragColor = vec4(color, 0.34 + rim * 0.58);
  }
`;

function TestHologram() {
  const mesh = useRef<THREE.Mesh>(null);
  const reducedMotion = useAppStore((state) => state.reducedMotion);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(tokens["vital-cyan"]) },
  }), []);

  useFrame((_, delta) => {
    if (!mesh.current || reducedMotion) return;
    uniforms.uTime.value += delta;
    mesh.current.rotation.y += delta * sceneTokens.testObject.rotationSpeed;
  });

  return (
    <mesh ref={mesh} scale={sceneTokens.testObject.baseScale} renderOrder={2}>
      <torusKnotGeometry args={[0.78, 0.22, 160, 24]} />
      <shaderMaterial
        vertexShader={testVertex}
        fragmentShader={testFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function RuntimeMetrics() {
  const tier = useAppStore((state) => state.qualityTier);
  const rendererGeneration = useAppStore((state) => state.rendererGeneration);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let frameId = 0;
    let frames = 0;
    let sampleStartedAt = performance.now();
    const measure = (now: number) => {
      frames += 1;
      if (now - sampleStartedAt >= 1000) {
        setFps(Math.round((frames * 1000) / (now - sampleStartedAt)));
        frames = 0;
        sampleStartedAt = now;
      }
      frameId = requestAnimationFrame(measure);
    };
    frameId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <dl className={styles.metrics} aria-label="Diagnostic du rendu WebGL">
      <div><dt>Renderer</dt><dd>#{rendererGeneration || "…"}</dd></div>
      <div><dt>Quality tier</dt><dd>{tier}</dd></div>
      <div><dt>Images/s</dt><dd>{fps || "…"}</dd></div>
    </dl>
  );
}

type TestHologramViewProps = {
  activeRoute: "dashboard" | "patient";
};

export function TestHologramView({ activeRoute }: TestHologramViewProps) {
  const track = useRef<HTMLDivElement>(null!);
  const destination = activeRoute === "dashboard" ? "/patient/PATIENT-001" : "/dashboard";
  const destinationLabel = activeRoute === "dashboard" ? "Ouvrir PATIENT-001" : "Retour au dashboard";

  return (
    <section className={styles.shell}>
      <div ref={track} className={styles.viewport} aria-hidden="true" />
      <View track={track}>
        <PerspectiveCamera
          makeDefault
          fov={sceneTokens.camera.fov}
          near={sceneTokens.camera.near}
          far={sceneTokens.camera.far}
          position={sceneTokens.camera.position}
        />
        <TestHologram />
      </View>
      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.overlay}>
        <p className={styles.eyebrow}>PHASE 1 / VIEW DE TEST</p>
        <h2>Contexte holographique persistant</h2>
        <p>Cette forme vérifie l’ancrage d’une View dans le canvas WebGL partagé.</p>
        <RuntimeMetrics />
        <Link className={styles.link} href={destination}>{destinationLabel}</Link>
      </div>
    </section>
  );
}
