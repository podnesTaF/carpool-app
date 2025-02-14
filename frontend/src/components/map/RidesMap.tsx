"use client";

import { Event } from "@/models/event";
import { Ride } from "@/models/ride";
import type { FeatureCollection } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LngLatBoundsLike } from "react-map-gl";
import Map, { MapRef, Marker } from "react-map-gl";
import supercluster, { ClusterFeature, PointFeature } from "supercluster";
import MapItem from "../mapItem/mapItem";
import RidesList from "../mapItem/RidesList";
import RideUserItem from "../mapItem/RideUserItem";
import AvatarList from "../other/AvatarList";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface RidesMapProps {
  rides: Ride[];
  rideEvent?: Event;
}

export interface RideClusterProps extends Ride {
  cluster?: boolean;
  cluster_id?: number;
  point_count?: number;
  point_count_abbreviated?: string | number;
}

export const expandBounds = (
  bounds: LngLatBoundsLike,
  padding: number = 0.2
): LngLatBoundsLike => {
  // Destructure the bounds: [west, south, east, north]
  const [west, south, east, north] = bounds as any;
  const lngDelta = east - west;
  const latDelta = north - south;
  return [
    west - lngDelta * padding, // expand west
    south - latDelta * padding, // expand south
    east + lngDelta * padding, // expand east
    north + latDelta * padding, // expand north
  ];
};

const RidesMap = ({ rides, rideEvent }: RidesMapProps) => {
  const mapRef = useRef<MapRef>(null);

  const [zoom, setZoom] = useState(10);
  const [bounds, setBounds] = useState<any>(null);

  const points = useMemo<FeatureCollection>(() => {
    const features = rides?.map((ride) => {
      return {
        type: "Feature" as const,
        properties: {
          ...ride,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [ride.pickupLong, ride.pickupLat],
        },
      };
    });
    return {
      type: "FeatureCollection",
      features,
    };
  }, [rides]);

  const clusterIndex = useMemo(() => {
    return new supercluster({
      radius: 30,
      maxZoom: 11,
    }).load(points.features as any);
  }, [points]);

  const onMapChange = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) {
      const baseBounds = map.getBounds()?.toArray().flat() as LngLatBoundsLike;
      const paddedBounds = expandBounds(baseBounds, 1);
      setBounds(paddedBounds);
    }
  }, []);

  // Get the clusters or points for the current bounds & zoom
  const clusters = useMemo<
    Array<PointFeature<RideClusterProps> | ClusterFeature<RideClusterProps>>
  >(() => {
    if (!bounds) return [];
    return clusterIndex.getClusters(
      [bounds[0], bounds[1], bounds[2], bounds[3]],
      Math.floor(zoom)
    ) as any;
  }, [clusterIndex, bounds, zoom]);

  const relocateMap = useCallback((long: number, lat: number) => {
    mapRef.current?.setCenter({ lat: lat, lng: long });
    mapRef.current?.setZoom(12);
  }, []);

  const scaleFactor = useMemo(() => {
    const minZoom = 8;
    const maxZoom = 14;
    const minScale = 0.5;
    const maxScale = 1;

    const clampedZoom = Math.max(minZoom, Math.min(zoom, maxZoom));

    return (
      minScale +
      ((clampedZoom - minZoom) / (maxZoom - minZoom)) * (maxScale - minScale)
    );
  }, [zoom]);

  // Helper to zoom into cluster
  const expandCluster = useCallback(
    (clusterId: number) => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      const leaves = clusterIndex.getLeaves(clusterId, Infinity);

      // center around the average of cluster's children points
      if (leaves.length > 0) {
        const lngSum = leaves.reduce(
          (acc, f) => acc + f.geometry.coordinates[0],
          0
        );
        const latSum = leaves.reduce(
          (acc, f) => acc + f.geometry.coordinates[1],
          0
        );
        const lngAvg = lngSum / leaves.length;
        const latAvg = latSum / leaves.length;
        map.easeTo({
          center: [lngAvg, latAvg],
          zoom: zoom + 2,
          duration: 500,
        });
      }
    },
    [clusterIndex, zoom]
  );

  const markers = useMemo(() => {
    const clusterMarkers = clusters
      .filter((feature) => feature.properties.cluster)
      .map((clusterFeature) => {
        const [longitude, latitude] = clusterFeature.geometry.coordinates;
        const { cluster_id } = clusterFeature.properties;

        const leafItems = clusterIndex
          .getLeaves(cluster_id!, Infinity)
          .map((l) => l.properties) as Ride[];

        return (
          <Marker
            key={`cluster-${cluster_id}`}
            longitude={longitude}
            latitude={latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              expandCluster(cluster_id as number);
            }}
          >
            {zoom <= 10 ? (
              <AvatarList<Ride>
                items={leafItems}
                size={40}
                background="white"
                getId={(r) => r.id}
                getImageUrl={(r) => r.user?.avatarUrl}
                getFallbackText={(r) => r.user?.username?.slice(0, 2)}
              />
            ) : (
              <RidesList
                style={{
                  transform: `translate(0, -100%) scale(${scaleFactor})`,
                }}
                rides={leafItems}
              />
            )}
          </Marker>
        );
      });

    // 2. For unclustered rides, group them by rounded coordinates.
    const nonClusterPoints = clusters.filter(
      (feature) => !feature.properties.cluster
    );

    // Group by a key created from longitude and latitude rounded to 3 decimals.
    const groupedPoints = nonClusterPoints.reduce((acc, feature) => {
      const [longitude, latitude] = feature.geometry.coordinates;
      // Rounding to three decimals; use Number(...toFixed(3))
      const key = `${Number(longitude.toFixed(zoom >= 14 ? 3 : 2))}-${Number(
        latitude.toFixed(zoom >= 14 ? 3 : 2)
      )}`;
      if (!acc[key]) {
        acc[key] = { features: [], longitude, latitude };
      }
      acc[key].features.push(feature);
      return acc;
    }, {} as Record<string, { features: Array<(typeof nonClusterPoints)[number]>; longitude: number; latitude: number }>);

    // 3. Build markers for each grouped (non-cluster) ride or rides.
    const rideMarkers = Object.values(groupedPoints).map((group) => {
      const rides = group.features.map((f) => f.properties);
      if (group.features.length === 1) {
        const ride = group.features[0].properties;
        return (
          <Marker
            key={`ride-${rides[0].id}`}
            longitude={group.longitude}
            latitude={group.latitude}
            anchor="bottom"
          >
            {zoom >= 10 ? (
              <RideUserItem
                style={{
                  transform: `translate(0, -100%) scale(${scaleFactor})`,
                }}
                ride={rides[0]}
              />
            ) : (
              <div
                onClick={() => relocateMap(ride.pickupLong, ride.pickupLat)}
                className="flex items-center justify-center rounded-full shadow-md border border-gray-300 w-12 h-12 cursor-pointer hover:scale-110 transition-transform hover:z-20"
              >
                <Avatar className="rounded-full bg-none border-2 border-white w-12 h-12 object-cover shadow-md">
                  <AvatarImage src={ride.user.avatarUrl as string} />
                  <AvatarFallback
                    className={`${
                      ride.driver ? "bg-primary-orange" : "bg-secondary"
                    } text-white`}
                  >
                    {ride.user.username?.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </Marker>
        );
      } else {
        // If there are multiple rides at the same spot,
        // render a marker that displays the number of rides.
        return (
          <Marker
            key={`group-${group.longitude}-${group.latitude}`}
            longitude={group.longitude}
            latitude={group.latitude}
            anchor="bottom"
          >
            {zoom < 10 ? (
              <AvatarList<Ride>
                items={rides}
                size={40}
                background="white"
                getId={(r) => r.id}
                getImageUrl={(r) => r.user?.avatarUrl}
                getFallbackText={(r) => r.user?.username?.slice(0, 2)}
              />
            ) : (
              <RidesList
                style={{
                  transform: `translate(0, -100%) scale(${scaleFactor})`,
                }}
                rides={rides}
              />
            )}
          </Marker>
        );
      }
    });

    // 4. Combine both sets of markers and return them.
    return [...clusterMarkers, ...rideMarkers];
  }, [clusters, expandCluster, zoom, relocateMap, clusterIndex, scaleFactor]);

  // Re-center on the event location once
  useEffect(() => {
    if (rideEvent && mapRef.current) {
      mapRef.current?.setCenter({
        lat: rideEvent.latitude,
        lng: rideEvent.longitude,
      });
    }
  }, [rideEvent]);

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{
        longitude: rideEvent?.longitude ?? 4.475,
        latitude: rideEvent?.latitude ?? 51.228934,
        zoom: 10,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/standard"
      onZoom={(event) => setZoom(event.viewState.zoom)}
      onMoveEnd={onMapChange}
    >
      {markers}
      {rideEvent && (
        <Marker
          longitude={rideEvent.longitude}
          latitude={rideEvent.latitude}
          anchor="bottom"
        >
          {zoom < 8 ? (
            <div
              onClick={() =>
                relocateMap(rideEvent.longitude, rideEvent.latitude)
              }
              className="flex items-center justify-center bg-white rounded-full shadow-md border border-gray-300 w-12 h-12 cursor-pointer hover:scale-110 transition-transform"
            >
              <Image
                src={rideEvent.bannerUrl}
                alt={rideEvent.title}
                width={50}
                height={50}
                className="rounded-full border-2 border-white w-12 h-12 object-cover shadow-md"
              />
            </div>
          ) : (
            <MapItem
              style={{
                transform: `translate(0, -100%) scale(${scaleFactor})`,
              }}
              event={rideEvent}
            />
          )}
        </Marker>
      )}
    </Map>
  );
};

export default RidesMap;
