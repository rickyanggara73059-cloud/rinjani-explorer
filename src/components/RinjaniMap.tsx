import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { sembalunReferencePoints } from "../data/sembalun-reference";
import { sembalunPointDetails } from "../data/sembalun-details";
import { sembalunSummitTrackCoordinates } from "../data/sembalun-summit-track";
import { senaruReferencePoints } from "../data/senaru-reference";
import { senaruPointDetails } from "../data/senaru-details";
import { senaruRouteCoordinates } from "../data/senaru-route-track";
import { sembalunFullTrackCoordinates } from "../data/sembalun-full-track";
import { toreanRouteCoordinates } from "../data/torean-route-track";
import { toreanReferencePoints } from "../data/torean-reference";
import { toreanPointDetails } from "../data/torean-details";

export function RinjaniMap() {
  const [routeMode, setRouteMode] = useState<"sembalun" | "senaru" | "torean">("sembalun");
  const [toreanTerrainElevations, setToreanTerrainElevations] =
    useState<Record<string, number>>({});

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [selectedPoint, setSelectedPoint] =
    useState<
      | (typeof sembalunReferencePoints)[number]
      | (typeof senaruReferencePoints)[number]
      | (typeof toreanReferencePoints)[number]
      | null
    >(null);

  const activeReferencePoints =
    routeMode === "senaru"
      ? senaruReferencePoints
      : routeMode === "torean"
        ? toreanReferencePoints
        : sembalunReferencePoints;

  const activePointDetails =
    routeMode === "senaru"
      ? senaruPointDetails
      : routeMode === "torean"
        ? toreanPointDetails
        : sembalunPointDetails;

  const navigablePoints = activeReferencePoints.filter(
    (point) =>
      point.id !== "pos-4" &&
      point.latitude !== null &&
      point.longitude !== null
  );


  const trekTimer = useRef<number | null>(null);
  const trekAnimationFrame = useRef<number | null>(null);
  const trekPlayingRef = useRef(false);
  const [isTrekPlaying, setIsTrekPlaying] = useState(false);

  const stopTrek = () => {
    if (trekTimer.current !== null) {
      window.clearInterval(trekTimer.current);
      trekTimer.current = null;
    }

    if (trekAnimationFrame.current !== null) {
      window.cancelAnimationFrame(trekAnimationFrame.current);
      trekAnimationFrame.current = null;
    }

    trekPlayingRef.current = false;
    setIsTrekPlaying(false);
  };

  const goToCheckpoint = (index: number) => {
    const markers = document.querySelectorAll<HTMLElement>(
      ".rinjani-checkpoint-marker"
    );

    if (markers[index]) {
      markers[index].click();
    }
  };

  const animateSenaru = () => {
    const map = mapRef.current;

    if (!map || senaruRouteCoordinates.length < 2) {
      stopTrek();
      return;
    }

    trekPlayingRef.current = true;
    setIsTrekPlaying(true);

    const summitIndex = navigablePoints.findIndex(
      (point) => point.id === "summit-rinjani"
    );

    const senaruTrekPoints =
      summitIndex >= 0
        ? navigablePoints.slice(0, summitIndex + 1)
        : navigablePoints;

    const checkpointIndexes = senaruTrekPoints.map((point) =>
      "routeIndex" in point ? point.routeIndex : 0
    );

    const selectedPointId = selectedPoint?.id;

    const selectedCheckpointIndex = selectedPointId
      ? senaruTrekPoints.findIndex((point) => point.id === selectedPointId)
      : 0;

    const safeCheckpointIndex =
      selectedCheckpointIndex >= 0 ? selectedCheckpointIndex : 0;

    const startFrame = Math.min(
      checkpointIndexes[safeCheckpointIndex] ?? 0,
      senaruRouteCoordinates.length - 1
    );

    const finalFrame = checkpointIndexes[checkpointIndexes.length - 1] ?? (senaruRouteCoordinates.length - 1);
    const frameSpan = Math.max(finalFrame - startFrame, 1);
    const duration = Math.max(18000, Math.min(28000, frameSpan * 22));

    const profileElevations = navigablePoints.map(
      (point) => ('elevation' in point ? point.elevation : 0)
    );

    const profileMinElevation = Math.min(...profileElevations);
    const profileMaxElevation = Math.max(...profileElevations);
    const profileElevationRange = Math.max(
      profileMaxElevation - profileMinElevation,
      1
    );

    let frameIndex = startFrame;
    let animationStart = 0;
    let cameraBearing = map.getBearing();
    let lastCheckpointIndex = safeCheckpointIndex;

    const animate = (timestamp: number) => {
      if (!trekPlayingRef.current) {
        return;
      }

      if (animationStart === 0) {
        animationStart = timestamp;
      }

      const elapsed = timestamp - animationStart;
      const progress = Math.min(elapsed / duration, 1);

      frameIndex = Math.min(
        startFrame + Math.floor(progress * frameSpan),
        finalFrame
      );

      while (
        lastCheckpointIndex < senaruTrekPoints.length - 1 &&
        frameIndex >= checkpointIndexes[lastCheckpointIndex + 1]
      ) {
        lastCheckpointIndex += 1;
        setSelectedPoint(senaruTrekPoints[lastCheckpointIndex]);
      }

      let segmentIndex = Math.max(lastCheckpointIndex - 1, 0);

      while (
        segmentIndex < checkpointIndexes.length - 2 &&
        frameIndex > checkpointIndexes[segmentIndex + 1]
      ) {
        segmentIndex += 1;
      }

      const segmentStartIndex = checkpointIndexes[segmentIndex] ?? 0;
      const segmentEndIndex =
        checkpointIndexes[Math.min(segmentIndex + 1, checkpointIndexes.length - 1)] ??
        segmentStartIndex;

      const segmentProgress =
        segmentEndIndex > segmentStartIndex
          ? Math.min(
              Math.max(
                (frameIndex - segmentStartIndex) /
                  (segmentEndIndex - segmentStartIndex),
                0
              ),
              1
            )
          : 0;

      const profileIndexProgress =
        segmentIndex + segmentProgress;

      const profileX =
        (profileIndexProgress / Math.max(profileElevations.length - 1, 1)) * 260;

      const segmentElevationStart =
        profileElevations[segmentIndex] ?? profileElevations[0] ?? 0;

      const segmentElevationEnd =
        profileElevations[Math.min(segmentIndex + 1, profileElevations.length - 1)] ??
        segmentElevationStart;

      const profileElevation =
        segmentElevationStart +
        (segmentElevationEnd - segmentElevationStart) * segmentProgress;

      const profileY =
        72 -
        ((profileElevation - profileMinElevation) / profileElevationRange) * 56;

      const elevationMarker = document.getElementById("rinjani-elevation-marker");

      if (elevationMarker) {
        elevationMarker.setAttribute("cx", String(profileX));
        elevationMarker.setAttribute("cy", String(profileY));
      }

      const [lng, lat] = senaruRouteCoordinates[frameIndex];

      const lookAheadIndex = Math.min(
        frameIndex + 18,
        finalFrame
      );

      const [lookAheadLng, lookAheadLat] =
        senaruRouteCoordinates[lookAheadIndex];

      const targetBearing =
        (Math.atan2(
          lookAheadLng - lng,
          lookAheadLat - lat
        ) *
          180) /
        Math.PI;

      let bearingDelta = targetBearing - cameraBearing;

      if (bearingDelta > 180) {
        bearingDelta -= 360;
      }

      if (bearingDelta < -180) {
        bearingDelta += 360;
      }

      cameraBearing += bearingDelta * 0.08;

      const cinematicZoom = 13.8 + progress * 1.2;
      const cinematicPitch = 64 + progress * 10;

      map.jumpTo({
        center: [lng, lat],
        zoom: cinematicZoom,
        pitch: cinematicPitch,
        bearing: cameraBearing,
      });

      const progressSource = map.getSource(
        "sembalun-route-progress"
      ) as mapboxgl.GeoJSONSource;

      if (progressSource) {
        progressSource.setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: senaruRouteCoordinates.slice(0, frameIndex + 1),
          },
        });
      }

      if (progress < 1) {
        trekAnimationFrame.current =
          window.requestAnimationFrame(animate);
        return;
      }

      trekAnimationFrame.current = null;
      setSelectedPoint(navigablePoints[navigablePoints.length - 1]);
      stopTrek();
    };

    trekAnimationFrame.current =
      window.requestAnimationFrame(animate);
  };

  const animateSembalun = () => {
    const map = mapRef.current;

    if (!map || sembalunFullTrackCoordinates.length < 2) {
      stopTrek();
      return;
    }

    trekPlayingRef.current = true;
    setIsTrekPlaying(true);

    const checkpointIndexes = [0, 238, 318, 393, 510, 738];

    const selectedCheckpointIndex = selectedPoint
      ? navigablePoints.findIndex((point) => point.id === selectedPoint.id)
      : 0;

    const safeCheckpointIndex =
      selectedCheckpointIndex >= 0 ? selectedCheckpointIndex : 0;

    const startFrame = Math.min(
      checkpointIndexes[safeCheckpointIndex] ?? 0,
      sembalunFullTrackCoordinates.length - 1
    );

    const finalFrame = sembalunFullTrackCoordinates.length - 1;
    const frameSpan = Math.max(finalFrame - startFrame, 1);
    const duration = Math.max(20000, Math.min(28000, frameSpan * 28));

    const profileElevations = navigablePoints.map(
      (point) => ('elevation' in point ? point.elevation : 0)
    );

    const profileMinElevation = Math.min(...profileElevations);
    const profileMaxElevation = Math.max(...profileElevations);
    const profileElevationRange = Math.max(
      profileMaxElevation - profileMinElevation,
      1
    );

    let frameIndex = startFrame;
    let animationStart = 0;
    let cameraBearing = map.getBearing();
    let lastCheckpointIndex = safeCheckpointIndex;

    const animate = (timestamp: number) => {
      if (!trekPlayingRef.current) {
        return;
      }

      if (animationStart === 0) {
        animationStart = timestamp;
      }

      const elapsed = timestamp - animationStart;
      const progress = Math.min(elapsed / duration, 1);

      frameIndex = Math.min(
        startFrame + Math.floor(progress * frameSpan),
        finalFrame
      );

      while (
        lastCheckpointIndex < checkpointIndexes.length - 1 &&
        frameIndex >= checkpointIndexes[lastCheckpointIndex + 1]
      ) {
        lastCheckpointIndex += 1;
        setSelectedPoint(navigablePoints[lastCheckpointIndex]);
      }

      let segmentIndex = Math.max(lastCheckpointIndex - 1, 0);

      while (
        segmentIndex < checkpointIndexes.length - 2 &&
        frameIndex > checkpointIndexes[segmentIndex + 1]
      ) {
        segmentIndex += 1;
      }

      const segmentStartIndex = checkpointIndexes[segmentIndex] ?? 0;
      const segmentEndIndex =
        checkpointIndexes[Math.min(segmentIndex + 1, checkpointIndexes.length - 1)] ??
        segmentStartIndex;

      const segmentProgress =
        segmentEndIndex > segmentStartIndex
          ? Math.min(
              Math.max(
                (frameIndex - segmentStartIndex) /
                  (segmentEndIndex - segmentStartIndex),
                0
              ),
              1
            )
          : 0;

      const profileIndexProgress =
        segmentIndex + segmentProgress;

      const profileX =
        (profileIndexProgress / Math.max(profileElevations.length - 1, 1)) * 260;

      const segmentElevationStart =
        profileElevations[segmentIndex] ?? profileElevations[0] ?? 0;

      const segmentElevationEnd =
        profileElevations[Math.min(segmentIndex + 1, profileElevations.length - 1)] ??
        segmentElevationStart;

      const profileElevation =
        segmentElevationStart +
        (segmentElevationEnd - segmentElevationStart) * segmentProgress;

      const profileY =
        72 -
        ((profileElevation - profileMinElevation) / profileElevationRange) * 56;

      const elevationMarker = document.getElementById("rinjani-elevation-marker");

      if (elevationMarker) {
        elevationMarker.setAttribute("cx", String(profileX));
        elevationMarker.setAttribute("cy", String(profileY));
      }

      const [lng, lat] = sembalunFullTrackCoordinates[frameIndex];

      const lookAheadIndex = Math.min(frameIndex + 18, finalFrame);
      const [lookAheadLng, lookAheadLat] =
        sembalunFullTrackCoordinates[lookAheadIndex];

      const targetBearing =
        (Math.atan2(
          lookAheadLng - lng,
          lookAheadLat - lat
        ) *
          180) /
        Math.PI;

      let bearingDelta = targetBearing - cameraBearing;

      if (bearingDelta > 180) {
        bearingDelta -= 360;
      }

      if (bearingDelta < -180) {
        bearingDelta += 360;
      }

      cameraBearing += bearingDelta * 0.08;

      const cinematicZoom = 13.5 + progress * 1.1;
      const cinematicPitch = 64 + progress * 9;

      const activeMap = mapRef.current;
      if (!activeMap) {
        stopTrek();
        return;
      }
      activeMap.jumpTo({
        center: [lng, lat],
        zoom: cinematicZoom,
        pitch: cinematicPitch,
        bearing: cameraBearing,
      });

      const progressSource = activeMap.getSource(
        "sembalun-route-progress"
      ) as mapboxgl.GeoJSONSource;

      if (progressSource) {
        progressSource.setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: sembalunFullTrackCoordinates.slice(0, frameIndex + 1),
          },
        });
      }

      if (progress < 1) {
        trekAnimationFrame.current =
          window.requestAnimationFrame(animate);
        return;
      }

      trekAnimationFrame.current = null;
      setSelectedPoint(navigablePoints[navigablePoints.length - 1]);
      stopTrek();
    };

    trekAnimationFrame.current =
      window.requestAnimationFrame(animate);
  };

  const animateTorean = () => {
    const map = mapRef.current;

    if (!map || toreanRouteCoordinates.length < 2) {
      stopTrek();
      return;
    }

    const route = [...toreanRouteCoordinates].reverse();
    const finalFrame = route.length - 1;

    const checkpointIndexes = navigablePoints.map((_, index) =>
      Math.round((index / Math.max(navigablePoints.length - 1, 1)) * finalFrame)
    );

    const selectedPointId = selectedPoint?.id;

    const selectedCheckpointIndex = selectedPointId
      ? navigablePoints.findIndex((point) => point.id === selectedPointId)
      : 0;

    const safeCheckpointIndex =
      selectedCheckpointIndex >= 0 ? selectedCheckpointIndex : 0;

    const startFrame = Math.min(
      checkpointIndexes[safeCheckpointIndex] ?? 0,
      finalFrame
    );

    const frameSpan = Math.max(finalFrame - startFrame, 1);
    const duration = Math.max(18000, Math.min(28000, frameSpan * 22));

    const profileElevations = navigablePoints.map(
      (point) => toreanTerrainElevations[point.id] ?? 0
    );

    const profileMinElevation = Math.min(...profileElevations);
    const profileMaxElevation = Math.max(...profileElevations);
    const profileElevationRange = Math.max(
      profileMaxElevation - profileMinElevation,
      1
    );

    let frameIndex = startFrame;
    let animationStart = 0;
    let cameraBearing = map.getBearing();
    let lastCheckpointIndex = safeCheckpointIndex;

    trekPlayingRef.current = true;
    setIsTrekPlaying(true);

    const animate = (timestamp: number) => {
      if (!trekPlayingRef.current) {
        return;
      }

      if (animationStart === 0) {
        animationStart = timestamp;
      }

      const elapsed = timestamp - animationStart;
      const progress = Math.min(elapsed / duration, 1);

      frameIndex = Math.min(
        startFrame + Math.floor(progress * frameSpan),
        finalFrame
      );

      while (
        lastCheckpointIndex < navigablePoints.length - 1 &&
        frameIndex >= checkpointIndexes[lastCheckpointIndex + 1]
      ) {
        lastCheckpointIndex += 1;
        setSelectedPoint(navigablePoints[lastCheckpointIndex]);
      }

      let segmentIndex = Math.max(lastCheckpointIndex - 1, 0);

      while (
        segmentIndex < checkpointIndexes.length - 2 &&
        frameIndex > checkpointIndexes[segmentIndex + 1]
      ) {
        segmentIndex += 1;
      }

      const segmentStartIndex = checkpointIndexes[segmentIndex] ?? 0;
      const segmentEndIndex =
        checkpointIndexes[Math.min(segmentIndex + 1, checkpointIndexes.length - 1)] ??
        segmentStartIndex;

      const segmentProgress =
        segmentEndIndex > segmentStartIndex
          ? Math.min(
              Math.max(
                (frameIndex - segmentStartIndex) /
                  (segmentEndIndex - segmentStartIndex),
                0
              ),
              1
            )
          : 0;

      const profileIndexProgress =
        segmentIndex + segmentProgress;

      const profileX =
        (profileIndexProgress /
          Math.max(profileElevations.length - 1, 1)) *
        260;

      const segmentElevationStart =
        profileElevations[segmentIndex] ?? profileElevations[0] ?? 0;

      const segmentElevationEnd =
        profileElevations[
          Math.min(segmentIndex + 1, profileElevations.length - 1)
        ] ?? segmentElevationStart;

      const profileElevation =
        segmentElevationStart +
        (segmentElevationEnd - segmentElevationStart) * segmentProgress;

      const profileY =
        72 -
        ((profileElevation - profileMinElevation) /
          profileElevationRange) *
          56;

      const elevationMarker = document.getElementById(
        "rinjani-elevation-marker"
      );

      if (elevationMarker) {
        elevationMarker.setAttribute("cx", String(profileX));
        elevationMarker.setAttribute("cy", String(profileY));
      }

      // Gunakan titik rata-rata di sekitar frame agar kamera tidak mengikuti
      // noise kecil / zig-zag dari setiap titik GPX.
      const smoothRadius = 12;
      const smoothStart = Math.max(0, frameIndex - smoothRadius);
      const smoothEnd = Math.min(finalFrame, frameIndex + smoothRadius);

      let smoothLng = 0;
      let smoothLat = 0;
      let smoothCount = 0;

      for (let i = smoothStart; i <= smoothEnd; i++) {
        smoothLng += route[i][0];
        smoothLat += route[i][1];
        smoothCount++;
      }

      const lng = smoothLng / smoothCount;
      const lat = smoothLat / smoothCount;

      // Kamera Torean tetap tenang:
      // posisi mengikuti jalur, tetapi bearing tidak ikut berputar
      // mengikuti setiap tikungan kecil GPX.
      const stableBearing = cameraBearing;
      const cinematicZoom = 13.2 + progress * 0.6;
      const cinematicPitch = 62 + progress * 5;

      map.jumpTo({
        center: [lng, lat],
        zoom: cinematicZoom,
        pitch: cinematicPitch,
        bearing: stableBearing,
      });

      const progressSource = map.getSource(
        "sembalun-route-progress"
      ) as mapboxgl.GeoJSONSource;

      if (progressSource) {
        progressSource.setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: route.slice(0, frameIndex + 1),
          },
        });
      }

      if (progress < 1) {
        trekAnimationFrame.current =
          window.requestAnimationFrame(animate);
        return;
      }

      trekAnimationFrame.current = null;
      setSelectedPoint(
        navigablePoints[navigablePoints.length - 1]
      );
      stopTrek();
    };

    trekAnimationFrame.current =
      window.requestAnimationFrame(animate);
  };
  const startTrek = () => {
    stopTrek();

    if (routeMode === "senaru") {
      animateSenaru();
      return;
    }

    if (routeMode === "torean") {
      animateTorean();
      return;
    }

    animateSembalun();
  };
  const resetTrek = () => {
    stopTrek();
    goToCheckpoint(0);
  };

  useEffect(() => {
    return () => {
      if (trekTimer.current !== null) {
        window.clearInterval(trekTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const container = mapContainer.current;

    if (!container) return;

    const map = new mapboxgl.Map({
      accessToken: import.meta.env.VITE_MAPBOX_TOKEN,
      container,
      style: "mapbox://styles/mapbox/standard-satellite",
      center: [116.457, -8.411],
      zoom: 11.5,
      pitch: 70,
      bearing: 10,
      antialias: true,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const updateCheckpointLabels = () => {
      const zoom = map.getZoom();

      document.querySelectorAll<HTMLElement>(".rinjani-checkpoint-label").forEach((label) => {
        if (zoom < 12) {
          label.style.fontSize = "8px";
          label.style.opacity = "0.35";
          label.style.padding = "3px 6px";
        } else if (zoom < 13) {
          label.style.fontSize = "9px";
          label.style.opacity = "0.65";
          label.style.padding = "3px 7px";
        } else {
          label.style.fontSize = "10px";
          label.style.opacity = "1";
          label.style.padding = "4px 8px";
        }
      });
    };

    map.on("zoom", updateCheckpointLabels);
    updateCheckpointLabels();


    map.on("error", (event) => {
      console.error("MAPBOX ERROR:", event.error);
    });

    map.on("load", () => {
      console.log("RINJANI MAP LOADED");

      map.resize();

      map.addSource("rinjani-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });

      map.setTerrain({
        source: "rinjani-dem",
        exaggeration: 1.5,
      });

      if (routeMode === "torean") {
        map.once("idle", () => {
          const terrainElevations: Record<string, number> = {};

          toreanReferencePoints.forEach((point) => {
            const elevation = map.queryTerrainElevation(
              [point.longitude, point.latitude],
              { exaggerated: false }
            );

            if (typeof elevation === "number") {
              terrainElevations[point.id] = elevation;
            }
          });

          console.log("TOREAN TERRAIN PROFILE:", terrainElevations);
          setToreanTerrainElevations(terrainElevations);
        });
      }


      const routeCoordinates =
        routeMode === "senaru"
          ? senaruRouteCoordinates
          : routeMode === "torean"
            ? toreanRouteCoordinates
            : sembalunFullTrackCoordinates;

      const points = activeReferencePoints.filter(
        (point) =>
          point.id !== "pos-4" &&
          point.latitude !== null &&
          point.longitude !== null
      );
      const coordinates =
        routeMode === "torean"
          ? routeCoordinates
          : points.map((point) => [
              point.longitude,
              point.latitude,
            ]);

      const bounds = new mapboxgl.LngLatBounds();

      if (routeMode === "torean") {
        routeCoordinates.forEach(([lng, lat]) => {
          bounds.extend([lng, lat]);
        });
      } else {
        points.forEach((point) => {
          bounds.extend([point.longitude, point.latitude]);
        });
      }

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: {
            top: 80,
            bottom: 80,
            left: 80,
            right: 80,
          },
          pitch: 65,
          bearing: 10,
          duration: 1200,
        });
      }
      map.addSource("sembalun-route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: routeCoordinates,
          },
        },
      });

      map.addLayer({
        id: "sembalun-route-line",
        type: "line",
        source: "sembalun-route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#C89B3C",
          "line-width": 5,
          "line-opacity": 0.95,
        },
      });

      map.addSource("sembalun-route-progress", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [coordinates[0], coordinates[0]],
          },
        },
      });

      map.addLayer({
        id: "sembalun-route-progress-line",
        type: "line",
        source: "sembalun-route-progress",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#FF5A36",
          "line-width": 7,
          "line-opacity": 0.95,
        },
      });

      points.forEach((point) => {
        const marker = new mapboxgl.Marker({
          color: "#C89B3C",
        })
          .setLngLat([point.longitude, point.latitude])
          .addTo(map);

        const markerElement = marker.getElement();

        const label = document.createElement("div");
        label.textContent = point.name;
        label.className = "rinjani-checkpoint-label";
        label.style.position = "absolute";
        label.style.left = "50%";
        label.style.top = "-10px";
        label.style.transform = "translate(-50%, -100%)";
        label.style.padding = "4px 8px";
        label.style.borderRadius = "6px";
        label.style.background = "rgba(7, 26, 36, 0.88)";
        label.style.border = "1px solid rgba(200,155,60,0.45)";
        label.style.color = "#fff";
        label.style.fontSize = "10px";
        label.style.fontWeight = "600";
        label.style.lineHeight = "1.2";
        label.style.whiteSpace = "nowrap";
        label.style.pointerEvents = "none";
        label.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
        label.style.backdropFilter = "blur(6px)";

        markerElement.appendChild(label);

        markerElement.classList.add("rinjani-checkpoint-marker");
        markerElement.style.cursor = "pointer";

        markerElement.onclick = () => {
          const pointIndex = points.findIndex(
            (item) => item.id === point.id
          );

          const progressSource = map.getSource(
            "sembalun-route-progress"
          ) as mapboxgl.GeoJSONSource;

          if (progressSource && pointIndex >= 0) {
            const progressCoordinates =
              point.id === "summit-rinjani"
                ? [
                    ...coordinates.slice(0, 5),
                    ...sembalunSummitTrackCoordinates,
                  ]
                : coordinates.slice(0, pointIndex + 1);

            progressSource.setData({
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: progressCoordinates,
              },
            });
          }

          document
            .querySelectorAll<HTMLElement>(".rinjani-checkpoint-marker")
            .forEach((element) => {
              element.style.filter = "none";
              element.style.zIndex = "1";

              const svg = element.querySelector("svg");
              if (svg) {
                svg.style.transform = "scale(1)";
                svg.style.transformOrigin = "center";
              }

              element
                .querySelectorAll("svg path")
                .forEach((pathElement) => {
                  pathElement.setAttribute("fill", "#C89B3C");
                });
            });

          setSelectedPoint(point);

          markerElement.style.filter =
            "drop-shadow(0 0 8px rgba(255,255,255,0.85))";
          markerElement.style.zIndex = "10";

          const selectedSvg = markerElement.querySelector("svg");
          if (selectedSvg) {
            selectedSvg.style.transform = "scale(1.25)";
            selectedSvg.style.transformOrigin = "center";
          }

          markerElement
            .querySelectorAll("svg path")
            .forEach((pathElement) => {
              pathElement.setAttribute("fill", "#FF5A36");
            });

          map.easeTo({
            center: [point.longitude, point.latitude],
            zoom: 13.5,
            pitch: map.getPitch(),
            bearing: map.getBearing(),
            duration: 1200,
            essential: true,
          });
        };
      });
    });

    return () => {
      map.remove();
    };
  }, [routeMode]);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <div
        ref={mapContainer}
        style={{ width: "100%", height: "100%" }}
      />

      <div
        aria-label="Rinjani 3D Explorer HUD"
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 16px 10px 10px",
          borderRadius: 16,
          background: "rgba(7, 26, 36, 0.78)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 12px 32px rgba(0,0,0,0.28)",
          backdropFilter: "blur(12px)",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 11,
            backgroundImage:
              "url(/images/rinjani/rinjani-awesome-logo.png)",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "58px auto",
            backgroundColor: "rgba(255,255,255,0.04)",
          }}
        />

        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 2,
              color: "#C89B3C",
            }}
          >
            RINJANI 3D EXPLORER
          </div>

          <div
            style={{
              marginTop: 3,
              fontSize: 11,
              color: "rgba(255,255,255,0.62)",
              letterSpacing: 0.6,
            }}
          >
            {routeMode === "senaru" ? "SENARU ROUTE • 10 CHECKPOINTS" : routeMode === "torean" ? "TOREAN ROUTE" : "SEMBALUN ROUTE • 6 CHECKPOINTS"}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 88,
          left: 24,
          zIndex: 6,
          display: "flex",
          gap: 8,
          padding: 6,
          borderRadius: 12,
          background: "rgba(7, 26, 36, 0.82)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 10px 24px rgba(0,0,0,0.24)",
          backdropFilter: "blur(10px)",
        }}
      >
        <button
          type="button"
          onClick={() => {
            stopTrek();
            setSelectedPoint(null);
            setRouteMode("sembalun");
          }}
          style={{
            border: "none",
            borderRadius: 8,
            padding: "8px 12px",
            background: routeMode === "sembalun" ? "#C89B3C" : "rgba(255,255,255,0.08)",
            color: routeMode === "sembalun" ? "#071A24" : "#fff",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.8,
            cursor: "pointer",
          }}
        >
          SEMBALUN
        </button>

        <button
          type="button"
          onClick={() => {
            stopTrek();
            setSelectedPoint(null);
            setRouteMode("senaru");
          }}
          style={{
            border: "none",
            borderRadius: 8,
            padding: "8px 12px",
            background: routeMode === "senaru" ? "#C89B3C" : "rgba(255,255,255,0.08)",
            color: routeMode === "senaru" ? "#071A24" : "#fff",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.8,
            cursor: "pointer",
          }}
        >
          SENARU
        </button>
        <button
          type="button"
          onClick={() => {
            stopTrek();
            setSelectedPoint(null);
            setRouteMode("torean");
          }}
          style={{
            border: "none",
            borderRadius: 8,
            padding: "8px 12px",
            background: routeMode === "torean" ? "#C89B3C" : "rgba(255,255,255,0.08)",
            color: routeMode === "torean" ? "#071A24" : "#fff",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.8,
            cursor: "pointer",
          }}
        >
          TOREAN
        </button>
      </div>

      {selectedPoint && (
        <div
          style={{
            position: "absolute",
            left: 24,
            bottom: 24,
            zIndex: 10,
            width: "min(380px, calc(100% - 48px))",
            maxHeight: "calc(100vh - 48px)",
            overflowY: "auto",
            padding: 20,
            borderRadius: 20,
            background: "rgba(7, 26, 36, 0.94)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
            backdropFilter: "blur(12px)",
            scrollbarWidth: "thin",
          }}
        >
          <button
            type="button"
            onClick={() => {
              stopTrek();
              setSelectedPoint(null);
            }}
            style={{
              float: "right",
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ×
          </button>

          <div
            style={{
              width: 220,
              height: 80,
              marginBottom: 4,
              backgroundImage:
                "url(/images/rinjani/rinjani-awesome-logo.png)",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "240px auto",
            }}
            aria-label="Rinjani Awesome"
          />

          <div
            style={{
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#C89B3C",
            }}
          >
            {routeMode === "senaru" ? "Senaru Trek" : routeMode === "torean" ? "Torean Trek" : "Sembalun Trek"}
          </div>

          <h2 style={{ margin: "8px 0 16px", fontSize: 26 }}>
            {selectedPoint.name}
          </h2>

          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 18,
            }}
          >
            <button
              type="button"
              onClick={isTrekPlaying ? stopTrek : startTrek}
              style={{
                flex: 1,
                height: 38,
                borderRadius: 10,
                border: "1px solid rgba(200,155,60,0.35)",
                background: isTrekPlaying
                  ? "rgba(255,90,54,0.12)"
                  : "rgba(200,155,60,0.12)",
                color: isTrekPlaying ? "#FF5A36" : "#C89B3C",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.8,
              }}
            >
              {isTrekPlaying ? "Pause Trek" : "Start Trek"}
            </button>

            <button
              type="button"
              onClick={resetTrek}
              style={{
                width: 78,
                height: 38,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.72)",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              Reset
            </button>
          </div>

          {(() => {
            const currentIndex = navigablePoints.findIndex(
              (point) => point.id === selectedPoint.id
            );

            const completedCheckpoints =
              currentIndex >= 0 ? currentIndex + 1 : 1;

            const totalCheckpoints = navigablePoints.length;

            const progressPercent =
              totalCheckpoints > 1
                ? (currentIndex / (totalCheckpoints - 1)) * 100
                : 0;

            const distanceKm = navigablePoints
              .slice(0, currentIndex + 1)
              .reduce((total, point) => {
                const detail = activePointDetails[point.id];
                return total + (detail?.distanceFromPreviousKm ?? 0);
              }, 0);

            const estimatedMinutes = navigablePoints
              .slice(0, currentIndex + 1)
              .reduce((total, point) => {
                const detail = activePointDetails[point.id];
                return total + (detail?.estimatedTimeMinutes ?? 0);
              }, 0);

            const hours = Math.floor(estimatedMinutes / 60);
            const minutes = estimatedMinutes % 60;

              const elevationValues =
                routeMode === "torean"
                  ? navigablePoints.map(
                      (point) => toreanTerrainElevations[point.id] ?? 0
                    )
                  : navigablePoints.map(
                      (point) => ("elevation" in point ? point.elevation : 0)
                    );

              const minElevation = Math.min(...elevationValues);
              const maxElevation = Math.max(...elevationValues);
              const elevationRange = Math.max(
                maxElevation - minElevation,
                1
              );

              const activeIndex = Math.max(currentIndex, 0);

              const elevationChartPoints = elevationValues
                .map((elevation, index) => {
                  const x =
                    elevationValues.length > 1
                      ? (index / (elevationValues.length - 1)) * 260
                      : 130;

                  const y =
                    72 -
                    ((elevation - minElevation) / elevationRange) * 56;

                  return `${x},${y}`;
                })
                .join(" ");

              const activeElevation =
                elevationValues[activeIndex] ?? minElevation;

              const activeElevationX =
                elevationValues.length > 1
                  ? (activeIndex / (elevationValues.length - 1)) * 260
                  : 130;

              const activeElevationY =
                72 -
                ((activeElevation - minElevation) / elevationRange) * 56;

            return (
              <div
                style={{
                  marginBottom: 18,
                  padding: 14,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: 1.6,
                      color: "#C89B3C",
                    }}
                  >
                    Trek Progress
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    {completedCheckpoints} / {totalCheckpoints}
                  </div>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: 6,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.1)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${progressPercent}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: "#FF5A36",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>

                  <div
                    style={{
                      marginTop: 16,
                      padding: "12px 10px 8px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9,
                          textTransform: "uppercase",
                          letterSpacing: 1.5,
                          color: "#C89B3C",
                        }}
                      >
                        Elevation Profile
                      </div>

                      <div
                        style={{
                          fontSize: 10,
                          color: "rgba(255,255,255,0.55)",
                        }}
                      >
                        {activeElevation.toLocaleString()} m
                      </div>
                    </div>

                    <svg
                      viewBox="0 0 260 82"
                      width="100%"
                      height="82"
                      role="img"
                      aria-label={`Elevation profile of ${routeMode === "senaru" ? "Senaru" : "Sembalun"} Trek`}
                    >
                      <line
                        x1="0"
                        y1="72"
                        x2="260"
                        y2="72"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="1"
                      />

                      <polyline
                        points={elevationChartPoints}
                        fill="none"
                        stroke="#C89B3C"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <circle
                        id="rinjani-elevation-marker"
                        cx={activeElevationX}
                        cy={activeElevationY}
                        r="5"
                        fill="#FF5A36"
                        stroke="#fff"
                        strokeWidth="2"
                      />
                    </svg>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 8,
                        color: "rgba(255,255,255,0.35)",
                      }}
                    >
                      <span>{navigablePoints[0].name}</span>
                      <span>{navigablePoints[navigablePoints.length - 1].name}</span>
                    </div>
                  </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    marginTop: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 9,
                        textTransform: "uppercase",
                        letterSpacing: 1.2,
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      Distance
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 15,
                        fontWeight: 600,
                      }}
                    >
                      {distanceKm.toFixed(2)} km
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 9,
                        textTransform: "uppercase",
                        letterSpacing: 1.2,
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      Est. Trek Time
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 15,
                        fontWeight: 600,
                      }}
                    >
                      {hours > 0 ? `${hours}h ` : ""}
                      {minutes > 0 ? `${minutes}m` : hours === 0 ? "—" : ""}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={{ fontSize: 14, lineHeight: 1.7 }}>
            Elevation:{" "}
            <strong>
              {'elevation' in selectedPoint && selectedPoint.elevation !== undefined ? selectedPoint.elevation.toLocaleString() + ' m' : '—'}
            </strong>
            <br />
            Latitude: {selectedPoint.latitude}
            <br />
            Longitude: {selectedPoint.longitude}
          </div>

          {(() => {
            const detail = activePointDetails[selectedPoint.id];

            if (!detail) return null;

            return (
<div
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {detail.photo && (
                  <div
                    style={{
                      marginBottom: 18,
                      overflow: "hidden",
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <img
                      src={detail.photo}
                      alt={selectedPoint.name}
                      style={{
                        display: "block",
                        width: "100%",
                        height: 180,
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: 1.5,
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      Distance
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 16,
                        fontWeight: 600,
                      }}
                    >
                      {detail.distanceFromPreviousKm !== null
                        ? `${detail.distanceFromPreviousKm.toFixed(2)} km`
                        : "Start"}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: 1.5,
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      Estimated Time
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 16,
                        fontWeight: 600,
                      }}
                    >
                      {detail.estimatedTimeMinutes !== null
                        ? `${Math.floor(detail.estimatedTimeMinutes / 60)}h ${
                            detail.estimatedTimeMinutes % 60
                          }m`
                        : "—"}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 18 }}>
                  <div
                    style={{
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: 1.8,
                      color: "#C89B3C",
                    }}
                  >
                    Terrain
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: "rgba(255,255,255,0.72)",
                    }}
                  >
                    {detail.terrain}
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: 1.8,
                      color: "#C89B3C",
                    }}
                  >
                    Vegetation
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: "rgba(255,255,255,0.72)",
                    }}
                  >
                    {detail.vegetation}
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: 1.8,
                      color: "#C89B3C",
                    }}
                  >
                    About This Point
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,0.68)",
                    }}
                  >
                    {detail.description}
                  </div>
                </div>
              </div>
            );
          })()}

          {(() => {
            const currentIndex = navigablePoints.findIndex(
              (point) => point.id === selectedPoint.id
            );

            const hasPrevious = currentIndex > 0;
            const hasNext =
              currentIndex >= 0 &&
              currentIndex < navigablePoints.length - 1;

            return (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <button
                  type="button"
                  disabled={!hasPrevious}
                  onClick={() => {
                    const markers = document.querySelectorAll<HTMLElement>(
                      ".rinjani-checkpoint-marker"
                    );

                    markers[currentIndex - 1]?.click();
                  }}
                  style={{
                    height: 44,
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: hasPrevious
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(255,255,255,0.02)",
                    color: hasPrevious
                      ? "#fff"
                      : "rgba(255,255,255,0.25)",
                    cursor: hasPrevious ? "pointer" : "not-allowed",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  ← Previous
                </button>

                <button
                  type="button"
                  disabled={!hasNext}
                  onClick={() => {
                    const markers = document.querySelectorAll<HTMLElement>(
                      ".rinjani-checkpoint-marker"
                    );

                    markers[currentIndex + 1]?.click();
                  }}
                  style={{
                    height: 44,
                    borderRadius: 12,
                    border: "1px solid rgba(200,155,60,0.35)",
                    background: hasNext
                      ? "rgba(200,155,60,0.12)"
                      : "rgba(255,255,255,0.02)",
                    color: hasNext
                      ? "#C89B3C"
                      : "rgba(255,255,255,0.25)",
                    cursor: hasNext ? "pointer" : "not-allowed",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Next →
                </button>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}












































