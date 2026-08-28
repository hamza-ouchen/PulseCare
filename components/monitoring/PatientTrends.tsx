import type { PatientMeasurement } from "@/lib/monitoring/types";
import { formatValue } from "./format";
import styles from "./Monitoring.module.css";
export function PatientTrends({ current }: { current: PatientMeasurement }) { return <article className={styles.panel}><p className={styles.eyebrow}>TENDANCES</p><h2>Moyennes sur 10 minutes</h2><dl className={styles.details}><div><dt>Fréquence cardiaque</dt><dd>{formatValue(current.avg_10min_heart_rate, 1)} bpm</dd></div><div><dt>SpO₂</dt><dd>{formatValue(current.avg_10min_spo2, 1)} %</dd></div><div><dt>Fréquence respiratoire</dt><dd>{formatValue(current.avg_10min_respiratory_rate, 1)} /min</dd></div><div><dt>Tendance globale</dt><dd>{current.overall_trend}</dd></div></dl></article>; }
