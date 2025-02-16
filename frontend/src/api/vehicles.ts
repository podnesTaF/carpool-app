import { Vehicle } from "@/models/vehicle";
import api from "./apiInstance";

export const createVehicle = async (vehicle: Partial<Vehicle>) => {
  try {
    const response = await api.post("/vehicles", {
      ...vehicle,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to create vehicle: ${error}`);
  }
};

export const getUserVehicles = async (userId: number | string) => {
  try {
    const { data } = await api.get<{ _embedded: { vehicles: Vehicle[] } }>(
      `/users/${userId}/vehicles`
    );
    return data._embedded.vehicles;
  } catch (error) {
    throw new Error(`Failed to fetch vehicles: ${error}`);
  }
};

export const deleteVehicle = async (vehicleId: number | string) => {
  try {
    await api.delete(`/vehicles/${vehicleId}`);
  } catch (error) {
    throw new Error(`Failed to delete vehicle: ${error}`);
  }
};

export const updateVehicle = async (
  vehicleId: number,
  vehicle: Partial<Vehicle>
) => {
  try {
    await api.put(`/vehicles/${vehicleId}`, vehicle);
  } catch (error) {
    throw new Error(`Failed to update vehicle: ${error}`);
  }
};
