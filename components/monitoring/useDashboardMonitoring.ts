"use client";

import { useEffect, useRef, useState } from "react";
import type { DashboardMonitoringResponse } from "@/lib/monitoring/types";
import { simulateDashboard } from "@/lib/monitoring/demo-simulation";
import { useAppStore } from "@/lib/store";

const POLLING_INTERVAL_MS = 5000;

export function useDashboardMonitoring() {
  const [data, setData] = useState<DashboardMonitoringResponse | null>(null);
  const [initialError, setInitialError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState(false);
  const [updating, setUpdating] = useState(false);
  const dataRef = useRef<DashboardMonitoringResponse | null>(null);
  const simulationSeed = useRef(Math.random());

  useEffect(() => {
    let cancelled = false;
    let controller: AbortController | null = null;
    let timer: number | null = null;
    async function load() {
      controller = new AbortController();
      if (dataRef.current) setUpdating(true);
      try {
        const response = await fetch("/api/monitoring/dashboard", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error(`Dashboard API returned ${response.status}`);
        const sourceData: DashboardMonitoringResponse = await response.json();
        simulationSeed.current = (simulationSeed.current + 0.137) % 1;
        const nextData = simulateDashboard(sourceData, simulationSeed.current);
        if (!cancelled) {
          dataRef.current = nextData;
          setData(nextData);
          setInitialError(null);
          setUpdateError(false);
          useAppStore.getState().setTelemetry(nextData.patients.flatMap((patient) => patient.current ? [{ patientId: patient.patientId, risk: patient.current.risk_level, freshness: patient.freshness, heartRate: patient.current.heart_rate ?? 0, spo2: patient.current.spo2 ?? 0, respiratoryRate: patient.current.respiratory_rate ?? 0 }] : []));
        }
      } catch (error) {
        if (!cancelled && !(error instanceof DOMException && error.name === "AbortError")) {
          if (!dataRef.current) setInitialError("Le monitoring live est temporairement indisponible.");
          else setUpdateError(true);
        }
      } finally {
        if (!cancelled) {
          setUpdating(false);
          timer = window.setTimeout(() => void load(), POLLING_INTERVAL_MS);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
      controller?.abort();
      if (timer !== null) window.clearTimeout(timer);
    };
  }, []);

  return { data, initialError, updateError, updating };
}
