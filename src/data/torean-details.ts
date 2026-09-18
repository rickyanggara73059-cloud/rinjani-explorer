export type ToreanPointDetail = {
  terrain: string;
  vegetation: string;
  description: string;
  distanceFromPreviousKm: number | null;
  estimatedTimeMinutes: number | null;
  photo: string | null;
};

export const toreanPointDetails: Record<string, ToreanPointDetail> = {
  "torean-gate": {
    terrain: "Mountain valley trail with mixed open and forested sections",
    vegetation: "Tropical vegetation, grassland and forest",
    description:
      "The Torean approach follows the mountain valley landscape around the Kokok Putih drainage, with steep green ridges surrounding the trail.",
    distanceFromPreviousKm: null,
    estimatedTimeMinutes: null,
    photo: "/images/rinjani/torean/lembah-torean.jpg",
  },

  "torean-pos-1": {
    terrain: "Narrow valley trail with uneven volcanic ground",
    vegetation: "Grassland, shrubs and tropical vegetation",
    description:
      "This section represents the middle approach through the Torean valley, where the trail passes between steep mountain ridges and follows the natural contours of the valley.",
    distanceFromPreviousKm: null,
    estimatedTimeMinutes: null,
    photo: "/images/rinjani/torean/lembah-torean.jpg",
  },

  "torean-pos-2": {
    terrain: "Steep volcanic trail with rocky and exposed sections",
    vegetation: "Dense green vegetation with grass and shrubs",
    description:
      "The route becomes more technical around the steep valley sections. The Torean route includes narrow terrain, river crossings and rope- or stair-assisted sections.",
    distanceFromPreviousKm: null,
    estimatedTimeMinutes: null,
    photo: "/images/rinjani/torean/penimbungan-waterfall.jpg",
  },

  "torean-pos-3": {
    terrain: "Steep descent through cliff and waterfall terrain",
    vegetation: "Lush tropical vegetation and mossy volcanic slopes",
    description:
      "This section represents the dramatic landscape around the Penimbungan area, one of the best-known landmarks along the Torean route.",
    distanceFromPreviousKm: null,
    estimatedTimeMinutes: null,
    photo: "/images/rinjani/torean/penimbungan-waterfall.jpg",
  },

  "torean-segara-anak": {
    terrain: "Volcanic crater basin and lakeside terrain",
    vegetation: "Sparse volcanic vegetation mixed with greener areas around the lake",
    description:
      "The Torean route connects with the Segara Anak area inside the Rinjani caldera. Segara Anak is one of the principal landmarks reached from the Torean valley.",
    distanceFromPreviousKm: null,
    estimatedTimeMinutes: null,
    photo: "/images/rinjani/torean/segara-anak.jpg",
  },
};
