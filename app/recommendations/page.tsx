
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getDestinations,
  type Destination,
  type DestinationVibe,
} from "@/lib/destinations";
import { useTrip } from "@/app/context/TripContext";

const VIBES: DestinationVibe[] = [
  "Adventure",
  "Romantic",
  "Relaxation",
  "Nature",
  "Culture",
  "Family",
  "Beach",
  "Nightlife",
  "Wildlife",
  "History",
];

const BUDGETS = [
  { label: "₦20,000 – ₦50,000", value: 50000 },
  { label: "₦50,000 – ₦100,000", value: 100000 },
  { label: "₦100,000 – ₦200,000", value: 200000 },
  { label: "₦200,000 – ₦500,000", value: 500000 },
  { label: "₦500,000 and above", value: 1000000 },
];

interface DestinationImage {
  imageUrl: string;
  source?: string;
  license?: string;
}

const VALID_VIBES: DestinationVibe[] = [
  "Adventure",
  "Romantic",
  "Relaxation",
  "Nature",
  "Culture",
  "Family",
  "Beach",
  "Nightlife",
  "Wildlife",
  "History",
];

function normalizeVibe(value: string): DestinationVibe | null {
  const match = VALID_VIBES.find(
    (vibe) => vibe.toLowerCase() === value.trim().toLowerCase()
  );

  return match || null;
}

function inferVibes(destination: Destination): DestinationVibe[] {
  const text = [
    destination.name,
    destination.category,
    destination.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matches: DestinationVibe[] = [];

  if (/adventure|hiking|climb|rock|camp|zipline|trek/.test(text))
    matches.push("Adventure");

  if (/romantic|couple|honeymoon|romance/.test(text))
    matches.push("Romantic");

  if (/relax|resort|spa|retreat|peaceful|tranquil|garden/.test(text))
    matches.push("Relaxation");

  if (/nature|forest|waterfall|mountain|lake|river|wildlife|park/.test(text))
    matches.push("Nature");

  if (/culture|museum|heritage|historic|traditional|art|festival|palace/.test(text))
    matches.push("Culture");

  if (/family|children|kids|zoo|recreation/.test(text))
    matches.push("Family");

  if (/beach|coast|ocean|island|waterfront/.test(text))
    matches.push("Beach");

  if (/nightlife|club|bar|music|concert|entertainment/.test(text))
    matches.push("Nightlife");

  if (/wildlife|animal|elephant|safari|zoo/.test(text))
    matches.push("Wildlife");

  if (/history|historic|museum|ancient|heritage/.test(text))
    matches.push("History");

  return Array.from(new Set(matches));
}

function getDestinationVibes(
  destination: Destination
): DestinationVibe[] {
  const savedVibes = (destination.vibes || [])
    .map((vibe) => normalizeVibe(String(vibe)))
    .filter((vibe): vibe is DestinationVibe => vibe !== null);

  const categoryVibe = normalizeVibe(destination.category || "");

  const inferredVibes =
    savedVibes.length === 0 ? inferVibes(destination) : [];

  return Array.from(
    new Set([
      ...savedVibes,
      ...(categoryVibe ? [categoryVibe] : []),
      ...inferredVibes,
    ])
  );
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function RecommendationsPage() {
  const { addDestination } = useTrip();

  const [addedDestinationIds, setAddedDestinationIds] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [imageResults, setImageResults] = useState<
    Record<string, DestinationImage | null>
  >({});

  const requestedImages = useRef<Set<string>>(new Set());

  const [budget, setBudget] = useState("100000");
  const [selectedVibes, setSelectedVibes] = useState<DestinationVibe[]>([]);
  const [selectedState, setSelectedState] = useState("All");
  const [departure, setDeparture] = useState("");
  const [duration, setDuration] = useState("Weekend");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function loadDestinations() {
      try {
        setLoading(true);
        setError("");

        const data = await getDestinations();
        setDestinations(data);
      } catch (err) {
        console.error("Could not load recommendation destinations:", err);
        setError(
          "We could not load destinations right now. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDestinations();
  }, []);

  const states = useMemo(() => {
    return Array.from(
      new Set(
        destinations
          .map((destination) => destination.state?.trim())
          .filter((state): state is string => Boolean(state))
      )
    ).sort();
  }, [destinations]);

  const toggleVibe = (vibe: DestinationVibe) => {
    setSelectedVibes((current) =>
      current.includes(vibe)
        ? current.filter((item) => item !== vibe)
        : [...current, vibe]
    );
  };

  const recommendations = useMemo(() => {
    if (!hasSearched) return [];

    const maximumBudget = Number(budget);

    return destinations
      .map((destination) => {
        const rawCost = Number(destination.estimatedCost);
        const validCost = Number.isFinite(rawCost) && rawCost > 0;
        const cost = validCost ? rawCost : 0;

        const destinationVibes = getDestinationVibes(destination);

        const matchingVibes = selectedVibes.filter((vibe) =>
          destinationVibes.includes(vibe)
        );

        return {
          destination,
          cost,
          validCost,
          destinationVibes,
          matchingVibes,
        };
      })
      .filter((item) => {
        if (
          selectedState !== "All" &&
          item.destination.state?.trim().toLowerCase() !==
            selectedState.trim().toLowerCase()
        ) {
          return false;
        }

        if (
          selectedVibes.length > 0 &&
          item.matchingVibes.length === 0
        ) {
          return false;
        }

        if (item.validCost && item.cost > maximumBudget) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (b.matchingVibes.length !== a.matchingVibes.length) {
          return b.matchingVibes.length - a.matchingVibes.length;
        }

        if (a.validCost !== b.validCost) {
          return a.validCost ? -1 : 1;
        }

        if (a.validCost && b.validCost) {
          return a.cost - b.cost;
        }

        return a.destination.name.localeCompare(b.destination.name);
      });
  }, [destinations, budget, selectedVibes, selectedState, hasSearched]);

  useEffect(() => {
    if (!hasSearched || recommendations.length === 0) return;

    async function loadDestinationImages() {
      const placesWithoutImages = recommendations.filter((item) => {
        const id = item.destination.id;

        return (
          !item.destination.imageUrl &&
          !requestedImages.current.has(id)
        );
      });

      await Promise.all(
        placesWithoutImages.map(async (item) => {
          const place = item.destination;

          requestedImages.current.add(place.id);

          try {
            const params = new URLSearchParams({
              name: place.name,
              state: place.state,
            });

            const response = await fetch(
              `/api/destination-image?${params.toString()}`
            );

            if (!response.ok) {
              throw new Error("Image search failed.");
            }

            const data = await response.json();

            setImageResults((current) => ({
              ...current,
              [place.id]: data.imageUrl
                ? {
                    imageUrl: data.imageUrl,
                    source: data.source,
                    license: data.license,
                  }
                : null,
            }));
          } catch (err) {
            console.error(
              `Could not load photograph for ${place.name}:`,
              err
            );

            setImageResults((current) => ({
              ...current,
              [place.id]: null,
            }));
          }
        })
      );
    }

    loadDestinationImages();
  }, [hasSearched, recommendations]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedVibes.length === 0) {
      setError("Please select at least one travel category or vibe.");
      return;
    }

    setError("");
    setHasSearched(true);
  }

  function resetSearch() {
    setBudget("100000");
    setSelectedVibes([]);
    setSelectedState("All");
    setDeparture("");
    setDuration("Weekend");
    setHasSearched(false);
    setError("");
  }

  return (
    <main className="min-h-screen bg-[#f7f9f6]">
      {/* Intro hero */}
      <section className="relative overflow-hidden bg-[#102f24] px-4 py-16 text-white md:py-20">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1448375240586-882707db888b?w=1800&q=85')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#102f24]/95 via-[#102f24]/85 to-[#102f24]/60" />

        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-green-300">
              Your personal Nigerian travel advisor
            </p>

            <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
              Find Your Perfect
              <span className="block text-green-300">Getaway.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-green-50/90 md:text-lg">
              From breathtaking landscapes to cultural treasures,
              discover Nigerian destinations that fit your budget,
              interests and travel style.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-green-50">
              <span className="border-l-2 border-green-300 pl-3">
                Discover new places
              </span>
              <span className="border-l-2 border-green-300 pl-3">
                Explore local culture
              </span>
              <span className="border-l-2 border-green-300 pl-3">
                Plan your next adventure
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />
            <p className="text-gray-600">
              Loading Nigerian destinations...
            </p>
          </div>
        )}

        {/* Loading error */}
        {!loading && error && destinations.length === 0 && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {error}
            <button
              onClick={() => window.location.reload()}
              className="ml-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Recommendation form */}
        {!loading && destinations.length > 0 && (
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_12px_45px_rgba(0,0,0,0.045)] md:p-10"
          >
            <div className="mb-9">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
                Let's get started
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-gray-900 md:text-3xl">
                Tell us what you're looking for
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Personalise your search and let TripWise help you
                discover your next destination.
              </p>
            </div>

            {/* Budget */}
            <section className="mb-9">
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                1. What's your travel budget?
              </h3>

              <p className="mb-5 text-sm text-gray-500">
                Choose the maximum estimated destination cost you
                are comfortable with.
              </p>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {BUDGETS.map((item) => {
                  const selected = budget === String(item.value);

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setBudget(String(item.value))}
                      aria-pressed={selected}
                      className={`flex items-center justify-between rounded-xl border p-4 text-left text-sm font-semibold transition ${
                        selected
                          ? "border-green-700 bg-green-50 text-green-900 ring-2 ring-green-100"
                          : "border-gray-200 text-gray-700 hover:border-green-500 hover:bg-green-50/50"
                      }`}
                    >
                      {item.label}

                      <span
                        className={`ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                          selected
                            ? "border-green-700 bg-green-700 text-white"
                            : "border-gray-300 text-transparent"
                        }`}
                      >
                        {selected ? "✓" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="mb-9 border-t border-gray-100" />

            {/* Categories */}
            <section className="mb-9">
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                2. What kind of experience are you looking for?
              </h3>

              <p className="mb-5 text-sm text-gray-500">
                Choose as many categories or experiences as you like.
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {VIBES.map((vibe) => {
                  const selected = selectedVibes.includes(vibe);

                  return (
                    <button
                      key={vibe}
                      type="button"
                      onClick={() => toggleVibe(vibe)}
                      aria-pressed={selected}
                      className={`rounded-xl border px-3 py-4 text-center text-sm font-semibold transition ${
                        selected
                          ? "border-green-700 bg-green-50 text-green-800 ring-2 ring-green-100"
                          : "border-gray-200 bg-white text-gray-700 hover:border-green-500 hover:bg-green-50/50"
                      }`}
                    >
                      <span>{vibe}</span>
                      {selected && (
                        <span className="ml-2 text-green-700">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="mb-9 border-t border-gray-100" />

            {/* State */}
            <section className="mb-9">
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                3. Which state would you like to visit?
              </h3>

              <p className="mb-4 text-sm text-gray-500">
                Select a state or let TripWise search across Nigeria.
              </p>

              <select
                value={selectedState}
                onChange={(event) => setSelectedState(event.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 sm:max-w-md"
              >
                <option value="All">Anywhere in Nigeria</option>

                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </section>

            <div className="mb-9 border-t border-gray-100" />

            {/* Departure */}
            <section className="mb-9">
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                4. Where will you be travelling from?
              </h3>

              <p className="mb-4 text-sm text-gray-500">
                This helps us understand your starting location.
                Transport costs are not yet included in matching.
              </p>

              <input
                type="text"
                value={departure}
                onChange={(event) => setDeparture(event.target.value)}
                placeholder="e.g. Lagos, Abuja, Port Harcourt..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 sm:max-w-md"
              />
            </section>

            <div className="mb-9 border-t border-gray-100" />

            {/* Duration */}
            <section className="mb-8">
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                5. How long is your trip?
              </h3>

              <p className="mb-4 text-sm text-gray-500">
                Tell us how much time you have available.
              </p>

              <select
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 sm:max-w-md"
              >
                <option>Weekend</option>
                <option>3–5 days</option>
                <option>One week</option>
                <option>More than one week</option>
              </select>
            </section>

            {error && (
              <p className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-green-800 px-7 py-4 font-bold text-white shadow-lg shadow-green-900/10 transition hover:-translate-y-0.5 hover:bg-green-900 sm:w-auto"
            >
              Find My Perfect Destination
              <span className="ml-2">→</span>
            </button>
          </form>
        )}

        {/* Results */}
        {hasSearched && !loading && destinations.length > 0 && (
          <section className="mt-16">
            <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-green-700">
                  Your TripWise matches
                </p>

                <h2 className="text-3xl font-extrabold text-gray-900">
                  Destinations picked for you
                </h2>

                <p className="mt-3 text-sm text-gray-600">
                  {recommendations.length} matching destinations found
                  {selectedState !== "All" ? ` in ${selectedState}` : ""}
                  {departure.trim()
                    ? ` for your journey from ${departure.trim()}`
                    : ""}
                  .
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Matching: {selectedVibes.join(", ")}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Trip duration: {duration}
                </p>
              </div>

              <button
                type="button"
                onClick={resetSearch}
                className="rounded-xl border border-green-700 px-5 py-3 text-sm font-semibold text-green-800 transition hover:bg-green-50"
              >
                Change preferences
              </button>
            </div>

            {recommendations.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
                <h3 className="text-xl font-bold text-gray-900">
                  We couldn't find a match yet.
                </h3>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-gray-600">
                  Try increasing your budget, choosing another state,
                  or selecting different categories. You may also need
                  to add more destinations to Firestore.
                </p>
              </div>
            ) : (
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((item, index) => {
                  const place = item.destination;

                  const savedImage = place.imageUrl;
                  const searchedImage = imageResults[place.id];

                  const imageUrl =
                    savedImage || searchedImage?.imageUrl || null;

                  return (
                    <article
                      key={place.id}
                      className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      {/* Destination photograph */}
                      <div className="relative h-60 overflow-hidden bg-gradient-to-br from-green-100 to-green-200">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={`${place.name}, ${place.state}, Nigeria`}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center text-gray-500">
                            {searchedImage === undefined && !savedImage ? (
                              <>
                                <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-700" />
                                <span className="text-sm">
                                  Finding photograph...
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-3xl font-semibold text-green-800">
                                  {place.name.charAt(0)}
                                </span>
                                <span className="mt-2 text-sm">
                                  Photograph unavailable
                                </span>
                              </>
                            )}
                          </div>
                        )}

                        {index === 0 && (
                          <span className="absolute left-4 top-4 rounded-full bg-green-800 px-4 py-2 text-xs font-bold text-white shadow-md">
                            Best match
                          </span>
                        )}
                      </div>

                      <div className="p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                          {place.state}, Nigeria
                        </p>

                        <h3 className="mt-2 text-xl font-bold text-gray-900">
                          {place.name}
                        </h3>

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                          {place.description ||
                            "Discover this destination in Nigeria."}
                        </p>

                        {/* Cost */}
                        <div className="mt-5 border-t border-gray-100 pt-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Estimated destination cost
                          </p>

                          <p className="mt-2 text-xl font-extrabold text-green-800">
                            {item.validCost
                              ? formatNaira(item.cost)
                              : "Cost not yet available"}
                          </p>

                          {!item.validCost && (
                            <p className="mt-1 text-xs text-amber-700">
                              Please confirm the cost before travelling.
                            </p>
                          )}
                        </div>

                        {/* Categories */}
                        <div className="mt-5 flex flex-wrap gap-2">
                          {item.destinationVibes.map((vibe) => (
                            <span
                              key={vibe}
                              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                                item.matchingVibes.includes(vibe)
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {vibe}
                            </span>
                          ))}
                        </div>

                        <p className="mt-4 text-xs text-gray-500">
                          Matches {item.matchingVibes.length} of your
                          selected categories.
                        </p>

                        {/* Add to My Trip */}
                        <button
                          type="button"
                          onClick={() => {
                            addDestination({
                              id: place.id,
                              name: place.name,
                              state: place.state,
                              description: place.description,
                              imageUrl: imageUrl || undefined,
                              cost: item.validCost ? item.cost : 0,
                            });

                            setAddedDestinationIds((current) =>
                              current.includes(place.id)
                                ? current
                                : [...current, place.id]
                            );
                          }}
                          disabled={addedDestinationIds.includes(place.id)}
                          className={`mt-5 w-full rounded-xl px-4 py-3.5 text-sm font-bold transition ${
                            addedDestinationIds.includes(place.id)
                              ? "cursor-not-allowed bg-gray-100 text-gray-500"
                              : "bg-green-800 text-white hover:bg-green-900"
                          }`}
                        >
                          {addedDestinationIds.includes(place.id)
                            ? "✓ Added to My Trip"
                            : "+ Add to My Trip"}
                        </button>

                        {searchedImage?.source && (
                          <p className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-500">
                            Photo:{" "}
                            <a
                              href={searchedImage.source}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-green-700 underline"
                            >
                              Wikimedia Commons
                            </a>
                            {searchedImage.license
                              ? ` · ${searchedImage.license}`
                              : ""}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <p className="mt-12 text-center text-xs leading-6 text-gray-500">
          TripWise recommendations are based on destination information
          currently available in our database. Estimated costs may need
          verification before travelling. Photographs are retrieved
          from Wikimedia Commons where available.
        </p>
      </div>
    </main>
  );
}
