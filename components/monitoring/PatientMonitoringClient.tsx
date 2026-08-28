"use client";
import { useEffect, useRef, useState } from "react";
import type { PatientId, PatientMonitoringResponse } from "@/lib/monitoring/types";
import { simulatePatient } from "@/lib/monitoring/demo-simulation";
import { useAppStore } from "@/lib/store";
import { AiMonitoringSummary } from "./AiMonitoringSummary";
import { BloodPressureChart } from "./BloodPressureChart";
import { BaselineComparison } from "./BaselineComparison";
import { ClinicalTimeline } from "./ClinicalTimeline";
import { DataQuality } from "./DataQuality";
import { DeviceStatus } from "./DeviceStatus";
import { PatientAlerts } from "./PatientAlerts";
import { PatientHeader } from "./PatientHeader";
import { PatientMedicalRecord } from "./PatientMedicalRecord";
import { PatientSymptoms } from "./PatientSymptoms";
import { PatientTrends } from "./PatientTrends";
import { LiveSignalStrips } from "./LiveSignalStrips";
import { RoomEnvironmentStation } from "./RoomEnvironmentStation";
import { VitalChart } from "./VitalChart";
import { VitalSignsGrid } from "./VitalSignsGrid";
import styles from "./Monitoring.module.css";

const POLLING_INTERVAL_MS = 5000;
export function PatientMonitoringClient({ patientId }: { patientId: PatientId }) {
  const [data, setData] = useState<PatientMonitoringResponse | null>(null);
  const [initialError, setInitialError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState(false);
  const [updating, setUpdating] = useState(false);
  const dataRef = useRef<PatientMonitoringResponse | null>(null);
  const simulationSeed = useRef(Math.random());
  useEffect(() => {
    let cancelled = false;
    let controller: AbortController | null = null;
    let timer: number | null = null;
    async function load() {
      controller = new AbortController();
      if (!cancelled && dataRef.current !== null) setUpdating(true);
      try {
        const response = await fetch(`/api/monitoring/patient/${patientId}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error(`Monitoring API returned ${response.status}`);
        const sourceData: PatientMonitoringResponse = await response.json();
        simulationSeed.current = (simulationSeed.current + 0.137) % 1;
        const nextData = simulatePatient(sourceData, simulationSeed.current);
        if (!cancelled) { dataRef.current = nextData; setData(nextData); setInitialError(null); setUpdateError(false); if (nextData.current) useAppStore.getState().setTelemetry([{ patientId, risk: nextData.current.risk_level, freshness: "LIVE", heartRate: nextData.current.heart_rate ?? 0, spo2: nextData.current.spo2 ?? 0, respiratoryRate: nextData.current.respiratory_rate ?? 0 }]); }
      } catch (error) {
        if (!cancelled && !(error instanceof DOMException && error.name === "AbortError")) {
          if (dataRef.current === null) setInitialError("Les données de monitoring sont temporairement indisponibles.");
          else setUpdateError(true);
        }
      } finally { if (!cancelled) { setUpdating(false); timer = window.setTimeout(() => void load(), POLLING_INTERVAL_MS); } }
    }
    void load();
    return () => { cancelled = true; controller?.abort(); if (timer !== null) window.clearTimeout(timer); };
  }, [patientId]);
  if (!data && !initialError) return <div className={styles.loading}>Chargement du monitoring live…</div>;
  if (!data) return <div className={styles.fatalError} role="alert">{initialError}</div>;
  const current = data.current;
  return <div className={styles.dashboard}>
    <div className={styles.statusLine}><span>DEMO LIVE SIMULÉE · extrapolation légère des dernières valeurs CSV · risque inchangé</span><span>Synchronisation : {new Date(data.meta.updatedAt).toLocaleTimeString("fr-FR")}</span>{updating && <span className={styles.updating}>Mise à jour…</span>}{updateError && <span className={styles.networkError}>Mise à jour temporairement indisponible</span>}</div>
    <PatientHeader data={data}/><VitalSignsGrid current={current}/>{current && <LiveSignalStrips current={current} />}
    <RoomEnvironmentStation environment={data.environment}/>
    <div className={styles.gridTwo}><VitalChart title="Fréquence cardiaque" unit="bpm" field="heart_rate" measurements={data.measurements}/><VitalChart title="SpO₂" unit="%" field="spo2" measurements={data.measurements}/><VitalChart title="Température corporelle" unit="°C" field="body_temperature" measurements={data.measurements}/><VitalChart title="Fréquence respiratoire" unit="/min" field="respiratory_rate" measurements={data.measurements}/><BloodPressureChart measurements={data.measurements}/></div>
    {current ? <><BaselineComparison current={current} record={data.medicalRecord}/><div className={styles.gridTwo}><ClinicalTimeline measurements={data.measurements}/><PatientSymptoms current={current}/></div><div className={styles.gridTwo}><PatientTrends current={current}/><AiMonitoringSummary current={current}/></div><PatientAlerts alerts={data.alerts}/><h2 className={styles.sectionTitle}>Clinical context & system health</h2><div className={styles.gridThree}><DeviceStatus current={current}/><DataQuality current={current}/><PatientMedicalRecord record={data.medicalRecord}/></div></> : <div className={styles.empty}>Aucune mesure disponible pour ce patient.</div>}
  </div>;
}
