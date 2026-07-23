"use client";

import { useEffect, useMemo, useState } from "react";
import mqtt, { type MqttClient } from "mqtt";
import {
  DISASTER_MQTT_CONFIG,
  DISASTER_SENSOR_TOPICS,
  DISASTER_STATUS_TOPICS,
  getDisasterMqttUrl,
  normalizeDisasterStatus,
  type DisasterStatus,
} from "@/lib/disaster-mqtt";

type SensorKey = "wind" | "temperature" | "humidity";
type ConnectionState = "menghubungkan" | "sukses" | "error";

type SensorPoint = {
  time: string;
  value: number;
};

const sensorConfigs: Record<
  SensorKey,
  {
    label: string;
    unit: string;
    topic: string;
    color: string;
    bgClassName: string;
  }
> = {
  wind: {
    label: "Angin",
    unit: "km/h",
    topic: DISASTER_MQTT_CONFIG.topics.wind,
    color: "#2563eb",
    bgClassName: "bg-blue-50 text-blue-800",
  },
  temperature: {
    label: "Suhu",
    unit: "C",
    topic: DISASTER_MQTT_CONFIG.topics.temperature,
    color: "#dc2626",
    bgClassName: "bg-red-50 text-red-800",
  },
  humidity: {
    label: "Kelembapan",
    unit: "%",
    topic: DISASTER_MQTT_CONFIG.topics.humidity,
    color: "#059669",
    bgClassName: "bg-emerald-50 text-emerald-800",
  },
};

const statusStyles: Record<DisasterStatus, string> = {
  normal: "border-emerald-200 bg-emerald-50 text-emerald-800",
  siaga: "border-amber-200 bg-amber-50 text-amber-800",
  darurat: "border-red-200 bg-red-50 text-red-800",
  unknown: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

const statusLabels: Record<DisasterStatus, string> = {
  normal: "Normal",
  siaga: "Siaga",
  darurat: "Darurat",
  unknown: "Normal",
};

export function DisasterDashboardPage() {
  const [connectionState, setConnectionState] = useState<ConnectionState>("menghubungkan");
  const [status, setStatus] = useState<DisasterStatus>("unknown");
  const [lastUpdate, setLastUpdate] = useState<string>("-");
  const [lastTopic, setLastTopic] = useState<string>("-");
  const [series, setSeries] = useState<Record<SensorKey, SensorPoint[]>>({
    wind: [],
    temperature: [],
    humidity: [],
  });

  useEffect(() => {
    const mqttClient: MqttClient = mqtt.connect(getDisasterMqttUrl(), {
      clientId: `desa_keseneng_dashboard_${Math.random().toString(16).slice(2, 10)}`,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    });

    mqttClient.on("connect", () => {
      setConnectionState("sukses");
      mqttClient.subscribe([...DISASTER_SENSOR_TOPICS, ...DISASTER_STATUS_TOPICS], { qos: 0, rh: 0 }, (error) => {
        if (error) {
          setConnectionState("error");
        }
      });
    });

    mqttClient.on("message", (topic, payload) => {
      const formattedTime = formatStoredTime(new Date().toISOString());
      const message = payload.toString().trim();

      setLastTopic(topic);
      setLastUpdate(formattedTime);

      if (DISASTER_STATUS_TOPICS.includes(topic as (typeof DISASTER_STATUS_TOPICS)[number])) {
        setStatus(normalizeDisasterStatus(message));
        return;
      }

      const sensorKey = getSensorKey(topic);

      if (!sensorKey) {
        return;
      }

      const numericValue = Number.parseFloat(message.replace(",", "."));

      if (!Number.isFinite(numericValue)) {
        return;
      }

      setSeries((currentSeries) => ({
        ...currentSeries,
        [sensorKey]: [...currentSeries[sensorKey], { time: formattedTime, value: numericValue }].slice(-40),
      }));
    });

    mqttClient.on("close", () => setConnectionState("error"));
    mqttClient.on("error", () => setConnectionState("error"));

    return () => {
      mqttClient.end();
    };
  }, []);

  const sensorCards = useMemo(
    () =>
      (Object.keys(sensorConfigs) as SensorKey[]).map((key) => {
        const points = series[key];
        const latest = points.at(-1)?.value;

        return {
          key,
          latest,
          points,
          ...sensorConfigs[key],
        };
      }),
    [series],
  );

  return (
    <main className="bg-stone-50 text-slate-950">
      <section className="relative isolate overflow-hidden bg-slate-950 px-4 pb-14 pt-28 text-white sm:px-6 sm:pb-16 sm:pt-32 lg:px-8 lg:pb-20">
        <div className="absolute inset-0 -z-20 bg-[url('/hero-section.webp')] bg-cover bg-center" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgba(15,23,42,0.96),rgba(15,23,42,0.8)_50%,rgba(63,111,74,0.42))]" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sage-100 backdrop-blur-md">
              Dashboard Siaga Bencana
            </p>
            <h1 className="mt-8 text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Pantauan sensor lingkungan Desa Keseneng secara real-time.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-100 sm:text-lg">
              Data angin, suhu, kelembapan, dan status peringatan dibaca langsung dari MQTT
              untuk membantu pemantauan kondisi lapangan.
            </p>
          </div>
          <div className={`rounded-lg border p-5 shadow-sm ${statusStyles[status]}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">Status terkini</p>
            <strong className="mt-3 block text-4xl font-semibold">{statusLabels[status]}</strong>
            <p className="mt-4 text-sm font-medium">Koneksi: {formatConnectionState(connectionState)}</p>
            <p className="mt-1 text-sm font-medium">Update terakhir: {lastUpdate}</p>
            <p className="mt-1 break-all text-sm font-medium">Data terakhir: {lastTopic}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-4 md:grid-cols-3">
          {sensorCards.map((sensor) => (
            <article key={sensor.key} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {sensor.label}
                  </p>
                  <div className="mt-3 flex items-end gap-2">
                    <strong className="text-4xl font-semibold text-slate-950">
                      {sensor.latest === undefined ? "-" : formatValue(sensor.latest)}
                    </strong>
                    <span className="pb-1 text-sm font-semibold text-slate-500">{sensor.unit}</span>
                  </div>
                </div>
                <span className={`rounded-md px-3 py-1 text-xs font-semibold ${sensor.bgClassName}`}>
                  Live
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {sensorCards.map((sensor) => (
            <RealtimeChart
              key={sensor.key}
              title={sensor.label}
              unit={sensor.unit}
              color={sensor.color}
              points={sensor.points}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function RealtimeChart({
  title,
  unit,
  color,
  points,
}: {
  title: string;
  unit: string;
  color: string;
  points: SensorPoint[];
}) {
  const width = 640;
  const height = 260;
  const padding = 34;
  const values = points.map((point) => point.value);
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 1;
  const range = Math.max(maxValue - minValue, 1);
  const linePath = points
    .map((point, index) => {
      const x =
        points.length === 1
          ? padding
          : padding + (index / (points.length - 1)) * (width - padding * 2);
      const y = height - padding - ((point.value - minValue) / range) * (height - padding * 2);

      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Grafik real-time
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
        </div>
        <span className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white">
          {unit}
        </span>
      </div>

      <div className="mt-5 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full" role="img" aria-label={`Grafik ${title}`}>
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="2" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="2" />
          <text x={padding} y={24} fill="#64748b" fontSize="18" fontWeight="600">
            {formatValue(maxValue)}
          </text>
          <text x={padding} y={height - 10} fill="#64748b" fontSize="18" fontWeight="600">
            {formatValue(minValue)}
          </text>
          {points.length > 0 ? (
            <>
              <path d={linePath} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
              {points.map((point, index) => {
                const x =
                  points.length === 1
                    ? padding
                    : padding + (index / (points.length - 1)) * (width - padding * 2);
                const y =
                  height - padding - ((point.value - minValue) / range) * (height - padding * 2);

                return <circle key={`${point.time}-${index}`} cx={x} cy={y} r="4" fill={color} />;
              })}
            </>
          ) : (
            <text x="50%" y="50%" fill="#64748b" fontSize="20" fontWeight="600" textAnchor="middle">
              Menunggu data sensor
            </text>
          )}
        </svg>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <span>40 data terakhir</span>
        <span>{points.at(-1)?.time ?? "-"}</span>
      </div>
    </article>
  );
}

function getSensorKey(topic: string): SensorKey | null {
  if (topic === DISASTER_MQTT_CONFIG.topics.wind) return "wind";
  if (topic === DISASTER_MQTT_CONFIG.topics.temperature) return "temperature";
  if (topic === DISASTER_MQTT_CONFIG.topics.humidity) return "humidity";
  return null;
}

function formatStoredTime(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}
function formatConnectionState(state: ConnectionState) {
  if (state === "sukses") {
    return "Sukses";
  }

  if (state === "error") {
    return "Error";
  }

  return "Menghubungkan";
}


function formatValue(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 1,
  }).format(value);
}
