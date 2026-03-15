import { NextResponse } from "next/server";
import { SERVICE_GROUPS } from "@/lib/services";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ group: string; service: string }> }
) {
  const { group: groupIdx, service: serviceIdx } = await params;
  const gi = parseInt(groupIdx, 10);
  const si = parseInt(serviceIdx, 10);

  const group = SERVICE_GROUPS[gi];
  if (!group) {
    return NextResponse.json({ error: "Invalid group" }, { status: 404 });
  }
  const service = group.services[si];
  if (!service) {
    return NextResponse.json({ error: "Invalid service" }, { status: 404 });
  }

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(service.url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);
    return NextResponse.json({
      status: res.ok ? "up" : "down",
      responseTime: Date.now() - start,
    });
  } catch {
    return NextResponse.json({
      status: "down",
      responseTime: Date.now() - start,
    });
  }
}
