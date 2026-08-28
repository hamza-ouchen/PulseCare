import type { PatientMeasurement } from "@/lib/monitoring/types";
import styles from "./Monitoring.module.css";

export function BloodPressureChart({ measurements }: { measurements: PatientMeasurement[] }) {
  const valid = measurements.filter((m) => m.systolic_bp !== null && Number.isFinite(m.systolic_bp) && m.diastolic_bp !== null && Number.isFinite(m.diastolic_bp));
  const systolic = valid.map((m) => m.systolic_bp as number); const diastolic = valid.map((m) => m.diastolic_bp as number); const combined = [...systolic, ...diastolic];
  const scale = (values: number[]) => { const min = Math.min(...combined); const max = Math.max(...combined); const range = max - min || 1; return values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * 600},${180 - ((v - min) / range) * 180}`).join(" "); };
  return <article className={styles.panel}><p className={styles.eyebrow}>LIVE / mmHg</p><h2>Pression artérielle</h2>{valid.length < 2 ? <div className={styles.chartEmpty}>Données insuffisantes</div> : <><svg className={styles.chart} viewBox="0 0 600 180" role="img" aria-label="Évolution pression systolique et diastolique"><polyline className={styles.chartLine} points={scale(systolic)}/><polyline className={styles.chartSecondary} points={scale(diastolic)}/></svg><div className={styles.legend}><span>Systolique</span><span>Diastolique</span></div></>}</article>;
}
