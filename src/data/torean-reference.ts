import { toreanRouteCoordinates } from "./torean-route-track";

const toreanForwardRoute = [...toreanRouteCoordinates].reverse();

export const toreanReferencePoints = [
  {
    id: "torean-gate",
    name: "Torean Gate",
    latitude: toreanForwardRoute[0][1],
    longitude: toreanForwardRoute[0][0],
  },
  {
    id: "torean-pos-1",
    name: "Pos 1",
    latitude: toreanForwardRoute[Math.floor(toreanForwardRoute.length * 0.25)][1],
    longitude: toreanForwardRoute[Math.floor(toreanForwardRoute.length * 0.25)][0],
  },
  {
    id: "torean-pos-2",
    name: "Pos 2",
    latitude: toreanForwardRoute[Math.floor(toreanForwardRoute.length * 0.50)][1],
    longitude: toreanForwardRoute[Math.floor(toreanForwardRoute.length * 0.50)][0],
  },
  {
    id: "torean-pos-3",
    name: "Pos 3",
    latitude: toreanForwardRoute[Math.floor(toreanForwardRoute.length * 0.75)][1],
    longitude: toreanForwardRoute[Math.floor(toreanForwardRoute.length * 0.75)][0],
  },
  {
    id: "torean-segara-anak",
    name: "Segara Anak",
    latitude: toreanForwardRoute[toreanForwardRoute.length - 1][1],
    longitude: toreanForwardRoute[toreanForwardRoute.length - 1][0],
  },
];
