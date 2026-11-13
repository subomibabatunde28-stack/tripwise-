
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function DestinationDetails() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const name = searchParams.get("name") || "Nigerian Attraction";
  const description =
    searchParams.get("description") ||
    "Discover this beautiful destination in Nigeria.";
  const category = searchParams.get("category") || "Attraction";
  const location = searchParams.get("location") || "Nigeria";
  const image = searchParams.get("image") || "";
  const distance = searchParams.get("distance") || "";

  const [wikiDescription, setWikiDescription] = useState("");
  const [wikiUrl, setWikiUrl] = useState(
    `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(name)}`
  );

  const [loadingDescription, setLoadingDescription] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadWikipediaDescription() {
      setLoadingDescription(true);

      try {
        const title = name.trim().replace(/\s+/g, "_");

        const response = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
        );

        if (!response.ok) {
          if (active) setLoadingDescription(false);
          return;
        }

        const data = await response.json();

        if (
          active &&
          data.extract &&
          data.type !== "disambiguation" &&
          data.content_urls?.desktop?.page
        ) {
          setWikiDescription(data.extract);
          setWikiUrl(data.content_urls.desktop.page);
        }
      } catch (error) {
        console.error("Wikipedia description error:", error);
      } finally {
        if (active) setLoadingDescription(false);
      }
    }

    loadWikipediaDescription();

    return () => {
      active = false;
    };
  }, [name]);

  const cleanDescription = description
    .replace(/\s+/g, " ")
    .replace(/[,\s]+$/, "")
    .replace(/\s+([,.!?])/g, "$1");

  return (
    <main className="min-h-screen bg-[#FFF9EF]">
      <section className="bg-[#103B2C] px-6 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <button
            onClick={() => router.back()}
            className="mb-8 rounded-lg border border-white/30 px-5 py-2 text-sm hover:bg-white/10"
          >
            ← Back to destinations
          </button>

          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#D6A85F]">
            {category}
          </p>

          <h1 className="text-4xl font-bold md:text-6xl">{name}</h1>

          <p className="mt-4 text-white/75">📍 {location}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-[300px] w-full object-cover md:h-[500px]"
            />
          ) : (
            <div className="flex h-[300px] items-center justify-center bg-[#EAF0E7] text-[#103B2C] md:h-[400px]">
              Photograph unavailable
            </div>
          )}

          <div className="p-7 md:p-10">
            <h2 className="text-2xl font-bold text-[#103B2C]">
              About this destination
            </h2>

            <p className="mt-5 text-base leading-8 text-gray-600">
              {wikiDescription ||
                (loadingDescription
                  ? "Loading destination information..."
                  : cleanDescription)}
            </p>

            <div className="mt-6 rounded-2xl bg-[#F0F5ED] p-6">
              <h3 className="text-lg font-bold text-[#103B2C]">
                Discover more
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                Learn more about {name}, its attractions, history and what
                makes it worth visiting.
              </p>

              <a
                href={wikiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 font-semibold text-[#103B2C] hover:text-[#B8863B]"
              >
                Learn more on Wikipedia →
              </a>

              <p className="mt-3 text-xs text-gray-500">
                Additional information and references from Wikipedia.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[#F0F5ED] p-5">
                <p className="text-sm text-gray-500">Location</p>
                <p className="mt-2 font-bold text-[#103B2C]">{location}</p>
              </div>

              <div className="rounded-xl bg-[#F0F5ED] p-5">
                <p className="text-sm text-gray-500">Category</p>
                <p className="mt-2 font-bold text-[#103B2C]">{category}</p>
              </div>
            </div>

            {distance && (
              <p className="mt-6 text-sm text-gray-500">
                Distance: {distance} km
              </p>
            )}

            <button
              onClick={() => router.push("/my-trips")}
              className="mt-8 rounded-xl bg-[#103B2C] px-8 py-4 font-bold text-white transition hover:bg-[#18533D]"
            >
              Plan your trip →
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function DestinationDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FFF9EF] p-10 text-center text-[#103B2C]">
          Loading destination...
        </main>
      }
    >
      <DestinationDetails />
    </Suspense>
  );
}
