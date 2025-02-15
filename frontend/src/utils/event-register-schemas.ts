import { z } from "zod";
import { strictFormatDate } from "./time-helpers";

export const eventRegisterSchema = z
  .object({
    pickupLong: z.number(),
    pickupLat: z.number(),
    canBeDriver: z.boolean().optional(),
    registrationType: z.string(),
    vehicleId: z.number().optional(),
    pickupRadius: z.string().optional(),
  })
  .refine(
    (data) =>
      !(data.canBeDriver || data.registrationType === "driver") ||
      data.vehicleId,
    {
      message:
        "Vehicle ID and Pickup Radius are required when registering as a driver.",
      path: ["vehicleId", "pickupRadius"],
    }
  );

export type EventRegisterSchema = z.infer<typeof eventRegisterSchema>;

export const eventCreationSchema = z
  .object({
    title: z
      .string()
      .min(1, { message: "Title is required" })
      .max(2000, { message: "Title must not exceed 2000 characters" }),
    description: z.string().min(1, { message: "Description is required" }),
    startDateTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid start date",
    }),
    endDateTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid end date",
    }),
    address: z.string().min(1, { message: "Address is required" }),
    longitude: z.number({
      invalid_type_error: "Longitude must be a number",
    }),
    latitude: z.number({
      invalid_type_error: "Latitude must be a number",
    }),
    bannerUrl: z.string().url({ message: "Invalid banner URL" }),
    registerDeadline: z.string().optional(),
    archived: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDateTime);
      return start.getTime() > Date.now();
    },
    {
      message: "Start date must be in the future",
      path: ["startDateTime"],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.startDateTime);
      const end = new Date(data.endDateTime);
      return end.getTime() > start.getTime();
    },
    {
      message: "End date must be after start date",
      path: ["endDateTime"],
    }
  )
  .transform((data) => {
    const start = new Date(data.startDateTime);
    const end = new Date(data.endDateTime);
    const registerDeadline = new Date(start.getTime() - 24 * 60 * 60 * 1000);

    return {
      ...data,
      startDateTime: strictFormatDate(start),
      endDateTime: strictFormatDate(end),
      registerDeadline: strictFormatDate(registerDeadline),
    };
  });

export type EventCreationSchema = z.infer<typeof eventCreationSchema>;
