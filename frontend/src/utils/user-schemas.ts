import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";

const phoneNumberSchema = z
  .string()
  .refine(
    (phone) => {
      if (!phone || phone.trim() === "") return true;
      const normalizedPhone = phone.replace(/\s/g, "");
      const phoneNumber = parsePhoneNumberFromString(normalizedPhone);
      return phoneNumber?.isValid() ?? false;
    },
    {
      message:
        "Invalid phone number. Please use a valid international format, e.g. +32476032419.",
    }
  )
  .transform((phone) => {
    if (!phone || phone.trim() === "") return phone;
    const normalizedPhone = phone.replace(/\s/g, "");
    const phoneNumber = parsePhoneNumberFromString(normalizedPhone);
    return phoneNumber?.format("E.164") || phone;
  });

export const profileUpdateSchema = z.object({
  username: z.string().nonempty("Username cannot be empty"),
  phoneNumber: phoneNumberSchema,
  email: z.string().email("Invalid email address"),
  imageUrl: z.string().optional(),
  smoking: z.boolean(),
  seatingPreference: z.boolean(),
  talkative: z.boolean(),
  preferredGenreIds: z.array(z.number()).optional(),
  location: z.string().optional(),
});

export type ProfileUpdateSchema = z.infer<typeof profileUpdateSchema>;
