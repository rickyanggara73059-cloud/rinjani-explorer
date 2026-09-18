export type SenaruPointDetail = {
  terrain: string;
  vegetation: string;
  description: string;
  distanceFromPreviousKm: number | null;
  estimatedTimeMinutes: number | null;
  photo: string | null;
};

export const senaruPointDetails: Record<string, SenaruPointDetail> = {
  "senaru-basecamp": {
    terrain: "Forest trail with gradual and sustained climbing",
    vegetation: "Tropical montane forest with dense tree cover",
    description:
      "The Senaru route begins from the forested slopes of Rinjani and climbs steadily through the mountain's northern approach.",
    distanceFromPreviousKm: null,
    estimatedTimeMinutes: null,
    photo: null,
  },

  "senaru-pos-1": {
    terrain: "Steady uphill forest trail",
    vegetation: "Dense tropical forest with shaded sections",
    description:
      "Pos 1 Pemantuan is an early rest point along the long forest ascent from Senaru Basecamp.",
    distanceFromPreviousKm: 3.022,
    estimatedTimeMinutes: 120,
    photo: null,
  },

  "senaru-pos-2": {
    terrain: "Steeper and more sustained volcanic forest trail",
    vegetation: "Montane forest with gradually thinner vegetation",
    description:
      "The trail continues climbing toward Pos 2 Montong Satas through increasingly demanding terrain and sustained elevation gain.",
    distanceFromPreviousKm: 2.621,
    estimatedTimeMinutes: 75,
    photo: null,
  },

  "senaru-pos-3": {
    terrain: "Steep volcanic trail approaching the upper forest",
    vegetation: "Thinning forest and low mountain vegetation",
    description:
      "Pos 3 Mondokan Lokak marks a higher section of the Senaru ascent as the trail approaches the crater rim.",
    distanceFromPreviousKm: 2.427,
    estimatedTimeMinutes: 75,
    photo: null,
  },

  "plawangan-senaru": {
    terrain: "Rocky volcanic ridge and crater-rim trail",
    vegetation: "Sparse high-elevation vegetation",
    description:
      "Plawangan Senaru sits on the northern crater rim and provides the transition from the forest climb to the volcanic highland terrain.",
    distanceFromPreviousKm: 1.725,
    estimatedTimeMinutes: 120,
    photo: null,
  },

  "segara-anak": {
    terrain: "Steep rocky descent into the crater basin",
    vegetation: "Low shrubs and sparse volcanic vegetation",
    description:
      "The route descends from Plawangan Senaru into the caldera toward Segara Anak, a major landmark of the Senaru trekking route.",
    distanceFromPreviousKm: 2.756,
    estimatedTimeMinutes: 90,
    photo: null,
  },

  "aiq-kalak": {
    terrain: "Rocky volcanic ground near the crater lake area",
    vegetation: "Sparse shrubs and low-elevation volcanic vegetation",
    description:
      "Aiq Kalak is located near the Segara Anak area before the route begins its long ascent toward Plawangan Sembalun.",
    distanceFromPreviousKm: 0.442,
    estimatedTimeMinutes: 20,
    photo: null,
  },

  "plawangan-sembalun": {
    terrain: "Steep rocky ascent toward the eastern crater rim",
    vegetation: "Sparse high-elevation vegetation",
    description:
      "Plawangan Sembalun marks the eastern crater rim and the final major staging point before the summit section.",
    distanceFromPreviousKm: 3.851,
    estimatedTimeMinutes: 150,
    photo: null,
  },

  "summit-rinjani": {
    terrain: "Steep volcanic ash, loose sand and scree",
    vegetation: "Very sparse high-elevation vegetation",
    description:
      "The summit section is an exposed volcanic ascent with loose sand and scree leading toward the highest point of Mount Rinjani.",
    distanceFromPreviousKm: 3.930,
    estimatedTimeMinutes: 240,
    photo: null,
  },

  "sembalun-lawang": {
    terrain: "Long volcanic descent transitioning into open mountain terrain",
    vegetation: "Sparse upper-mountain vegetation changing to open grassland",
    description:
      "After the summit, the route descends from the high volcanic terrain toward Sembalun Lawang through a long downhill section.",
    distanceFromPreviousKm: 12.898,
    estimatedTimeMinutes: 420,
    photo: null,
  },
};
