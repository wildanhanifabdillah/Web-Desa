import { getDisasterSensorSnapshot } from "@/lib/disaster-sensor-store";

export async function GET() {
  return Response.json({
    data: getDisasterSensorSnapshot(),
  });
}