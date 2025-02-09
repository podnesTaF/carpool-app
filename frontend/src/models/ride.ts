import { Vehicle } from "./vehicle";
import { Event } from "./event";
import { User } from "./user";

export interface Ride {
  id: number;
  eventId: number;
  driver: boolean;
  userId: number;
  vehicleId?: number;
  pickupRadius?: number;
  pickupLong: number;
  pickupLat: number;
  pickupSequence?: number;
  startDateTime?: string; // ISO 8601 format
  driverId?: number;
  canBeDriver?: boolean;
  vehicle?: Vehicle;
  event: Event;
  driverRide?: Ride;
  registeredCount?: number;
  passengerRides?: Ride[];
  user: User;
  _links?: Record<string, { href: string }>;
}
