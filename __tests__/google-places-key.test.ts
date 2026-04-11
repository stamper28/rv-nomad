import { describe, it, expect } from "vitest";

describe("Google Places API Key Validation", () => {
  it("should have GOOGLE_PLACES_API_KEY set", () => {
    const key = process.env.GOOGLE_PLACES_API_KEY;
    expect(key).toBeTruthy();
    expect(key!.startsWith("AIza")).toBe(true);
  });

  it("should be able to call Google Places API with the key", async () => {
    const key = process.env.GOOGLE_PLACES_API_KEY;
    // Use the Text Search (New) endpoint with a simple query
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key!,
          "X-Goog-FieldMask": "places.displayName,places.id",
        },
        body: JSON.stringify({
          textQuery: "Yellowstone National Park campground",
          maxResultCount: 1,
        }),
      }
    );
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.places).toBeDefined();
    expect(data.places.length).toBeGreaterThan(0);
  }, 15000);
});
