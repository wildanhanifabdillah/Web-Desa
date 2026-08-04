import { listArtGroups, listArtTypes } from "@/lib/art-culture-store";

export async function GET() {
  const types = await listArtTypes("active");
  const groups = await listArtGroups("active");

  return Response.json({
    data: {
      types,
      groups: groups.map((group) => ({
        ...group,
        artTypes: types.filter((type) => group.artTypeIds.includes(type.id)),
      })),
    },
    meta: {
      totalTypes: types.length,
      totalGroups: groups.length,
    },
  });
}