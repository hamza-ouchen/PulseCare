import type { PatientMonitoringResponse } from "@/lib/monitoring/types";
import { formatDateTime } from "./format";
import styles from "./Monitoring.module.css";

export function PatientHeader({ data }: { data: PatientMonitoringResponse }) {
  const current = data.current;
  const record = data.medicalRecord;
  const name = [record?.first_name, record?.last_name].filter(Boolean).join(" ");
  const riskClass = current?.risk_level === "CRITICAL" ? styles.critical : current?.risk_level === "HIGH" || current?.risk_level === "MEDIUM" ? styles.warning : styles.stable;
  const freshnessClass = data.meta.freshness === "FRESH" ? styles.stable : data.meta.freshness === "STALE" ? styles.warning : styles.critical;
  return <header className={styles.header}>
    <div><div className={styles.identity}><h1>{name || data.patientId}</h1><span>{data.patientId} · {current?.room_id ?? "ROOM —"}</span></div><p className={styles.patientName}>{[record?.age && `${record.age} ans`, record?.sex, record?.blood_group, record?.primary_condition].filter(Boolean).join(" · ")}</p></div>
    <div className={styles.badges}>
      <span className={`${styles.badge} ${riskClass}`}>Risque {current?.risk_level ?? "—"}</span>
      <span className={`${styles.badge} ${styles.info}`}>Priorité {current?.priority ?? "—"}</span>
      <span className={`${styles.badge} ${styles.info}`}>Tendance {current?.overall_trend ?? "UNKNOWN"}</span>
      <span className={`${styles.badge} ${freshnessClass}`}>Signal {data.meta.freshness}</span>
    </div>
    <div className={styles.meta}><span>Dernière mesure : {formatDateTime(current?.measured_at ?? null)}</span><span>Suivi depuis : {formatDateTime(record?.care_start_date ?? null)}</span><span>Médecin : {record?.assigned_doctor ?? "—"}</span><span>{data.meta.measurementCount} mesures · {data.meta.alertCount} alertes</span></div>
  </header>;
}
