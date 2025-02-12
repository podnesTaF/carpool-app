import { Event } from "@/models/event";
import type { FeatureCollection } from "geojson";
import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import Map, { LngLatBoundsLike, MapRef, Marker } from "react-map-gl";
import supercluster, { ClusterFeature, PointFeature } from "supercluster";
import { expandBounds } from "../map/RidesMap";
import MapItem from "../mapItem/mapItem";
import AvatarList from "../other/AvatarList";
import EventMapList from "./EventMapList";

export interface EventClusterProps extends Event {
  cluster?: boolean;
  cluster_id?: number;
  point_count?: number;
  point_count_abbreviated?: string | number;
}

const EventsMap = ({ events }: { events?: Event[] }) => {
  const mapRef = useRef<MapRef>(null);
  const [zoom, setZoom] = useState(10);
  const [bounds, setBounds] = useState<any>(null);

  const points = useMemo<FeatureCollection | any>(() => {
    const features = events?.map((event) => ({
      type: "Feature" as const,
      properties: { ...event },
      geometry: {
        type: "Point" as const,
        coordinates: [event.longitude, event.latitude],
      },
    }));
    return { type: "FeatureCollection", features };
  }, [events]);

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

  const clusters = useMemo<
    Array<PointFeature<EventClusterProps> | ClusterFeature<EventClusterProps>>
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
          .map((l) => l.properties) as Event[];

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
              <AvatarList<Event>
                items={leafItems}
                size={40}
                background="white"
                getId={(r) => r.id}
                getImageUrl={(r) => r?.bannerUrl}
                getFallbackText={(r) => r?.title?.slice(0, 2)}
              />
            ) : (
              <EventMapList
                style={{
                  transform: `translate(0, -100%) scale(${scaleFactor})`,
                }}
                events={leafItems}
              />
            )}
          </Marker>
        );
      });

    const nonClusterPoints = clusters.filter(
      (feature) => !feature.properties.cluster
    );

    const groupedPoints = nonClusterPoints.reduce((acc, feature) => {
      const [longitude, latitude] = feature.geometry.coordinates;
      const key = `${Number(longitude.toFixed(zoom >= 12 ? 3 : 2))}-${Number(
        latitude.toFixed(zoom >= 12 ? 3 : 2)
      )}`;
      if (!acc[key]) {
        acc[key] = { features: [], longitude, latitude };
      }
      acc[key].features.push(feature);
      return acc;
    }, {} as Record<string, { features: Array<(typeof nonClusterPoints)[number]>; longitude: number; latitude: number }>);

    const eventMarkers = Object.values(groupedPoints).map((group) => {
      const eventsGroup = group.features.map((f) => f.properties) as Event[];
      if (group.features?.length === 1) {
        const event = eventsGroup[0];
        return (
          <Marker
            key={`event-${event.id}`}
            longitude={group.longitude}
            latitude={group.latitude}
            anchor="bottom"
          >
            {zoom >= 10 ? (
              <MapItem
                style={{
                  transform: `translate(0, -100%) scale(${scaleFactor})`,
                }}
                event={event}
              />
            ) : (
              <div
                onClick={() => relocateMap(event.longitude, event.latitude)}
                className="flex items-center justify-center bg-white rounded-full shadow-md border border-gray-300 w-12 h-12 cursor-pointer hover:scale-110 transition-transform"
              >
                <Image
                  src={event.bannerUrl}
                  alt={event.title}
                  width={50}
                  height={50}
                  className="rounded-full border-2 border-white w-12 h-12 object-cover shadow-md"
                />
              </div>
            )}
          </Marker>
        );
      } else {
        // If several events are at nearly the same location, render a grouped marker.
        return (
          <Marker
            key={`group-${group.longitude}-${group.latitude}`}
            longitude={group.longitude}
            latitude={group.latitude}
            anchor="bottom"
          >
            {zoom <= 10 ? (
              <div
                onClick={() => relocateMap(group.longitude, group.latitude)}
                className="flex items-center justify-center bg-white rounded-full shadow-md border border-gray-300 w-12 h-12 cursor-pointer hover:scale-110 transition-transform"
              >
                <span>{eventsGroup?.length}</span>
              </div>
            ) : (
              <EventMapList
                style={{
                  transform: `translate(0, -100%) scale(${scaleFactor})`,
                }}
                events={eventsGroup}
              />
            )}
          </Marker>
        );
      }
    });

    return [...clusterMarkers, ...eventMarkers];
  }, [clusters, expandCluster, zoom, relocateMap, clusterIndex, scaleFactor]);

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{
        longitude: 4.4112998,
        latitude: 51.228934,
        zoom: 10,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/standard"
      onZoom={(event) => setZoom(event.viewState.zoom)}
      onMoveEnd={onMapChange}
    >
      {events?.length && markers}
    </Map>
  );
};

export default EventsMap;
