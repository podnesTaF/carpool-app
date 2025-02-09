export type RegisterForEventDto = {
  driver: boolean;
  canBeDriver: boolean;
  pickupLat: number;
  pickupLong?: number;
  pickupRadius?: number | null;
  vehicleId?: number | null;
};
