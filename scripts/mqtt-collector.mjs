import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import mqtt from "mqtt";

const MQTT_BROKER_URL = "wss://broker.hivemq.com:8884/mqtt";
const TOPICS = {
  wind: "kknarunika26/sensor/angin",
  temperature: "kknarunika26/sensor/suhu",
  humidity: "kknarunika26/sensor/kelembapan",
  status: "kknarunika26/sensor/status",
  rootStatus: "kknarunika26/status",
};
const SUBSCRIBE_TOPICS = [
  TOPICS.wind,
  TOPICS.temperature,
  TOPICS.humidity,
  TOPICS.status,
  TOPICS.rootStatus,
];
const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "disaster-sensors.json");
const maxHistory = 240;

const fallbackSnapshot = {
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

let snapshot = structuredClone(fallbackSnapshot);
let saveQueue = Promise.resolve();

async function bootSnapshot() {
  try {
    const content = await readFile(dataFile, "utf8");
    snapshot = mergeSnapshot(JSON.parse(content));
  } catch {
    snapshot = structuredClone(fallbackSnapshot);
    await saveSnapshot();
  }
}

function mergeSnapshot(value) {
  return {
    ...structuredClone(fallbackSnapshot),
    ...value,
    sensors: {
      wind: { ...fallbackSnapshot.sensors.wind, ...value?.sensors?.wind },
      temperature: { ...fallbackSnapshot.sensors.temperature, ...value?.sensors?.temperature },
      humidity: { ...fallbackSnapshot.sensors.humidity, ...value?.sensors?.humidity },
    },
  };
}

async function saveSnapshot() {
  const content = `${JSON.stringify(snapshot, null, 2)}\n`;
  saveQueue = saveQueue.then(async () => {
    await mkdir(dataDirectory, { recursive: true });
    await writeFile(dataFile, content, "utf8");
  });

  return saveQueue;
}

function normalizeStatus(value) {
  const normalized = value.trim().toLowerCase();

  if (["normal", "siaga", "darurat"].includes(normalized)) {
    return normalized;
  }

  return "unknown";
}

function getSensorKey(topic) {
  if (topic === TOPICS.wind) return "wind";
  if (topic === TOPICS.temperature) return "temperature";
  if (topic === TOPICS.humidity) return "humidity";
  return null;
}

async function updateSnapshot(topic, payload) {
  const message = payload.toString().trim();
  const now = new Date().toISOString();

  snapshot.connection = "online";
  snapshot.lastTopic = topic;
  snapshot.lastUpdate = now;

  if (topic === TOPICS.status || topic === TOPICS.rootStatus) {
    snapshot.status = normalizeStatus(message);
    await saveSnapshot();
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

  const sensor = snapshot.sensors[sensorKey];
  sensor.value = numericValue;
  sensor.updatedAt = now;
  sensor.history = [...sensor.history, { time: now, value: numericValue }].slice(-maxHistory);

  await saveSnapshot();
}

async function markConnection(connection) {
  snapshot.connection = connection;
  await saveSnapshot();
}

await bootSnapshot();

const mqttClient = mqtt.connect(MQTT_BROKER_URL, {
  clientId: `desa_keseneng_collector_${Math.random().toString(16).slice(2, 10)}`,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});

mqttClient.on("connect", () => {
  console.log("MQTT collector connected");
  mqttClient.subscribe(SUBSCRIBE_TOPICS, { qos: 0, rh: 0 }, async (error) => {
    if (error) {
      console.error("Subscribe error:", error.message);
      await markConnection("error");
      return;
    }

    await markConnection("online");
    console.log(`Subscribed to ${SUBSCRIBE_TOPICS.join(", ")}`);
  });
});

mqttClient.on("message", (topic, payload) => {
  updateSnapshot(topic, payload).catch((error) => {
    console.error("Failed to update sensor snapshot:", error);
  });
});

mqttClient.on("error", async (error) => {
  console.error("MQTT collector error:", error.message);
  await markConnection("error");
});

mqttClient.on("close", () => {
  markConnection("offline").catch(() => undefined);
});

function shutdown() {
  console.log("Stopping MQTT collector");
  mqttClient.end(false, {}, () => {
    markConnection("offline").finally(() => process.exit(0));
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
