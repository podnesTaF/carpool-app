import { Ride } from "@/models/ride";

export const generateGoogleMapsRouteUrl = (carpool: Ride) => {
  if (!carpool) return "";

  const startPoint = `${carpool.pickupLat},${carpool.pickupLong}`;
  const waypoints = carpool.passengerRides
    ?.sort((a, b) => (a.pickupSequence || 0) - (b.pickupSequence || 0))
    .map((p) => `${p.pickupLat},${p.pickupLong}`)
    .join("|");
  const endPoint = `${carpool.event.latitude},${carpool.event.longitude}`;

  return `https://www.google.com/maps/dir/?api=1&origin=${startPoint}&destination=${endPoint}&waypoints=${waypoints}`;
};
