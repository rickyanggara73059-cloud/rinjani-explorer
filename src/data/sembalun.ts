export type SembalunCheckpoint = {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  elevation: number | null;
  distanceFromPreviousKm: number | null;
  estimatedTimeMinutes: number | null;
  terrain: string;
  vegetation: string;
  description: string;
  photo: string | null;
  order: number;
};

export const sembalunCheckpoints: SembalunCheckpoint[] = [
  {
    id: "kandang-sapi",
    name: "Kandang Sapi",
    latitude: null,
    longitude: null,
    elevation: null,
    distanceFromPreviousKm: null,
    estimatedTimeMinutes: null,
    terrain: "",
    vegetation: "",
    description: "",
    photo: null,
    order: 1,
  },
  {
    id: "pos-1",
    name: "Pos 1",
    latitude: null,
    longitude: null,
    elevation: null,
    distanceFromPreviousKm: null,
    estimatedTimeMinutes: null,
    terrain: "",
    vegetation: "",
    description: "",
    photo: null,
    order: 2,
  },
  {
    id: "pos-2",
    name: "Pos 2",
    latitude: null,
    longitude: null,
    elevation: null,
    distanceFromPreviousKm: null,
    estimatedTimeMinutes: null,
    terrain: "",
    vegetation: "",
    description: "",
    photo: null,
    order: 3,
  },
  {
    id: "pos-3",
    name: "Pos 3",
    latitude: null,
    longitude: null,
    elevation: null,
    distanceFromPreviousKm: null,
    estimatedTimeMinutes: null,
    terrain: "",
    vegetation: "",
    description: "",
    photo: null,
    order: 4,
  },
  {
    id: "pos-4",
    name: "Pos 4",
    latitude: null,
    longitude: null,
    elevation: null,
    distanceFromPreviousKm: null,
    estimatedTimeMinutes: null,
    terrain: "",
    vegetation: "",
    description: "",
    photo: null,
    order: 5,
  },
  {
    id: "sembalun-crater-rim",
    name: "Sembalun Crater Rim",
    latitude: null,
    longitude: null,
    elevation: null,
    distanceFromPreviousKm: null,
    estimatedTimeMinutes: null,
    terrain: "",
    vegetation: "",
    description: "",
    photo: null,
    order: 6,
  },
  {
    id: "summit-rinjani",
    name: "Summit Rinjani",
    latitude: null,
    longitude: null,
    elevation: null,
    distanceFromPreviousKm: null,
    estimatedTimeMinutes: null,
    terrain: "",
    vegetation: "",
    description: "",
    photo: null,
    order: 7,
  },
];
