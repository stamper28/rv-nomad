import { describe, it, expect } from "vitest";

describe("RIDB API Key", () => {
  it("should be set in environment", () => {
    const key = process.env.RIDB_API_KEY;
    expect(key).toBeDefined();
    expect(key!.length).toBeGreaterThan(10);
  });

  it("should authenticate with RIDB API", async () => {
    const key = process.env.RIDB_API_KEY;
    const res = await fetch("https://ridb.recreation.gov/api/v1/facilities?limit=1", {
      headers: { apikey: key! },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.RECDATA).toBeDefined();
    expect(data.RECDATA.length).toBe(1);
  });
});
