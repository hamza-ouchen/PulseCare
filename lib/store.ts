import { create } from "zustand";
import type { QualityPreference, QualityTier } from "./quality";
import type { DashboardFreshness, PatientId, RiskLevel } from "./monitoring/types";

export type TelemetryVisual = { patientId: PatientId; risk: RiskLevel; freshness: DashboardFreshness; heartRate: number; spo2: number; respiratoryRate: number };

type AppState = {
  pointer: { x: number; y: number };
  scrollProgress: number;
  scrollVelocity: number;
  qualityTier: QualityTier;
  qualityPreference: QualityPreference;
  reducedMotion: boolean;
  rendererGeneration: number;
  telemetry: TelemetryVisual[];
  setPointer: (x: number, y: number) => void;
  setScroll: (progress: number, velocity: number) => void;
  setQualityTier: (tier: QualityTier) => void;
  setQualityPreference: (preference: QualityPreference) => void;
  setReducedMotion: (reduced: boolean) => void;
  markRendererCreated: () => void;
  setTelemetry: (telemetry: TelemetryVisual[]) => void;
};

export const useAppStore = create<AppState>((set) => ({
  pointer: { x: 0, y: 0 },
  scrollProgress: 0,
  scrollVelocity: 0,
  qualityTier: "standard",
  qualityPreference: "auto",
  reducedMotion: false,
  rendererGeneration: 0,
  telemetry: [],
  setPointer: (x, y) => set({ pointer: { x, y } }),
  setScroll: (scrollProgress, scrollVelocity) => set({ scrollProgress, scrollVelocity }),
  setQualityTier: (qualityTier) => set({ qualityTier }),
  setQualityPreference: (qualityPreference) => set({ qualityPreference }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  markRendererCreated: () => set((state) => ({ rendererGeneration: state.rendererGeneration + 1 })),
  setTelemetry: (telemetry) => set({ telemetry }),
}));
