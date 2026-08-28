import type { CSSProperties } from "react";

import type { PatientMeasurement } from "@/lib/monitoring/types";
import { formatValue } from "./format";
import styles from "./Monitoring.module.css";

const signals = [
  { label: "LIVE PULSE", field: "heart_rate", unit: "bpm", path: "M0 42 L42 42 L52 37 L60 46 L70 8 L79 68 L91 42 L132 42 L142 36 L150 46 L160 9 L169 68 L181 42 L240 42" },
  { label: "OXYGENATION TREND", field: "spo2", unit: "%", path: "M0 40 C25 27 45 53 70 40 S115 27 140 40 S185 53 210 40 S225 34 240 40" },
  { label: "RESPIRATORY RHYTHM", field: "respiratory_rate", unit: "/min", path: "M0 48 C20 48 24 18 48 18 S76 48 96 48 S120 18 144 18 S172 48 192 48 S216 18 240 48" },
] as const;

type WaveStyle = CSSProperties & { "--wave-duration": string };

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function getWaveDuration(field: (typeof signals)[number]["field"], current: PatientMeasurement) {
  if (field === "heart_rate") return clamp((60 / (current.heart_rate ?? 72)) * 2, 1.15, 3.5);
  if (field === "respiratory_rate") return clamp((60 / (current.respiratory_rate ?? 16)) * 2, 4, 10);
  return 6;
}

export function LiveSignalStrips({ current }: { current: PatientMeasurement }) {
  return (
    <section className={styles.signalStation} aria-label="Feedback visuel du monitoring">
      <header><p className={styles.eyebrow}>LIVE SIGNAL STATION</p><span>Visual feedback only · no raw ECG/PPG signal</span></header>
      <div>{signals.map((signal) => {
        const style: WaveStyle = { "--wave-duration": `${getWaveDuration(signal.field, current)}s` };
        return <article key={signal.label}>
          <div><strong>{signal.label}</strong><span>{formatValue(current[signal.field])} {signal.unit}</span></div>
          <svg viewBox="0 0 240 78" preserveAspectRatio="none" role="img" aria-label={`${signal.label}, visualisation synthétique`}>
            <line className={styles.signalBaseline} x1="0" y1="74" x2="240" y2="74" />
            <g className={styles.waveTrack} style={style}><path d={signal.path} /><path d={signal.path} transform="translate(240 0)" aria-hidden="true" /></g>
            <line className={styles.sweepLine} x1="0" y1="4" x2="0" y2="74" />
          </svg>
        </article>;
      })}</div>
    </section>
  );
}
