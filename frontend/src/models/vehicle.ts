export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  color: string;
  plate: string;
  maxPassengers: number;
  imgUrl: string;
  user?: string;
  _links?: Record<string, { href: string }>;
}
