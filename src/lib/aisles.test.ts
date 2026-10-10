import { describe, expect, it } from "vitest";
import { detectAisle } from "./aisles";
import { isoWeek, todayIndex } from "./week";

describe("detectAisle", () => {
  const cases: [string, string][] = [
    ["Tomater", "aisleFreshLabel"],
    ["kyllingebryst", "aisleMeatFishLabel"],
    ["Peanut butter", "aislePantryLabel"],
    ["butter", "aisleDairyLabel"],
    ["Coconut milk", "aislePantryLabel"],
    ["milk", "aisleDairyLabel"],
    ["Svinekotelet", "aisleMeatFishLabel"],
    ["sandwich bread", "aisleFreshLabel"],
    ["æg", "aisleDairyLabel"],
    ["Toiletpapir", "aisleHouseholdLabel"],
    ["Frosne ærter", "aisleFrozenLabel"],
    ["basmatiris", "aislePantryLabel"],
    ["te", "aisleDrinksSnacksLabel"],
    ["Hackfleisch", "aisleMeatFishLabel"],
    ["Crème fraîche", "aisleDairyLabel"],
    ["Pechuga de pollo", "aisleMeatFishLabel"],
    ["something odd", "aisleOtherLabel"],
  ];
  it.each(cases)("%s → %s", (name, aisle) => {
    expect(detectAisle(name)).toBe(aisle);
  });
});

describe("week helpers", () => {
  it("computes ISO weeks", () => {
    expect(isoWeek(new Date(2026, 9, 10))).toBe(41); // Sat 10 Oct 2026
    expect(isoWeek(new Date(2026, 0, 1))).toBe(1);   // Thu 1 Jan 2026
    expect(isoWeek(new Date(2027, 0, 1))).toBe(53);  // Fri 1 Jan 2027 is in 2026-W53
    expect(isoWeek(new Date(2024, 11, 30))).toBe(1); // Mon 30 Dec 2024 is 2025-W01
  });
  it("maps Monday to 0 and Sunday to 6", () => {
    expect(todayIndex(new Date(2026, 9, 12))).toBe(0);
    expect(todayIndex(new Date(2026, 9, 11))).toBe(6);
  });
});
