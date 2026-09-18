export type SembalunPointDetail = {
  terrain: string;
  vegetation: string;
  description: string;
  distanceFromPreviousKm: number | null;
  estimatedTimeMinutes: number | null;
  photo: string | null;
};

export const sembalunPointDetails: Record<string, SembalunPointDetail> = {
  "sembalun-lawang": {
    terrain: "Open valley and gradual uphill trail",
    vegetation: "Open grassland and savanna landscape",
    description:
      "The Sembalun approach begins through open landscapes before the trail climbs toward the first rest point.",
    distanceFromPreviousKm: null,
    estimatedTimeMinutes: null,
    photo: "/images/rinjani/sembalun/sembalun-lawang.jpg",
  },

  "pos-1": {
    terrain: "Gradual trail across open ground",
    vegetation: "Open savanna with limited tree cover",
    description:
      "An early rest point on the Sembalun route. The landscape remains open with broad views and relatively gradual walking.",
    distanceFromPreviousKm: 0.437,
    estimatedTimeMinutes: 120,
    photo: null,
  },

  "pos-2": {
    terrain: "Rolling grassland with gradual climbing",
    vegetation: "Open grassland and savanna",
    description:
      "The route continues across open hills toward Pos 2. Sun and wind exposure remain noticeable along this section.",
    distanceFromPreviousKm: 1.498,
    estimatedTimeMinutes: 60,
    photo: "/images/rinjani/sembalun/pos-2-tengengean.jpg",
  },

  "pos-3": {
    terrain: "Steeper volcanic terrain",
    vegetation: "Low vegetation with increasing rocky ground",
    description:
      "From Pos 2 toward Pos 3 the trail gains elevation and becomes more demanding, with the landscape beginning to transition from open savanna.",
    distanceFromPreviousKm: 1.443,
    estimatedTimeMinutes: 60,
    photo: null,
  },

  "plawangan-sembalun": {
    terrain: "Steep ascent toward the crater rim",
    vegetation: "More exposed high-elevation terrain",
    description:
      "Plawangan Sembalun is the main crater-rim campsite before the summit push, with wide views toward the Rinjani caldera and surrounding landscape.",
    distanceFromPreviousKm: 3.109,
    estimatedTimeMinutes: 195,
    photo: "/images/rinjani/sembalun/plawangan-sembalun.jpg",
  },

  "summit-rinjani": {
    terrain: "Steep volcanic ash, sand and scree",
    vegetation: "Sparse high-elevation vegetation",
    description:
      "The final summit approach is a steep, exposed volcanic section leading to the 3,726 m summit of Mount Rinjani.",
    distanceFromPreviousKm: 4.178,
    estimatedTimeMinutes: 240,
    photo: "/images/rinjani/sembalun/rinjani-summit.jpg",
  },
};






