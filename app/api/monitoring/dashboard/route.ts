import { NextResponse } from "next/server";
import { getDashboardMonitoring } from "@/lib/monitoring/patient-data";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const data = await getDashboardMonitoring();
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    console.error("Dashboard monitoring CSV update failed", error);
    return NextResponse.json({ error: "Monitoring data is temporarily unavailable." }, { status: 502 });
  }
}
