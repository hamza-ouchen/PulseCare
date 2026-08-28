import type { PatientMeasurement } from "@/lib/monitoring/types";
import { formatValue } from "./format";
import styles from "./Monitoring.module.css";

export function VitalSignsGrid({ current }: { current: PatientMeasurement | null }) {
  const vitals = [
    ["Fréquence cardiaque", formatValue(current?.heart_rate ?? null), "bpm", current?.trend_heart_rate],
    ["SpO₂", formatValue(current?.spo2 ?? null), "%", current?.trend_spo2],
    ["Température", formatValue(current?.body_temperature ?? null, 1), "°C", current?.trend_body_temperature],
    ["Fréquence respiratoire", formatValue(current?.respiratory_rate ?? null), "/min", current?.trend_respiratory_rate],
    ["Pression artérielle", current?.systolic_bp !== null && current?.systolic_bp !== undefined && current?.diastolic_bp !== null && current?.diastolic_bp !== undefined ? `${formatValue(current.systolic_bp)}/${formatValue(current.diastolic_bp)}` : "—", "mmHg", `${current?.trend_systolic_bp ?? "UNKNOWN"} / ${current?.trend_diastolic_bp ?? "UNKNOWN"}`],
  ];
  return <section className={styles.vitals} aria-label="Constantes vitales">{vitals.map(([label, value, unit, trend]) => <article className={styles.vital} key={label}><p className={styles.label}>{label}</p><p className={styles.number}>{value}</p><span className={styles.unit}>{unit}</span><span className={styles.trend}>{trend ?? "UNKNOWN"}</span></article>)}</section>;
}
