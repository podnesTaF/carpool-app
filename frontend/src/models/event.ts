import { Ride } from "./ride";

export interface Event {
  id: number;
  title: string;
  description: string;
  startDateTime?: string; // ISO 8601 format
  endDateTime?: string; // ISO 8601 format
  address: string;
  registerDeadline?: string; // ISO 8601 format
  longitude: number;
  latitude: number;
  bannerUrl: string;
  archived: boolean;
  rides: Ride[];
  _links?: Record<string, { href: string }>;
}
