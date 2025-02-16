import axios from "axios";

export interface TokenResponse {
  token?: string;
}

export const getToken = async () => {
  const response = await axios.get<TokenResponse>(`/auth/access-token`);

  return response.data;
};
