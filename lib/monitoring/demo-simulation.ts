import type { DashboardMonitoringResponse, PatientMeasurement, PatientMonitoringResponse } from "./types";

function jitter(value: number | null, amount: number, seed: number): number | null {
  if (value === null) return null;
  return Math.round((value + (seed - 0.5) * amount * 2) * 10) / 10;
}

export function simulateMeasurement(source: PatientMeasurement, seed: number, measuredAt = new Date().toISOString()): PatientMeasurement {
  return {
    ...source,
    measurement_id: `${source.measurement_id}-demo-${Math.round(seed * 100000)}`,
    measured_at: measuredAt,
    received_at: measuredAt,
    heart_rate: jitter(source.heart_rate, 3, seed),
    spo2: jitter(source.spo2, 0.8, (seed * 1.7) % 1),
    body_temperature: jitter(source.body_temperature, 0.15, (seed * 2.3) % 1),
    respiratory_rate: jitter(source.respiratory_rate, 1.2, (seed * 3.1) % 1),
    systolic_bp: jitter(source.systolic_bp, 3, (seed * 4.1) % 1),
    diastolic_bp: jitter(source.diastolic_bp, 2, (seed * 5.3) % 1),
  };
}

export function simulateDashboard(source: DashboardMonitoringResponse, seed: number): DashboardMonitoringResponse {
  return {
    ...source,
    updatedAt: new Date().toISOString(),
    patients: source.patients.map((patient, index) => {
      if (!patient.current) return patient;
      const current = simulateMeasurement(patient.current, (seed + index * 0.217) % 1);
      return { ...patient, current, freshness: "LIVE", recentMeasurements: [...patient.recentMeasurements.slice(-23), current] };
    }),
  };
}

export function simulatePatient(source: PatientMonitoringResponse, seed: number): PatientMonitoringResponse {
  if (!source.current) return source;
  const current = simulateMeasurement(source.current, seed);
  return {
    ...source,
    current,
    measurements: [...source.measurements.slice(-59), current],
    meta: { ...source.meta, updatedAt: new Date().toISOString(), freshness: "FRESH" },
  };
}
