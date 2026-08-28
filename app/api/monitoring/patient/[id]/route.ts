import { NextResponse, type NextRequest } from "next/server";
import { getPatientMonitoring, isPatientId } from "@/lib/monitoring/patient-data";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  if (!isPatientId(id)) return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const data = await getPatientMonitoring(id);
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    console.error("Monitoring CSV update failed", error);
    return NextResponse.json({ error: "Monitoring data is temporarily unavailable." }, { status: 502 });
  }
}
