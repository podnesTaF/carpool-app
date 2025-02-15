import { Prediction } from "@/models/location";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    // Extract the query parameters from the request URL
    const { searchParams } = new URL(req.url);
    const input = searchParams.get("input");
    if (!input) {
      return NextResponse.json(
        { error: "Missing required parameter: input" },
        { status: 400 }
      );
    }

    const limit = parseInt(searchParams.get("limit") || "5", 10);

    const request = {
      input: input,
      origin: { latitude: 50.8503, longitude: 4.3517 },
    };

    const response = await axios.post<{ suggestions: Prediction[] }>(
      `https://places.googleapis.com/v1/places:autocomplete`,
      request,
      {
        headers: {
          "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
          "Content-Type": "application/json",
          "X-Goog-FieldMask":
            "suggestions.placePrediction.place,suggestions.placePrediction.text.text",
        },
      }
    );

    const predictions = response.data.suggestions?.slice(0, limit);

    const detailedPredictions = await Promise.all(
      predictions.map(async (prediction) => {
        const { data } = await axios.get<{
          location: { latitude: number; longitude: number };
        }>(
          `https://places.googleapis.com/v1/${prediction.placePrediction.place}`,
          {
            params: {
              key: process.env.GOOGLE_PLACES_API_KEY,
            },
            headers: {
              "X-Goog-FieldMask": "location",
            },
          }
        );

        return {
          id: prediction.placePrediction.place,
          address: prediction.placePrediction.text.text,
          lng: data.location.longitude,
          lat: data.location.latitude,
        };
      })
    );

    // Forward the Google API response back to the client
    return NextResponse.json(detailedPredictions);
  } catch (error: any) {
    console.error("Error fetching Google Places data:", error.response);
    return NextResponse.json(
      { error: "Failed to fetch Google Places data" },
      { status: 500 }
    );
  }
};
