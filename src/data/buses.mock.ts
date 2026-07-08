import type { Bus, BusAmenity, BusType } from "@/types/bus";

export const MOCK_BUSES: Bus[] = Array.from({ length: 40 }).map((_, i) => {
  const operators = ["op-upsrtc", "op-cityline", "op-heritage", "op-greenway", "op-sangam"];
  const opId = operators[i % operators.length];
  const busTypes: BusType[] = [
    "ac",
    "standard",
    "sleeper",
    "standard",
    "mini",
  ];
  const type = busTypes[i % busTypes.length];
  
  // Deterministic license plate numbers
  const districts = ["70", "32", "65", "78", "53"];
  const letters = ["AG", "BB", "CP", "XX", "YY"];
  const numStr = String(1000 + (i * 223) % 9000);
  const license = `UP ${districts[i % districts.length]} ${letters[i % letters.length]} ${numStr}`;
  
  const capacities = [22, 36, 40, 48];
  const cap = capacities[i % capacities.length];

  const amenities: BusAmenity[] = type === "ac" || type === "sleeper"
    ? ["ac", "women_friendly"]
    : type === "mini"
      ? ["mini"]
      : ["women_friendly"];

  return {
    id: `b-${String(i + 1).padStart(3, "0")}`,
    busNumber: license,
    operatorId: opId,
    totalSeats: cap,
    amenities,
    registrationNumber: license,
    busType: type,
    womenSeats: Math.round(cap * 0.15),
    standingCapacity: Math.round(cap * 0.25),
    features: ["CCTV", "First Aid", "Fire Extinguisher"],
  };
});
