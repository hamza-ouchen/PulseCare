export type QualityTier = "eco" | "standard" | "ultra";
export type QualityPreference = "auto" | QualityTier;

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

export function detectInitialQualityTier(): QualityTier {
  if (typeof window === "undefined") {
    return "standard";
  }

  const navigatorWithMemory = navigator as NavigatorWithMemory;
  const memory = navigatorWithMemory.deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

  if (memory < 4 || cores <= 4 || coarsePointer) {
    return "eco";
  }

  if (memory >= 8 && cores >= 8) {
    return "ultra";
  }

  return "standard";
}

export function lowerQualityTier(tier: QualityTier): QualityTier {
  if (tier === "ultra") return "standard";
  return "eco";
}

export function raiseQualityTier(tier: QualityTier): QualityTier {
  if (tier === "eco") return "standard";
  return "ultra";
}
