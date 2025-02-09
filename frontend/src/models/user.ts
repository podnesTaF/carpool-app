import { Genre } from "./genre";

export interface User {
  id: string;
  name: string;
  email: string;
  auth0Sub: string;
  username: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  smoking: boolean;
  talkative: boolean;
  seatingPreference: boolean;
  preferredGenres: Genre[];
  phone_number?: string;
  _links?: Record<string, { href: string }>;
  //user_metadata?: {
  //  username?: string;
  //  phone_number?: string;
  //  is_smoking?: boolean;
  //  talkative?: boolean;
  //  address?: string;
  //};
}
