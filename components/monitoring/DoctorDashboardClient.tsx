"use client";

import Link from "next/link";
import type { DashboardPatientSummary } from "@/lib/monitoring/types";
import { formatDateTime, formatValue } from "./format";
import { useDashboardMonitoring } from "./useDashboardMonitoring";
import { EnvironmentSummary } from "./RoomEnvironmentStation";
import styles from "./DoctorDashboard.module.css";

function PatientCard({ patient }: { patient: DashboardPatientSummary }) {
  const current = patient.current;
  const record = patient.medicalRecord;
  const name = [record?.first_name, record?.last_name].filter(Boolean).join(" ") || patient.patientId;
  const pulse = patient.recentMeasurements.map((item) => item.heart_rate).filter((value): value is number => value !== null);
  const points = pulse.map((value, index) => `${(index / Math.max(1, pulse.length - 1)) * 240},${48 - ((value - Math.min(...pulse)) / (Math.max(...pulse) - Math.min(...pulse) || 1)) * 42}`).join(" ");
  return (
    <Link
      className={styles.patientCard}
      data-risk={current?.risk_level ?? "LOW"}
      href={`/patient/${patient.patientId}`}
      prefetch
    >
      <header className={styles.cardHeader}>
        <div><p className={styles.patientId}>{name}</p><p className={styles.room}>{patient.patientId} · {current?.room_id ?? "ROOM —"}</p></div>
        <span className={styles.freshness} data-freshness={patient.freshness}>{patient.freshness}</span>
      </header>
      <div className={styles.badges}>
        <span data-risk={current?.risk_level ?? "LOW"}>{current?.risk_level ?? "—"}</span>
        <span>{current?.priority ?? "—"}</span>
        <span>{current?.overall_trend ?? "UNKNOWN"}</span>
      </div>
      <div className={styles.condition}>{record?.primary_condition ?? "Clinical context unavailable"}</div>
      <EnvironmentSummary current={patient.environmentCurrent}/>
      {points && <svg className={styles.sparkline} viewBox="0 0 240 52" role="img" aria-label="Tendance récente de fréquence cardiaque"><polyline points={points} /></svg>}
      <dl className={styles.vitals}>
        <div><dt>HR</dt><dd>{formatValue(current?.heart_rate ?? null)} <small>bpm</small></dd></div>
        <div><dt>SpO₂</dt><dd>{formatValue(current?.spo2 ?? null)} <small>%</small></dd></div>
        <div><dt>Temp.</dt><dd>{formatValue(current?.body_temperature ?? null, 1)} <small>°C</small></dd></div>
        <div><dt>RR</dt><dd>{formatValue(current?.respiratory_rate ?? null)} <small>/min</small></dd></div>
        <div><dt>BP</dt><dd>{formatValue(current?.systolic_bp ?? null)}/{formatValue(current?.diastolic_bp ?? null)} <small>mmHg</small></dd></div>
        <div><dt>Qualité</dt><dd>{formatValue(current?.completeness_percent ?? null)} <small>%</small></dd></div>
      </dl>
      <div className={styles.cardFooter}>
        <span className={patient.hasActiveAlert ? styles.alertActive : styles.alertClear}>
          {patient.hasActiveAlert ? `Alerte active${patient.activeAlert?.severity ? ` · ${patient.activeAlert.severity}` : ""}` : "Aucune alerte active"}
        </span>
        <span>{current?.data_quality ?? "Qualité inconnue"}</span>
        <time dateTime={current?.measured_at}>Mesure {formatDateTime(current?.measured_at ?? null)}</time>
      </div>
    </Link>
  );
}

export function DoctorDashboardClient() {
  const { data, initialError, updateError, updating } = useDashboardMonitoring();

  if (!data && !initialError) return <div className={styles.loading}>Chargement du monitoring global…</div>;
  if (!data) return <div className={styles.error} role="alert">{initialError}</div>;

  const kpis = [
    ["Patients monitored", String(data.kpis.patientsMonitored)],
    ["Critical / high alerts", String(data.kpis.criticalHighAlerts)],
    ["Offline patients", String(data.kpis.offlinePatients)],
    ["Average data quality", data.kpis.averageDataQuality === null ? "—" : `${data.kpis.averageDataQuality.toFixed(0)}%`],
  ];
  const attention = data.patients.filter((patient) => patient.current?.risk_level !== "LOW" || patient.hasActiveAlert || patient.freshness !== "LIVE");
  return (
    <section className={styles.dashboard} aria-label="Dashboard médecin live">
      <div className={styles.demoRail}><b>DEMO LIVE SIMULÉE</b><span>Les constantes sont légèrement extrapolées depuis la dernière mesure CSV. Les risques, priorités et alertes restent inchangés.</span></div>
      <div className={styles.syncLine} aria-live="polite">
        <span>Synchronisé à {new Date(data.updatedAt).toLocaleTimeString("fr-FR")}</span>
        {updating && <span>Mise à jour…</span>}
        {updateError && <span className={styles.updateError}>Mise à jour temporairement indisponible</span>}
      </div>
      <div className={styles.kpis}>{kpis.map(([label, value]) => <article key={label}><p>{label}</p><strong>{value}</strong></article>)}</div>
      <div className={styles.attention}><div><p>ATTENTION QUEUE</p><strong>{attention.length} requiring review</strong></div>{attention.map((patient,index) => <Link href={`/patient/${patient.patientId}`} key={patient.patientId}><span>0{index + 1}</span><strong>{[patient.medicalRecord?.first_name, patient.medicalRecord?.last_name].filter(Boolean).join(" ") || patient.patientId}</strong><em>{patient.current?.risk_level} · {patient.current?.priority}</em><b>OPEN PATIENT →</b></Link>)}</div>
      <div className={styles.sectionHeading}><div><p>TRIAGE LIVE</p><h2>Patients prioritaires</h2></div><span>Urgence puis fraîcheur</span></div>
      <div className={styles.patientGrid}>{data.patients.map((patient) => <PatientCard key={patient.patientId} patient={patient} />)}</div>
    </section>
  );
}
