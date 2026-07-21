export type VillageProfileRow = {
  id: string;
  slug: string;
  village_name: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_description: string;
  overview_kicker: string;
  overview_title: string;
  overview_description: string;
  overview_body: string;
  history_kicker: string;
  history_title: string;
  history_description: string;
  geography_kicker: string;
  geography_title: string;
  geography_description: string;
  vision_label: string;
  vision_title: string;
  vision_description: string;
  is_active: boolean | 0 | 1;
  created_at: string;
  updated_at: string;
};

export type VillageProfileFactSection = "hero" | "geography_stat" | "geography_border";

export type VillageProfileFactRow = {
  id: string;
  profile_id: string;
  section: VillageProfileFactSection;
  label: string;
  value: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type VillageProfileHighlightRow = {
  id: string;
  profile_id: string;
  label: string;
  value: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type VillageProfilePillarRow = {
  id: string;
  profile_id: string;
  name: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type VillageProfileTimelineItemRow = {
  id: string;
  profile_id: string;
  period: string;
  title: string;
  description: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type VillageProfileMissionRow = {
  id: string;
  profile_id: string;
  focus: string;
  description: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type VillageProfileOfficialRow = {
  id: string;
  profile_id: string;
  name: string;
  role: string;
  focus: string;
  contact: string;
  area: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type VillageProfileRecord = {
  profile: VillageProfileRow;
  facts: VillageProfileFactRow[];
  highlights: VillageProfileHighlightRow[];
  pillars: VillageProfilePillarRow[];
  timelineItems: VillageProfileTimelineItemRow[];
  missions: VillageProfileMissionRow[];
  officials: VillageProfileOfficialRow[];
};

export const villageProfileTableNames = {
  profiles: "village_profiles",
  facts: "village_profile_facts",
  highlights: "village_profile_highlights",
  pillars: "village_profile_pillars",
  timelineItems: "village_profile_timeline_items",
  missions: "village_profile_missions",
  officials: "village_profile_officials",
} as const;
