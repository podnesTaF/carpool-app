import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEventDate(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const optionsDate = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  } as const;
  const optionsTime = { hour: "2-digit", minute: "2-digit" } as const;

  const startDateFormatted = start.toLocaleDateString(undefined, optionsDate);
  const startTime = start.toLocaleTimeString(undefined, optionsTime);
  const endDateFormatted = end.toLocaleDateString(undefined, optionsDate);
  const endTime = end.toLocaleTimeString(undefined, optionsTime);

  if (startDateFormatted === endDateFormatted) {
    return `${startDateFormatted} ${startTime} - ${endTime}`;
  }

  return `${startDateFormatted} ${startTime} - ${endDateFormatted} ${endTime}`;
}
