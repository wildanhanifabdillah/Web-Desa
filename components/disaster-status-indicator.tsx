"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import mqtt, { type MqttClient } from "mqtt";
import {
  DISASTER_STATUS_TOPICS,
  getDisasterMqttUrl,
  normalizeDisasterStatus,
  type DisasterStatus,
} from "@/lib/disaster-mqtt";

type ConnectionState = "menghubungkan" | "terhubung" | "terputus";

const statusStyles: Record<DisasterStatus, string> = {
  normal: "bg-emerald-600 text-white",
  siaga: "bg-amber-400 text-slate-950",
  darurat: "bg-red-600 text-white",
  unknown: "bg-emerald-600 text-white",
};

const statusLabels: Record<DisasterStatus, string> = {
  normal: "Normal",
  siaga: "Siaga",
  darurat: "Darurat",
  unknown: "Normal",
};

export function DisasterStatusIndicator() {
  const [status, setStatus] = useState<DisasterStatus>("unknown");
  const [connectionState, setConnectionState] = useState<ConnectionState>("menghubungkan");

  useEffect(() => {
    const mqttClient: MqttClient = mqtt.connect(getDisasterMqttUrl(), {
      clientId: `desa_keseneng_status_${Math.random().toString(16).slice(2, 10)}`,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    });

    mqttClient.on("connect", () => {
      setConnectionState("terhubung");
      mqttClient.subscribe([...DISASTER_STATUS_TOPICS], { qos: 0, rh: 0 }, (error) => {
        if (error) {
          setConnectionState("terputus");
        }
      });
    });

    mqttClient.on("message", (topic, payload) => {
      if (DISASTER_STATUS_TOPICS.includes(topic as (typeof DISASTER_STATUS_TOPICS)[number])) {
        setStatus(normalizeDisasterStatus(payload.toString()));
      }
    });

    mqttClient.on("close", () => setConnectionState("terputus"));
    mqttClient.on("error", () => setConnectionState("terputus"));

    return () => {
      mqttClient.end();
    };
  }, []);

  const label = useMemo(() => statusLabels[status], [status]);

  return (
    <Link
      href="/siaga-bencana"
      className={`hidden h-10 items-center rounded-md px-3 text-xs font-semibold uppercase tracking-[0.12em] shadow-sm transition-colors lg:flex ${statusStyles[status]}`}
      title={`Status bencana: ${statusLabels[status]} (${connectionState})`}
    >
      {label}
    </Link>
  );
}
