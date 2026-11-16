
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getDestinations } from "@/lib/destinations";
import { useTrip } from "@/app/context/TripContext";

interface Attraction {
  id: string;
  name: string;
  description?: string;
  category?: string;
  location?: string;
  state?: string;
  distance?: number;
  imageUrl?: string;
  imageUrls?: string;
  estimatedCost?: number;
}

interface DiscoveryResponse {
  location?: string;
  total?: number;
  destinations?: Attraction[];
  inLocation?: Attraction[];
  nearby?: Attraction[];
  unlocated?: Attraction[];
  outsideRange?: Attraction[];
}

interface WikipediaSummary {
  type?: string;
  thumbnail?: {
    source?: string;
  };
}

const CATEGORIES = [
  "All",
  "Nature",
  "History",
  "Beach",
  "Culture",
  "Wildlife",
];

const normalizeDestinationName = (name: string) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]/g, "");

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDestinationCategory(place: Attraction): string {
  const existingCategory = place.category?.trim().toLowerCase();

  const knownCategories = [
    "nature",
    "history",
    "beach",
    "culture",
    "wildlife",
  ];

  if (existingCategory && knownCategories.includes(existingCategory)) {
    return existingCategory.charAt(0).toUpperCase() + existingCategory.slice(1);
  }

  const name = place.name.toLowerCase();
  const description = (place.description || "").toLowerCase();
  const text = `${name} ${description}`;

  if (/gberefu|slave route|point of no return|slave trade|slave history/.test(text)) {
    return "History";
  }

  if (/zoo|wildlife|animal|safari|game reserve|national park/.test(text)) {
    return "Wildlife";
  }

  if (/beach|coast|shoreline|seaside|waterfront/.test(text)) {
    return "Beach";
  }

  if (/museum|monument|heritage|historic|history|palace|castle|ancient|memorial/.test(text)) {
    return "History";
  }

  if (/festival|traditional|cultural|culture|art gallery|craft|shrine|heritage site/.test(text)) {
    return "Culture";
  }

  if (/waterfall|falls|forest|garden|mountain|hill|rock|spring|lake|cave|river|valley|landscape|nature/.test(text)) {
    return "Nature";
  }

  return "";
}

const SPECIAL_IMAGE_OVERRIDES: Record<string, string | null> = {
  ijedespring:
    "https://i0.wp.com/www.theimpactnewspaper.com/wp-content/uploads/2021/04/IMG_1528-scaled.jpg?fit=2560%2C1920&ssl=1",
  binafootprint:
    "https://www.nigeriagalleria.com/Nigeria/States_Nigeria/Niger/Images/Bina-Footprints-Niger.jpeg",
  tangalepeakhill:
    "https://celebrityplatform.wordpress.com/wp-content/uploads/2019/07/img_20190602_165319.jpg",
  killanghill:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Kilang_Hill.jpg",
  kilanghill:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Kilang_Hill.jpg",
  pankilanghill:
    "https://celebrityplatform.wordpress.com/wp-content/uploads/2019/07/img_20190602_165319.jpg",
};

// Alternative names for matching existing destination records.
const DESTINATION_ALIASES: Record<string, string[]> = {
  joswildlifepark: ["joszoo"],
  joszoo: ["joswildlifepark"],
};

export default function RecommendationsPage() {
  const { days, addDestination } = useTrip();

  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [activeLocation, setActiveLocation] = useState("Nigeria");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function discoverAttractions(location = "") {
    setLoading(true);
    setError("");
    setImageUrls({});
    setFailedImages([]);

    try {
      const url = location
        ? `/api/discover?location=${encodeURIComponent(location)}`
        : "/api/discover";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Unable to discover attractions. Please try again.");
      }

      const data: DiscoveryResponse = await response.json();

      const results =
        data.destinations ??
        [
          ...(data.inLocation ?? []),
          ...(data.nearby ?? []),
          ...(data.unlocated ?? []),
          ...(data.outsideRange ?? []),
        ];

      const uniqueResults = Array.from(
        new Map(
          results.map((place) => [
            place.id || place.name.toLowerCase(),
            place,
          ])
        ).values()
      );

      let enrichedResults = uniqueResults;

      try {
        const firebaseDestinations = await getDestinations();

        enrichedResults = uniqueResults.map((place) => {
          const key = normalizeDestinationName(place.name);

          const possibleNames = [
            key,
            ...(DESTINATION_ALIASES[key] || []),
          ];

          const matchingDestination = firebaseDestinations.find(
            (destination) => {
              const destinationKey = normalizeDestinationName(destination.name);

              return (
                possibleNames.includes(destinationKey) ||
                (DESTINATION_ALIASES[destinationKey] || []).includes(key)
              );
            }
          );

          const rawEstimatedCost = Number(
            matchingDestination?.estimatedCost
          );

          const hasSpecialOverride =
            Object.prototype.hasOwnProperty.call(
              SPECIAL_IMAGE_OVERRIDES,
              key
            );

          return {
            ...place,
            imageUrl: hasSpecialOverride
              ? SPECIAL_IMAGE_OVERRIDES[key] || ""
              : matchingDestination?.imageUrl || "",
            estimatedCost:
              Number.isFinite(rawEstimatedCost) && rawEstimatedCost > 0
                ? rawEstimatedCost
                : 0,
          };
        });
      } catch (firebaseError) {
        console.error(
          "Could not load destination cost information:",
          firebaseError
        );
      }

      setAttractions(enrichedResults);

      setFailedImages(
        enrichedResults
          .filter((place) => {
            const key = normalizeDestinationName(place.name);

            return (
              Object.prototype.hasOwnProperty.call(
                SPECIAL_IMAGE_OVERRIDES,
                key
              ) && !SPECIAL_IMAGE_OVERRIDES[key]
            );
          })
          .map((place) => place.id)
      );

      setActiveLocation(data.location || location || "Nigeria");
    } catch (err) {
      console.error("Discovery error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    discoverAttractions();
  }, []);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const location = search.trim();

    setCategory("All");
    discoverAttractions(location);
  }

  const filteredAttractions = useMemo(() => {
    return attractions.filter((place) => {
      if (category === "All") return true;
      return getDestinationCategory(place) === category;
    });
  }, [attractions, category]);

  useEffect(() => {
    if (attractions.length === 0) return;

    let cancelled = false;

    async function loadImages() {
      const placesWithoutImages = attractions.filter((place) => {
        const key = normalizeDestinationName(place.name);

        const hasSpecialOverride =
          Object.prototype.hasOwnProperty.call(
            SPECIAL_IMAGE_OVERRIDES,
            key
          );

        return !place.imageUrl && !hasSpecialOverride;
      });

      for (let i = 0; i < placesWithoutImages.length; i += 5) {
        const batch = placesWithoutImages.slice(i, i + 5);

        const results = await Promise.all(
          batch.map(async (place) => {
            try {
              const title = encodeURIComponent(
                place.name.trim().replaceAll(" ", "_")
              );

              const wikipediaResponse = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`
              );

              if (wikipediaResponse.ok) {
                const wikipediaData: WikipediaSummary =
                  await wikipediaResponse.json();

                if (
                  wikipediaData.type !== "disambiguation" &&
                  wikipediaData.thumbnail?.source
                ) {
                  return {
                    id: place.id,
                    image: wikipediaData.thumbnail.source,
                  };
                }
              }

              const commonsResponse = await fetch(
                `/api/destination-image?name=${encodeURIComponent(
                  place.name
                )}&state=${encodeURIComponent(
                  place.state || place.location || ""
                )}`
              );

              if (commonsResponse.ok) {
                const commonsData = await commonsResponse.json();

                if (commonsData.imageUrl) {
                  return {
                    id: place.id,
                    image: commonsData.imageUrl,
                  };
                }
              }

              return { id: place.id, image: null };
            } catch (err) {
              console.error(`Could not load image for ${place.name}:`, err);
              return { id: place.id, image: null };
            }
          })
        );

        if (cancelled) return;

        const successfulImages: Record<string, string> = {};
        const unavailableImages: string[] = [];

        results.forEach((result) => {
          if (result.image) {
            successfulImages[result.id] = result.image;
          } else {
            unavailableImages.push(result.id);
          }
        });

        setImageUrls((current) => ({
          ...current,
          ...successfulImages,
        }));

        setFailedImages((current) => [
          ...new Set([...current, ...unavailableImages]),
        ]);
      }
    }

    loadImages();

    return () => {
      cancelled = true;
    };
  }, [attractions]);

  return (
    <main className="min-h-screen bg-[#FFF9EF]">
      <section className="relative overflow-hidden bg-[#103B2C] px-6 py-20 text-white md:py-28">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#D6A85F]/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <span className="mb-5 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#E7C58D]">
              Your Nigerian travel guide
            </span>

            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Discover Nigeria.
              <br />
              <span className="text-[#D6A85F]">Experience More.</span>
            </h1>

            <p className="max-w-2xl text-base leading-8 text-white/75 md:text-lg">
              From breathtaking landscapes to historic landmarks and hidden
              cultural gems, discover extraordinary places waiting to be
              explored across Nigeria.
            </p>

            <div className="mt-9 flex flex-wrap gap-4 text-sm text-white/80">
              <span>Explore new places</span>
              <span className="text-[#D6A85F]">•</span>
              <span>Discover local culture</span>
              <span className="text-[#D6A85F]">•</span>
              <span>Plan your next adventure</span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xl md:p-7">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#103B2C]">
              Where would you like to explore?
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Search for tourist attractions by state or city.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Try Lagos, Kano, Kaduna, Cross River..."
                className="w-full rounded-xl border border-gray-200 bg-[#FFF9EF] py-4 pl-12 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#103B2C] focus:ring-2 focus:ring-green-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#103B2C] px-9 py-4 text-sm font-semibold text-white transition hover:bg-[#18533D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Search destinations
            </button>
          </form>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
                discoverAttractions();
              }}
              disabled={loading}
              className="text-sm font-semibold text-[#236344] transition hover:text-[#103B2C] disabled:opacity-50"
            >
              Explore all Nigeria
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#B48642]">
              Find your next adventure
            </p>

            <h2 className="text-3xl font-bold text-[#103B2C] md:text-4xl">
              {activeLocation === "Nigeria"
                ? "Explore Popular Places"
                : `Discover ${activeLocation}`}
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-gray-500">
              Discover remarkable attractions, beautiful scenery and
              memorable experiences across Nigeria.
            </p>
          </div>

          <div className="rounded-xl bg-[#F0F5ED] px-5 py-3">
            <p className="text-sm font-semibold text-[#103B2C]">
              {loading
                ? "Finding destinations..."
                : `${filteredAttractions.length} places found`}
            </p>
          </div>
        </div>

        <div className="mb-10">
          <p className="mb-4 text-sm font-semibold text-gray-700">
            Explore by interest
          </p>

          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                  category === item
                    ? "bg-[#103B2C] text-white shadow-md"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-[#103B2C] hover:text-[#103B2C]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl bg-white py-24 text-center shadow-sm">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#E5EDE4] border-t-[#103B2C]" />
            <h3 className="text-lg font-bold text-[#103B2C]">
              Finding beautiful places...
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Please wait while we explore destinations across Nigeria.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-white p-10 text-center shadow-sm">
            <h3 className="mb-3 text-xl font-bold text-gray-900">
              We couldn't load the destinations
            </h3>
            <p className="mb-6 text-sm text-gray-500">{error}</p>
            <button
              onClick={() => discoverAttractions()}
              className="rounded-xl bg-[#103B2C] px-7 py-3 font-semibold text-white transition hover:bg-[#18533D]"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredAttractions.length > 0 && (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAttractions.map((place) => {
              const imageSource = place.imageUrl || imageUrls[place.id];
              const hasImage = Boolean(imageSource);
              const imageFailed = failedImages.includes(place.id);

              const placeLocation =
                place.state || place.location || activeLocation;

              const displayCategory = getDestinationCategory(place);

              const isAdded = days.some((day) =>
                day.activities.some(
                  (activity) => activity.destinationId === place.id
                )
              );

              const hasCost =
                typeof place.estimatedCost === "number" &&
                Number.isFinite(place.estimatedCost) &&
                place.estimatedCost > 0;

              return (
                <article
                  key={place.id}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="relative h-60 overflow-hidden bg-[#EAF0E7]">
                    {hasImage && !imageFailed ? (
                      <img
                        src={imageSource}
                        alt={place.name}
                        loading="lazy"
                        onError={() =>
                          setFailedImages((current) =>
                            current.includes(place.id)
                              ? current
                              : [...current, place.id]
                          )
                        }
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EAF0E7] to-[#D5E3D2]">
                        <div className="text-center text-[#103B2C]">
                          <span className="text-4xl">📍</span>
                          <p className="mt-3 text-sm font-medium">
                            {imageFailed
                              ? "Photograph unavailable"
                              : "Finding photograph..."}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70" />

                    {displayCategory && (
                      <span className="absolute bottom-4 left-4 rounded-full border border-white/30 bg-black/30 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
                        {displayCategory}
                      </span>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="mb-3 flex items-center gap-2 text-xs font-medium text-[#7A8B7E]">
                      <span className="text-[#B48642]">📍</span>
                      <span>{placeLocation}</span>
                    </div>

                    <h3 className="mb-3 text-xl font-bold text-[#103B2C] transition group-hover:text-[#B48642]">
                      {place.name}
                    </h3>

                    <p className="mb-5 line-clamp-3 text-sm leading-7 text-gray-500">
                      {place.description ||
                        `Discover ${place.name}, a place worth exploring in Nigeria.`}
                    </p>

                    

                    {typeof place.distance === "number" && (
                      <p className="mb-4 text-xs font-medium text-gray-400">
                        Approximately {place.distance.toFixed(1)} km away
                      </p>
                    )}

                    <div className="space-y-3 border-t border-gray-100 pt-5">
                      {isAdded ? (
                        <Link
                          href="/my-trips"
                          className="flex w-full items-center justify-center rounded-xl border border-[#103B2C] bg-[#F0F5ED] px-5 py-3.5 text-sm font-bold text-[#103B2C] transition hover:bg-[#E2EDE0]"
                        >
                          View in My Trips
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            addDestination({
                              id: place.id,
                              name: place.name,
                              state:
                                place.state ||
                                place.location ||
                                activeLocation,
                              description: place.description || "",
                              imageUrl: imageSource || "",
                              cost: hasCost ? place.estimatedCost! : 0,
                            })
                          }
                          className="w-full rounded-xl bg-[#D6A85F] px-5 py-3.5 text-sm font-bold text-[#103B2C] transition hover:bg-[#E7C58D]"
                        >
                          Add to My Trip
                        </button>
                      )}

                      <Link
                        href={{
                          pathname: `/recommendations/${encodeURIComponent(
                            place.id
                          )}`,
                          query: {
                            name: place.name,
                            description: place.description || "",
                            category: displayCategory,
                            location: placeLocation,
                            image: imageSource || "",
                            distance: place.distance?.toString() || "",
                          },
                        }}
                        className="flex w-full items-center justify-between rounded-xl bg-[#F0F5ED] px-5 py-3.5 text-sm font-bold text-[#103B2C] transition hover:bg-[#103B2C] hover:text-white"
                      >
                        <span>Destination details</span>
                        <span className="text-lg transition group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && !error && filteredAttractions.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#F0F5ED] text-3xl">
              📍
            </div>

            <h3 className="mb-3 text-2xl font-bold text-[#103B2C]">
              No destinations found
            </h3>

            <p className="mx-auto mb-7 max-w-md text-sm leading-7 text-gray-500">
              We couldn't find destinations matching your selection. Try
              another state or category, or explore all of Nigeria.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
                discoverAttractions();
              }}
              className="rounded-xl bg-[#103B2C] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#18533D]"
            >
              Explore all Nigeria
            </button>
          </div>
        )}
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#103B2C] px-8 py-12 text-center md:px-16 md:py-16">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#D6A85F]">
            Your journey starts here
          </p>

          <h2 className="mb-5 text-3xl font-bold text-white md:text-4xl">
            Nigeria has more to offer.
            <br />
            Go out and discover it.
          </h2>

          <p className="mx-auto max-w-2xl text-sm leading-7 text-white/70">
            Find a destination that matches your interests, discover new
            experiences and start planning your next Nigerian adventure.
          </p>

          <Link
            href="/my-trips"
            className="mt-8 inline-flex rounded-xl bg-[#D6A85F] px-8 py-4 text-sm font-bold text-[#103B2C] transition hover:bg-[#E7C58D]"
          >
            Plan your trip
          </Link>
        </div>
      </section>
    </main>
  );
}
