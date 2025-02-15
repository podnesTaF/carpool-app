import { z } from "zod";

export const vehicleCreateSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  color: z.string().min(1, "Color is required"),
  plate: z.string().min(1, "Number Plate is required"),
  maxPassengers: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Max Passengers must be greater than 0")
  ),
  imageUrl: z.string(),
});

export const vehicleEditSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  color: z.string().min(1, "Color is required"),
  plate: z.string().min(1, "Number Plate is required"),
  maxPassengers: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Max Passengers must be greater than 0")
  ),
  imageUrl: z
    .string()
    .min(1, "Seems like you forgot to save the uploaded image"),
});

export type VehicleCreateSchema = z.infer<typeof vehicleCreateSchema>;

export type VehicleEditSchema = z.infer<typeof vehicleEditSchema>;
