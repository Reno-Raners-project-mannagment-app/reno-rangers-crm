import { NextResponse } from "next/server";
import { computeAlerts } from "@/lib/alerts";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ alerts: [] }, { status: 401 });
  const alerts = await computeAlerts();
  return NextResponse.json({ alerts });
}
