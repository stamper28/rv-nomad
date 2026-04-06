import { describe, it, expect } from "vitest";

describe("CollectAPI Gas Prices", () => {
  const API_KEY = process.env.COLLECTAPI_KEY;

  it("should have COLLECTAPI_KEY environment variable set", () => {
    expect(API_KEY).toBeDefined();
    expect(API_KEY).not.toBe("");
    expect(API_KEY!.startsWith("apikey ")).toBe(true);
  });

  it("should fetch USA gas prices for a state", async () => {
    const response = await fetch(
      "https://api.collectapi.com/gasPrice/stateUsaPrice?state=TX",
      {
        headers: {
          authorization: API_KEY!,
          "content-type": "application/json",
        },
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.result).toBeDefined();
    expect(data.result.state).toBeDefined();
    expect(data.result.state.gasoline).toBeDefined();
    expect(data.result.state.diesel).toBeDefined();
    expect(parseFloat(data.result.state.gasoline)).toBeGreaterThan(0);
    expect(parseFloat(data.result.state.diesel)).toBeGreaterThan(0);

    // Should also have city-level data
    expect(data.result.cities).toBeDefined();
    expect(data.result.cities.length).toBeGreaterThan(0);
    expect(data.result.cities[0].name).toBeDefined();
    expect(data.result.cities[0].gasoline).toBeDefined();
  }, 15000);

  it("should fetch Canada gas prices", async () => {
    const response = await fetch(
      "https://api.collectapi.com/gasPrice/canada",
      {
        headers: {
          authorization: API_KEY!,
          "content-type": "application/json",
        },
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.result).toBeDefined();
  }, 15000);
});
