import { NextResponse } from "next/server";
import { SERVICE_GROUPS, type Service, type ServiceGroup } from "@/lib/services";

async function checkService(service: {
  name: string;
  url: string;
}): Promise<Service> {
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
    return {
      name: service.name,
      url: service.url,
      status: res.ok ? "up" : "down",
      responseTime: Date.now() - start,
    };
  } catch {
    return {
      name: service.name,
      url: service.url,
      status: "down",
      responseTime: Date.now() - start,
    };
  }
}

export async function GET() {
  const results: ServiceGroup[] = await Promise.all(
    SERVICE_GROUPS.map(async (group) => ({
      name: group.name,
      statusLink: group.statusLink,
      services: await Promise.all(group.services.map(checkService)),
    }))
  );

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    groups: results,
  });
}
