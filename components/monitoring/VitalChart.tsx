import type { PatientMeasurement } from "@/lib/monitoring/types";
import styles from "./Monitoring.module.css";

type NumericMeasurementKey = "heart_rate" | "spo2" | "body_temperature" | "respiratory_rate";
type VitalChartProps = { title: string; unit: string; field: NumericMeasurementKey; measurements: PatientMeasurement[] };

function pathFor(values: number[], width: number, height: number): string {
  const min = Math.min(...values); const max = Math.max(...values); const range = max - min || 1;
  return values.map((value, index) => `${index === 0 ? "M" : "L"}${(index / Math.max(1, values.length - 1)) * width},${height - ((value - min) / range) * height}`).join(" ");
}

export function VitalChart({ title, unit, field, measurements }: VitalChartProps) {
  const values = measurements.map((item) => item[field]).filter((value): value is number => value !== null && Number.isFinite(value));
  return <article className={styles.panel}><p className={styles.eyebrow}>LIVE / {unit}</p><h2>{title}</h2>{values.length < 2 ? <div className={styles.chartEmpty}>Données insuffisantes</div> : <svg className={styles.chart} viewBox="0 0 600 180" role="img" aria-label={`Évolution ${title}`}><line className={styles.chartGrid} x1="0" y1="45" x2="600" y2="45"/><line className={styles.chartGrid} x1="0" y1="90" x2="600" y2="90"/><line className={styles.chartGrid} x1="0" y1="135" x2="600" y2="135"/><path className={styles.chartLine} d={pathFor(values, 600, 180)}/></svg>}</article>;
}
