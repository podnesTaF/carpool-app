import axios from "axios";

export interface Location {
  id: string;
  address: string;
  lat: number;
  lng: number;
}

export const getLocation = async (query: string) => {
  const response = await axios.get<Location[]>(
    `/api/location?input=${query}&limit=2`
  );

  return response.data;
};

export const convertIntoAddress = async ({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) => {
  const { data } = await axios.get<{ address: string }>(
    `/api/address?lat=${lat}&lng=${lng}`
  );
  return data;
};
