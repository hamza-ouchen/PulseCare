"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { sceneTokens, tokens } from "@/lib/tokens";

export function Lights() {
  return (
    <Environment resolution={sceneTokens.environment.resolution} frames={1} background={false}>
      <Lightformer
        form="rect"
        intensity={sceneTokens.environment.backgroundLight}
        color={tokens.deep}
        scale={[30, 30, 1]}
        position={[0, 0, -12]}
      />
      <Lightformer
        form="rect"
        intensity={sceneTokens.environment.cyanLight}
        color={tokens["vital-cyan"]}
        scale={[2, 8, 1]}
        position={[5, 1, 2]}
        rotation={[0, -Math.PI / 3, 0]}
      />
      <Lightformer
        form="rect"
        intensity={sceneTokens.environment.violetLight}
        color={tokens["vital-violet"]}
        scale={[2, 8, 1]}
        position={[-5, 0.5, -2]}
        rotation={[0, Math.PI / 3, 0]}
      />
      <Lightformer
        form="circle"
        intensity={sceneTokens.environment.topLight}
        color={tokens.bone}
        scale={[4, 4, 1]}
        position={[0, 6, 1]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </Environment>
  );
}
