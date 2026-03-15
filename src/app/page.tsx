"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  SERVICE_GROUPS,
  type Service,
  type ServiceGroup,
} from "@/lib/services";

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
      className="animate-spin h-3 w-3 text-muted"
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

function StatusDot({ status }: { status: Service["status"] }) {
  if (status === "checking") return <Spinner />;

  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${
        status === "up" ? "bg-green-500" : "bg-red-500"
      }`}
    />
  );
}

function ServiceRow({ service }: { service: Service }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
      <a
        href={service.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-foreground hover:text-white transition-colors"
      >
        {service.name}
      </a>
      <div className="flex items-center gap-2">
        {service.responseTime !== undefined && (
          <span className="text-xs text-muted font-mono">
            {service.responseTime}ms
          </span>
        )}
        <StatusDot status={service.status} />
        <span
          className={`text-xs ${
            service.status === "checking"
              ? "text-muted"
              : service.status === "up"
                ? "text-green-500"
                : "text-red-500"
          }`}
        >
          {service.status === "checking"
            ? "Checking"
            : service.status === "up"
              ? "Operational"
              : "Down"}
        </span>
      </div>
    </div>
  );
}

function GroupSection({ group }: { group: ServiceGroup }) {
  return (
    <div className="border border-border rounded-lg">
      <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border rounded-t-lg">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">
            {group.name}
          </h2>
          {group.statusLink && (
            <a
              href={group.statusLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              &rarr;
            </a>
          )}
        </div>
      </div>
      <div className="px-4">
        {group.services.map((service) => (
          <ServiceRow key={service.url} service={service} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [groups, setGroups] = useState<ServiceGroup[]>(buildInitialGroups);
  const [lastChecked, setLastChecked] = useState<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkAllServices = useCallback(() => {
    setGroups(buildInitialGroups());

    SERVICE_GROUPS.forEach((group, gi) => {
      group.services.forEach((_, si) => {
        fetch(`/api/status/${gi}/${si}`)
          .then((res) => res.json())
          .then((data: { status: "up" | "down"; responseTime: number }) => {
            setGroups((prev) =>
              prev.map((g, gIdx) =>
                gIdx !== gi
                  ? g
                  : {
                      ...g,
                      services: g.services.map((s, sIdx) =>
                        sIdx !== si
                          ? s
                          : {
                              ...s,
                              status: data.status,
                              responseTime: data.responseTime,
                            }
                      ),
                    }
              )
            );
          })
          .catch(() => {
            setGroups((prev) =>
              prev.map((g, gIdx) =>
                gIdx !== gi
                  ? g
                  : {
                      ...g,
                      services: g.services.map((s, sIdx) =>
                        sIdx !== si ? s : { ...s, status: "down" as const }
                      ),
                    }
              )
            );
          });
      });
    });

    setLastChecked(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    checkAllServices();
    intervalRef.current = setInterval(checkAllServices, REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkAllServices]);

  const allServices = groups.flatMap((g) => g.services);
  const totalServices = allServices.length;
  const upServices = allServices.filter((s) => s.status === "up").length;
  const anyChecking = allServices.some((s) => s.status === "checking");
  const allUp = !anyChecking && upServices === totalServices;
  const allDown = !anyChecking && upServices === 0;

  let bannerBg = "bg-green-600/20";
  let bannerText = "text-green-500";
  let bannerLabel = "All Systems Operational";
  if (anyChecking) {
    bannerBg = "bg-surface";
    bannerText = "text-muted";
    bannerLabel = "Checking services...";
  } else if (allDown) {
    bannerBg = "bg-red-600/20";
    bannerText = "text-red-500";
    bannerLabel = "Major Outage";
  } else if (!allUp) {
    bannerBg = "bg-yellow-600/20";
    bannerText = "text-yellow-500";
    bannerLabel = "Partial System Outage";
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-sans">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-xl font-bold tracking-tight text-foreground mb-4">
            Service Status
          </h1>
          <div
            className={`${bannerBg} ${bannerText} rounded-lg px-5 py-3 text-sm font-medium border border-border`}
          >
            {bannerLabel}
          </div>
        </header>

        <div className="space-y-4">
          {groups.map((group) => (
            <GroupSection key={group.name} group={group} />
          ))}
        </div>

        <footer className="mt-8 pt-4 border-t border-border text-xs text-muted flex items-center justify-between">
          <span>
            {lastChecked ? `Last checked ${lastChecked}` : "Checking..."}
            {" · Auto-refreshes every 60s"}
          </span>
          <a
            href="https://www.flaticon.com/free-icons/status-update"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
            title="status update icons"
          >
            Icon by vectaicon
          </a>
        </footer>
      </div>
    </main>
  );
}
