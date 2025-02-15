import axios from "axios";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Latitude and longitude are required." },
      { status: 400 }
    );
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_PLACES_API_KEY}`;

  try {
    const response = await axios.get(url);

    if (response.data.status === "OK") {
      const address = response.data.results[0]?.formatted_address;
      return NextResponse.json({ address: address || "Address not found" });
    } else {
      console.error("Geocoding error:", response.data.error_message);
      return NextResponse.json(
        { error: response.data.error_message || "Unable to retrieve address" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching address:", error);
    return NextResponse.json(
      { error: "Error fetching address" },
      { status: 500 }
    );
  }
};
