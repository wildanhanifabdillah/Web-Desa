import { loadJsonFile } from "@/lib/json-file-store";
import type { DisasterStatus } from "@/lib/disaster-mqtt";

export type DisasterSensorKey = "wind" | "temperature" | "humidity";

export type DisasterSensorHistoryPoint = {
  time: string;
  value: number;
};

export type DisasterSensorReading = {
  value: number | null;
  updatedAt: string | null;
  history: DisasterSensorHistoryPoint[];
};

export type DisasterSensorSnapshot = {
  status: DisasterStatus;
  connection: "online" | "offline" | "error";
  lastTopic: string;
  lastUpdate: string | null;
  sensors: Record<DisasterSensorKey, DisasterSensorReading>;
};

const fallbackSnapshot: DisasterSensorSnapshot = {
  status: "unknown",
  connection: "offline",
  lastTopic: "-",
  lastUpdate: null,
  sensors: {
    wind: { value: null, updatedAt: null, history: [] },
    temperature: { value: null, updatedAt: null, history: [] },
    humidity: { value: null, updatedAt: null, history: [] },
  },
};

export function getDisasterSensorSnapshot() {
  return loadJsonFile<DisasterSensorSnapshot>("disaster-sensors.json", fallbackSnapshot);
}