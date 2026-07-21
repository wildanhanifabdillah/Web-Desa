import { getProfileData } from "@/lib/profile";

export async function GET() {
  const profile = await getProfileData();

  return Response.json({
    data: profile,
  });
}
