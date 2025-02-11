import { format, parseISO } from "date-fns";

export const formatDate = (
  dateString?: string,
  timeIncluded: boolean = false,
  onlytime: boolean = false
): string => {
  if (!dateString) {
    return "Not specified";
  }

  const date = new Date(dateString);

  // If only time is needed
  if (onlytime) {
    return format(date, "HH:mm");
  }

  // Default: format the date (day/month/year)
  const formattedDate = format(date, "dd/MM/yyyy");

  if (timeIncluded) {
    // If time is also included, format as day/month/year HH:mm
    const formattedTime = format(date, "HH:mm");
    return `${formattedDate} ${formattedTime}`;
  }

  return formattedDate;
};

export const formatTime = (dateString?: string): string => {
  if (!dateString) {
    return "Not specified";
  }

  const date = new Date(dateString);
  return format(date, "HH:mm a"); // Use "hh:mm a" for 12-hour format with AM/PM
};

export const formatLongDate = (date?: string, timeIncluded?: boolean) => {
  if (!date) {
    return "Not specified";
  }

  const parsedDate = parseISO(date);

  if (timeIncluded) {
    return format(parsedDate, "MMMM d, yyyy, hh:mm a");
  }

  return format(parsedDate, "MMMM d, yyyy");
};

export const formatDateToBackendISO = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export const strictFormatDate = (d: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export const isPassed = (dateString?: string): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date < new Date(); // Returns true if the date is in the past
};
