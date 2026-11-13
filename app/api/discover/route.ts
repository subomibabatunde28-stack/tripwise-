
import { getDestinations } from "@/lib/destinations";
import { NextResponse } from "next/server";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi",
  "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
  "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
  "Federal Capital Territory",
];

const CITY_STATES: Record<string, string> = {
  ibadan: "Oyo",
  abeokuta: "Ogun",
  ikeja: "Lagos",
  lekki: "Lagos",
  badagry: "Lagos",
  lagos: "Lagos",
  kano: "Kano",
  kaduna: "Kaduna",
  jos: "Plateau",
  calabar: "Cross River",
  uyo: "Akwa Ibom",
  enugu: "Enugu",
  owerri: "Imo",
  benin: "Edo",
  "benin city": "Edo",
  akure: "Ondo",
  osogbo: "Osun",
  ilorin: "Kwara",
  lokoja: "Kogi",
  makurdi: "Benue",
  bauchi: "Bauchi",
  maiduguri: "Borno",
  yola: "Adamawa",
  sokoto: "Sokoto",
  abuja: "Federal Capital Territory",
  "port harcourt": "Rivers",
  minna: "Niger",
  damaturu: "Yobe",
  "birnin kebbi": "Kebbi",
  "ado ekiti": "Ekiti",
  onitsha: "Anambra",
  awka: "Anambra",
  umuahia: "Abia",
  asaba: "Delta",
  yenagoa: "Bayelsa",
};

const KNOWN_ATTRACTIONS: Record<string, string> = {
  "yankari game reserve": "Bauchi",
  "olumo rock": "Ogun",
  "jos wildlife park": "Plateau",
  "farin ruwa falls": "Nasarawa",
  "tarkwa bay": "Lagos",
  "marina resort": "Cross River",
  "obudu mountain resort": "Cross River",
  "awhum waterfall": "Enugu",
  "awu waterfall": "Enugu",
  "bina footprint": "Niger",
  "erin-ijesha waterfalls": "Osun",
  "erin-ijesha waterfall": "Osun",
  "agodi gardens": "Oyo",
  "national museum of unity": "Oyo",
  "trans wonderland": "Oyo",
  "old oyo national park": "Oyo",
  "hi-impact planet": "Ogun",
  "ikogosi warm springs": "Ekiti",
  "okomu forest reserve": "Edo",
  "nike art gallery": "Lagos",
  "lekki conservation centre": "Lagos",
  "lekki conservation center": "Lagos",
  "yankari national park": "Bauchi",
  "kainji national park": "Niger",
  "gashaka-gumti national park": "Taraba",
  "cross river national park": "Cross River",
  "kamuku national park": "Kaduna",
  "matsirga waterfall": "Kaduna",
  "gurara falls": "Niger",
  "zuma rock": "Niger",
  "aso rock": "Federal Capital Territory",
  "millennium park": "Federal Capital Territory",
  "tinapa resort": "Cross River",
  "ngwo pine forest": "Enugu",
  "agbokim waterfalls": "Cross River",
  "owu waterfalls": "Kwara",
  "freedom park": "Lagos",
  "tinubu square": "Lagos",
  "iga idunganran": "Lagos",
  "gberefu island": "Lagos",
  "lufasi park": "Lagos",
  "ikorodu cultural heritage trail": "Lagos",
  "nigerian national museum": "Lagos",
  "cathedral church of christ": "Lagos",
  "welcome to lagos": "Lagos",
  "city hall, lagos": "Lagos",
};

type WikipediaResult = {
  pageid: number;
  title: string;
  snippet?: string;
};

function cleanSnippet(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Keep complete sentences instead of displaying cut-off text.
function makeReadableDescription(value: string): string {
  const cleaned = cleanSnippet(value);

  if (!cleaned) return "";

  if (cleaned.length <= 900) return cleaned;

  const shortened = cleaned.slice(0, 900);
  const lastSentence = Math.max(
    shortened.lastIndexOf(". "),
    shortened.lastIndexOf("? "),
    shortened.lastIndexOf("! ")
  );

  if (lastSentence > 300) {
    return shortened.slice(0, lastSentence + 1).trim();
  }

  return cleaned;
}

function getKnownAttractionState(text: string): string | null {
  const lowerText = text.toLowerCase();

  for (const [name, state] of Object.entries(KNOWN_ATTRACTIONS)) {
    if (lowerText.includes(name)) {
      return state;
    }
  }

  return null;
}

function findState(text: string): string | null {
  const knownState = getKnownAttractionState(text);

  if (knownState) return knownState;

  for (const state of NIGERIAN_STATES) {
    const escaped = state.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`\\b${escaped}\\b`, "i");

    if (pattern.test(text)) {
      return state;
    }
  }

  return null;
}

function getRequestedState(location: string): string | null {
  const lower = location.toLowerCase().trim();

  const state = NIGERIAN_STATES.find(
    (item) => item.toLowerCase() === lower
  );

  return state || CITY_STATES[lower] || null;
}

async function wikipediaSearch(
  term: string
): Promise<WikipediaResult[]> {
  const url = new URL("https://en.wikipedia.org/w/api.php");

  url.searchParams.set("action", "query");
  url.searchParams.set("list", "search");
  url.searchParams.set("srsearch", term);
  url.searchParams.set("srlimit", "30");
  url.searchParams.set("format", "json");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "TripWise/1.0 (tourism discovery application)",
    },
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Wikipedia request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.query?.search || [];
}

// NEW: Retrieve the actual introductory paragraphs of Wikipedia articles.
async function getDescriptionsForPlaces(pageIds: number[]) {
  if (!pageIds.length) return {};

  const descriptions: Record<string, string> = {};

  // Wikipedia supports batches of up to 50 page IDs.
  for (let i = 0; i < pageIds.length; i += 50) {
    const batch = pageIds.slice(i, i + 50);

    try {
      const url = new URL("https://en.wikipedia.org/w/api.php");

      url.searchParams.set("action", "query");
      url.searchParams.set("pageids", batch.join("|"));
      url.searchParams.set("prop", "extracts");
      url.searchParams.set("exintro", "1");
      url.searchParams.set("explaintext", "1");
      url.searchParams.set("format", "json");

      const response = await fetch(url, {
        headers: {
          "User-Agent": "TripWise/1.0 (tourism discovery application)",
        },
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const pages = Object.values(
        data.query?.pages || {}
      ) as Array<{ pageid: number; extract?: string }>;

      for (const page of pages) {
        const description = makeReadableDescription(
          page.extract || ""
        );

        if (description) {
          descriptions[String(page.pageid)] = description;
        }
      }
    } catch (error) {
      console.error("Could not retrieve Wikipedia introductions:", error);
    }
  }

  return descriptions;
}

async function getCoordinates(title: string) {
  try {
    const url = new URL("https://en.wikipedia.org/w/api.php");

    url.searchParams.set("action", "query");
    url.searchParams.set("titles", title);
    url.searchParams.set("prop", "coordinates");
    url.searchParams.set("format", "json");

    const response = await fetch(url, {
      headers: {
        "User-Agent": "TripWise/1.0 (tourism discovery application)",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const pages = Object.values(data.query?.pages || []) as any[];

    return pages[0]?.coordinates?.[0] || null;
  } catch {
    return null;
  }
}

async function getCoordinatesForPlaces(pageIds: number[]) {
  if (!pageIds.length) return {};

  try {
    const url = new URL("https://en.wikipedia.org/w/api.php");

    url.searchParams.set("action", "query");
    url.searchParams.set("pageids", pageIds.join("|"));
    url.searchParams.set("prop", "coordinates");
    url.searchParams.set("format", "json");

    const response = await fetch(url, {
      headers: {
        "User-Agent": "TripWise/1.0 (tourism discovery application)",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) return {};

    const data = await response.json();
    return data.query?.pages || {};
  } catch {
    return {};
  }
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const earthRadius = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location")?.trim() || "";

    const requestedState = location
      ? getRequestedState(location)
      : null;

    const originCoordinates = location
      ? await getCoordinates(location)
      : null;

    const searchTerms = location
      ? [
          `tourist attractions in ${location} Nigeria`,
          `tourist sites in ${location} Nigeria`,
          `landmarks in ${location} Nigeria`,
          `parks museums waterfalls in ${location} Nigeria`,
        ]
      : [
          "tourist attractions in Nigeria",
          "tourist sites in Nigeria",
          "waterfalls parks museums and resorts in Nigeria",
          "national parks beaches and monuments in Nigeria",
          "historical sites and natural attractions in Nigeria",
          "tourist attractions in Nigerian states",
        ];

    const searchResults = await Promise.all(
      searchTerms.map((term) => wikipediaSearch(term))
    );

    const uniqueResults = new Map<number, WikipediaResult>();

    for (const group of searchResults) {
      for (const place of group) {
        uniqueResults.set(place.pageid, place);
      }
    }

    const results = Array.from(uniqueResults.values()).map((place) => ({
      id: String(place.pageid),
      name: place.title,
      description: cleanSnippet(place.snippet || ""),
      pageid: place.pageid,
    }));

    const attractionPattern =
      /\b(waterfall|falls|beach|park|garden|museum|resort|hill|mountain|rock|spring|forest|monument|cave|lake|reserve|gallery|heritage|palace|zoo|wildlife|national park|trail|square|shrine|cathedral|church)\b/i;

    const excludedPlaces = ["Tulsa Zoo"];

    const isExcludedPlace = (name: string) =>
      excludedPlaces.some((place) =>
        name.toLowerCase().includes(place.toLowerCase())
      );

    const excludedPattern =
      /^(Tourism in |Tourist attractions in |List of |Culture of |Lagos Colony$|Lagos$|Oba of Lagos$|Lagos Fashion Week$|Lagos City Marathon$|Sporting Lagos|Lagos State University|Lagos State University of Science|CMS Grammar School|King's College|Lagos-Calabar Coastal Highway|Lagos Terminus|Lagos Island General Hospital|Landmark Africa Group|University of |Desmond Elliot$|Hakeem Muri|National Stadium)/i;

    const generalAreaPattern =
      /^(Lagos Mainland|Lagos Island|Victoria Island, Lagos|Ikoyi|Banana Island, Lagos|Yaba, Lagos|Epe, Lagos State|Mushin, Lagos|Ojo, Lagos)$/i;

    const destinations = results
      .filter((place) => {
        const combinedText = `${place.name} ${place.description}`;

        const knownAttractionState = getKnownAttractionState(place.name);
        const titleIsAttraction = attractionPattern.test(place.name);
        const isKnownAttraction = knownAttractionState !== null;

        if (excludedPattern.test(place.name)) return false;
        if (isExcludedPlace(place.name)) return false;
        if (generalAreaPattern.test(place.name)) return false;

        if (!titleIsAttraction && !isKnownAttraction) {
          return false;
        }

        const resultState =
          knownAttractionState || findState(combinedText);

        if (!resultState) return false;

        if (requestedState && resultState !== requestedState) {
          return false;
        }

        return true;
      })
      .map((place) => {
        const state =
          getKnownAttractionState(place.name) ||
          findState(`${place.name} ${place.description}`) ||
          "Nigeria";

        return {
          id: place.id,
          name: place.name,
          description: place.description,
          category: "",
          location: location || "Nigeria",
          state,
          source: "Wikipedia",
          url: `https://en.wikipedia.org/?curid=${place.pageid}`,
        };
      });

    // Get complete introductory descriptions for the selected destinations.
    const descriptions = await getDescriptionsForPlaces(
      destinations.map((place) => Number(place.id))
    );

    const destinationsWithDescriptions = destinations.map((place) => ({
      ...place,
      description:
        descriptions[place.id] ||
        makeReadableDescription(place.description) ||
        `Discover ${place.name}, located in ${place.state}, Nigeria. Explore this destination and learn more about what makes it worth visiting.`,
    }));

    const placeCoordinates = await getCoordinatesForPlaces(
      destinationsWithDescriptions.map((place) => Number(place.id))
    );

    const destinationsWithCoordinates = destinationsWithDescriptions.map(
      (place) => {
        const page = (placeCoordinates as Record<string, any>)[place.id];

        return {
          ...place,
          coordinates: page?.coordinates?.[0] || null,
        };
      }
    );

    const classifiedDestinations = destinationsWithCoordinates.map(
      (place) => {
        if (!originCoordinates || !place.coordinates) {
          return {
            ...place,
            distanceKm: null,
            proximity: "unlocated",
          };
        }

        const distanceKm = Number(
          calculateDistance(
            originCoordinates.lat,
            originCoordinates.lon,
            place.coordinates.lat,
            place.coordinates.lon
          ).toFixed(1)
        );

        let proximity = "outsideRange";

        if (distanceKm <= 25) {
          proximity = "inLocation";
        } else if (distanceKm <= 150) {
          proximity = "nearby";
        }

        return {
          ...place,
          distanceKm,
          proximity,
        };
      }
    );

    const inLocation = classifiedDestinations.filter(
      (place) => place.proximity === "inLocation"
    );

    const nearby = classifiedDestinations.filter(
      (place) => place.proximity === "nearby"
    );

    const unlocated = classifiedDestinations.filter(
      (place) => place.proximity === "unlocated"
    );

    const outsideRange = classifiedDestinations.filter(
      (place) => place.proximity === "outsideRange"
    );

    return NextResponse.json({
      location: location || "Nigeria",
      coordinates: originCoordinates,
      total: classifiedDestinations.length,
      inLocation,
      nearby,
      unlocated,
      outsideRange,
      destinations: classifiedDestinations,
    });
  } catch (error) {
    console.error("Discovery error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to discover destinations.",
      },
      { status: 500 }
    );
  }
}
