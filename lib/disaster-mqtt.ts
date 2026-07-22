export const DISASTER_MQTT_CONFIG = {
  brokerUrl: "wss://broker.hivemq.com:8884/mqtt",
  host: "broker.hivemq.com",
  port: 8884,
  path: "/mqtt",
  topicRoot: "kknarunika26",
  topics: {
    all: "kknarunika26/#",
    wind: "kknarunika26/sensor/angin",
    temperature: "kknarunika26/sensor/suhu",
    humidity: "kknarunika26/sensor/kelembapan",
    status: "kknarunika26/sensor/status",
    rootStatus: "kknarunika26/status",
  },
} as const;

export const DISASTER_SENSOR_TOPICS = [
  DISASTER_MQTT_CONFIG.topics.wind,
  DISASTER_MQTT_CONFIG.topics.temperature,
  DISASTER_MQTT_CONFIG.topics.humidity,
] as const;

export const DISASTER_STATUS_TOPICS = [
  DISASTER_MQTT_CONFIG.topics.status,
  DISASTER_MQTT_CONFIG.topics.rootStatus,
] as const;

export type DisasterStatus = "normal" | "siaga" | "darurat" | "unknown";

export function getDisasterMqttUrl() {
  return DISASTER_MQTT_CONFIG.brokerUrl;
}

export function normalizeDisasterStatus(value: string): DisasterStatus {
  const normalized = value.trim().toLowerCase();

  if (normalized === "normal" || normalized === "siaga" || normalized === "darurat") {
    return normalized;
  }

  return "unknown";
}