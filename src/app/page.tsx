"use client";

import { useEffect, useState, useCallback } from "react";
import {
  SERVICE_GROUPS,
  type Service,
  type ServiceGroup,
} from "@/lib/services";

interface StatusData {
  timestamp: string;
  groups: ServiceGroup[];
}

const REFRESH_INTERVAL = 60000;

function buildInitialGroups(): ServiceGroup[] {
  return SERVICE_GROUPS.map((g) => ({
    name: g.name,
    statusLink: g.statusLink,
    services: g.services.map((s) => ({
      ...s,
      status: "checking" as const,
    })),
  }));
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-3.5 w-3.5 text-zinc-500"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function StatusIndicator({ status }: { status: Service["status"] }) {
  if (status === "checking") return <Spinner />;

  const color = {
    up: "bg-emerald-500",
    down: "bg-red-500",
  }[status];

  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />;
}

function ServiceRow({ service }: { service: Service }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-zinc-800/50 transition-colors">
      <div className="flex items-center gap-3">
        <StatusIndicator status={service.status} />
        <a
          href={service.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-300 hover:text-white transition-colors"
        >
          {service.name}
        </a>
      </div>
      <div className="flex items-center gap-3">
        {service.responseTime !== undefined && (
          <span className="text-xs text-zinc-500 font-mono">
            {service.responseTime}ms
          </span>
        )}
        <span
          className={`text-xs font-medium ${
            service.status === "checking"
              ? "text-zinc-500"
              : service.status === "up"
                ? "text-emerald-500"
                : "text-red-400"
          }`}
        >
          {service.status === "checking"
            ? "Checking..."
            : service.status === "up"
              ? "Operational"
              : "Down"}
        </span>
      </div>
    </div>
  );
}

function GroupCard({ group }: { group: ServiceGroup }) {
  const hasServices = group.services.length > 0;
  const anyChecking = group.services.some((s) => s.status === "checking");
  const allUp = group.services.every((s) => s.status === "up");
  const allDown =
    !anyChecking && group.services.every((s) => s.status === "down");

  return (
    <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-900/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-zinc-100">
            {group.name}
          </h2>
          {group.statusLink && (
            <a
              href={group.statusLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              status &rarr;
            </a>
          )}
        </div>
        {hasServices && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              anyChecking
                ? "bg-zinc-500/10 text-zinc-400"
                : allUp
                  ? "bg-emerald-500/10 text-emerald-400"
                  : allDown
                    ? "bg-red-500/10 text-red-400"
                    : "bg-yellow-500/10 text-yellow-400"
            }`}
          >
            {anyChecking
              ? "Checking..."
              : allUp
                ? "All Operational"
                : allDown
                  ? "All Down"
                  : "Partial Outage"}
          </span>
        )}
      </div>
      {hasServices ? (
        <div className="space-y-0.5">
          {group.services.map((service) => (
            <ServiceRow key={service.url} service={service} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-zinc-500">
          No services to monitor &mdash; check{" "}
          <a
            href={group.statusLink}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-zinc-300"
          >
            external status
          </a>
        </p>
      )}
    </div>
  );
}

export default function Home() {
  const [groups, setGroups] = useState<ServiceGroup[]>(buildInitialGroups);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string>("");

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/status");
      const json: StatusData = await res.json();
      setGroups(json.groups);
      setLastChecked(new Date().toLocaleTimeString());
    } catch {
      // keep stale data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const allServices = groups.flatMap((g) => g.services);
  const totalServices = allServices.length;
  const upServices = allServices.filter((s) => s.status === "up").length;
  const anyChecking = allServices.some((s) => s.status === "checking");

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <header className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            Service Status
          </h1>
          <p className="text-sm text-zinc-500">
            {anyChecking
              ? "Checking services..."
              : `${upServices}/${totalServices} services operational`}
            {lastChecked && (
              <span className="ml-2">&middot; Last checked {lastChecked}</span>
            )}
          </p>
        </header>

        <div className="space-y-4">
          {groups.map((group) => (
            <GroupCard key={group.name} group={group} />
          ))}
        </div>

        <footer className="mt-10 text-center text-xs text-zinc-600 space-y-1">
          <p>Auto-refreshes every 60s</p>
          <p>
            <a
              href="https://www.flaticon.com/free-icons/status-update"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-400 transition-colors"
              title="status update icons"
            >
              Status update icon created by vectaicon - Flaticon
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
