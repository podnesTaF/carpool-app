import { User } from "@/models/user"; // Import the UserDTO interface
import axios from "axios";

export const getAuth0AccessToken = async (): Promise<string> => {
  const response = await axios.get(
    `${
      process.env.NEXT_PUBLIC_API_URL
        ? process.env.NEXT_PUBLIC_API_URL
        : "http://localhost:8080"
    }/auth/management-token`,
    {}
  );
  return response.data.access_token;
};

export const updateAuth0User = async (
  userId: string,
  updatedUser: Partial<User>
): Promise<void> => {
  const accessToken = await getAuth0AccessToken();

  try {
    await axios.patch(
      `${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/api/v2/users/${userId}`,
      updatedUser,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error updating Auth0 user:", error);
    throw error;
  }
};

export const getAdminStatus = async (
  userId?: string
): Promise<[{ id: string; name: string; description: string }]> => {
  const accessToken = await getAuth0AccessToken();
  try {
    const roles = await axios.get<
      [{ id: string; name: string; description: string }]
    >(
      `${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/api/v2/users/${userId}/roles`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return roles.data;
  } catch (error) {
    console.error("Error updating Auth0 user:", error);
    throw error;
  }
};
