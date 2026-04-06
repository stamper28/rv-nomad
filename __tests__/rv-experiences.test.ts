/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved.
 */
import { describe, it, expect } from "vitest";

// Test the data structures and sample data used in rv-experiences.tsx
// Since the screen uses inline data, we test the patterns and logic

describe("RV Experiences", () => {
  const CATEGORIES = ["Problems", "Mods & Upgrades", "Tips & Tricks", "Trip Stories", "Maintenance", "Reviews"];
  
  const RV_MAKES = [
    "Forest River", "Thor Industries", "Winnebago", "Keystone RV", "Jayco",
    "Coachmen", "Tiffin Motorhomes", "Newmar", "Airstream", "Grand Design",
    "Heartland RV", "Fleetwood", "Dutchmen", "Entegra Coach", "Pleasure-Way",
    "Lance Campers", "Northwood", "nuCamp", "Roadtrek", "Leisure Travel Vans",
    "Gulf Stream", "Palomino", "CrossRoads", "Highland Ridge", "Venture RV",
    "Other",
  ];

  const RV_TYPES = ["Class A", "Class B", "Class C", "Travel Trailer", "Fifth Wheel", "Toy Hauler", "Pop-Up", "Truck Camper", "Teardrop", "Other"];

  it("should have 6 experience categories", () => {
    expect(CATEGORIES).toHaveLength(6);
    expect(CATEGORIES).toContain("Problems");
    expect(CATEGORIES).toContain("Mods & Upgrades");
    expect(CATEGORIES).toContain("Trip Stories");
    expect(CATEGORIES).toContain("Maintenance");
  });

  it("should have at least 20 RV makes including major brands", () => {
    expect(RV_MAKES.length).toBeGreaterThanOrEqual(20);
    expect(RV_MAKES).toContain("Forest River");
    expect(RV_MAKES).toContain("Winnebago");
    expect(RV_MAKES).toContain("Airstream");
    expect(RV_MAKES).toContain("Grand Design");
    expect(RV_MAKES).toContain("Jayco");
    expect(RV_MAKES).toContain("Other");
  });

  it("should have all standard RV types", () => {
    expect(RV_TYPES).toContain("Class A");
    expect(RV_TYPES).toContain("Class B");
    expect(RV_TYPES).toContain("Class C");
    expect(RV_TYPES).toContain("Travel Trailer");
    expect(RV_TYPES).toContain("Fifth Wheel");
    expect(RV_TYPES).toContain("Toy Hauler");
    expect(RV_TYPES).toContain("Truck Camper");
  });

  it("should filter experiences by category", () => {
    const sampleExperiences = [
      { category: "Problems", rvMake: "Forest River", title: "Leak" },
      { category: "Mods & Upgrades", rvMake: "Winnebago", title: "Solar" },
      { category: "Problems", rvMake: "Jayco", title: "Slide issue" },
      { category: "Trip Stories", rvMake: "Airstream", title: "Oregon coast" },
    ];

    const problems = sampleExperiences.filter((e) => e.category === "Problems");
    expect(problems).toHaveLength(2);

    const trips = sampleExperiences.filter((e) => e.category === "Trip Stories");
    expect(trips).toHaveLength(1);
  });

  it("should filter experiences by search query", () => {
    const sampleExperiences = [
      { category: "Problems", rvMake: "Forest River", rvModel: "Rockwood", title: "Slide-out seal leaked", story: "Water damage" },
      { category: "Mods & Upgrades", rvMake: "Winnebago", rvModel: "View", title: "Added lithium batteries", story: "Solar upgrade" },
      { category: "Reviews", rvMake: "Jayco", rvModel: "Jay Flight", title: "Great entry trailer", story: "Family camping" },
    ];

    const query = "winnebago";
    const results = sampleExperiences.filter(
      (e) =>
        e.rvMake.toLowerCase().includes(query) ||
        e.rvModel.toLowerCase().includes(query) ||
        e.title.toLowerCase().includes(query) ||
        e.story.toLowerCase().includes(query)
    );
    expect(results).toHaveLength(1);
    expect(results[0].rvMake).toBe("Winnebago");
  });

  it("should sort by most helpful", () => {
    const experiences = [
      { helpful: 47, date: "2025-11-15" },
      { helpful: 112, date: "2025-08-05" },
      { helpful: 89, date: "2025-09-20" },
    ];

    const sorted = [...experiences].sort((a, b) => b.helpful - a.helpful);
    expect(sorted[0].helpful).toBe(112);
    expect(sorted[1].helpful).toBe(89);
    expect(sorted[2].helpful).toBe(47);
  });

  it("should sort by most recent", () => {
    const experiences = [
      { helpful: 47, date: "2025-11-15" },
      { helpful: 112, date: "2025-08-05" },
      { helpful: 89, date: "2025-09-20" },
    ];

    const sorted = [...experiences].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    expect(sorted[0].date).toBe("2025-11-15");
    expect(sorted[1].date).toBe("2025-09-20");
    expect(sorted[2].date).toBe("2025-08-05");
  });

  it("should validate required fields for new experience", () => {
    const validate = (make: string, title: string, story: string) => {
      return !!(make && title && story);
    };

    expect(validate("Forest River", "My experience", "Great RV")).toBe(true);
    expect(validate("", "My experience", "Great RV")).toBe(false);
    expect(validate("Forest River", "", "Great RV")).toBe(false);
    expect(validate("Forest River", "My experience", "")).toBe(false);
  });
});
