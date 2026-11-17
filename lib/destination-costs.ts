
import type { Destination } from "@/lib/destinations";

export function normalizeDestinationName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(the|of|and)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function findDestinationCost(
  name: string,
  destinations: Destination[]
): number {
  const normalizedName = normalizeDestinationName(name);

  const match = destinations.find((destination) => {
    const candidate = normalizeDestinationName(destination.name);

    return (
      candidate === normalizedName ||
      candidate.includes(normalizedName) ||
      normalizedName.includes(candidate)
    );
  });

  const cost = Number(match?.estimatedCost);

  return Number.isFinite(cost) && cost > 0 ? cost : 0;
}
