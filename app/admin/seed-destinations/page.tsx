"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { Destination } from "@/lib/destinations";

type SeedDestination = Omit<Destination, "id">;

const attractions: SeedDestination[] = [
  {
    name: "Lagos Conservation Centre",
    slug: "lagos-conservation-centre",
    state: "Lagos",
    region: "South West",
    category: "Nature",
    description: "A nature reserve with forest trails, wildlife and a famous canopy walkway.",
    estimatedCost: 5000,
    vibes: ["Nature", "Adventure", "Family"],
    bestTimeToVisit: "November to March",
  },
  {
    name: "Nike Art Gallery",
    slug: "nike-art-gallery",
    state: "Lagos",
    region: "South West",
    category: "Culture",
    description: "A major art gallery showcasing Nigerian paintings, sculptures, textiles and crafts.",
    estimatedCost: 5000,
    vibes: ["Culture", "Relaxation"],
    bestTimeToVisit: "Throughout the year",
  },
  {
    name: "National Museum Lagos",
    slug: "national-museum-lagos",
    state: "Lagos",
    region: "South West",
    category: "History",
    description: "Explore Nigerian history, archaeology, traditional art and cultural artefacts.",
    estimatedCost: 3000,
    vibes: ["Culture", "Family"],
    bestTimeToVisit: "November to March",
  },
  {
    name: "Tarkwa Bay Beach",
    slug: "tarkwa-bay-beach",
    state: "Lagos",
    region: "South West",
    category: "Beach",
    description: "A popular island beach reached by boat, known for swimming and beach activities.",
    estimatedCost: 10000,
    vibes: ["Beach", "Relaxation", "Adventure"],
    bestTimeToVisit: "November to April",
  },
  {
    name: "Olumo Rock",
    slug: "olumo-rock",
    state: "Ogun",
    region: "South West",
    category: "Adventure",
    description: "A historic rock formation in Abeokuta with climbing routes and views over the city.",
    estimatedCost: 5000,
    vibes: ["Adventure", "Nature", "Culture"],
    bestTimeToVisit: "November to March",
  },
  {
    name: "Erin Ijesha Waterfalls",
    slug: "erin-ijesha-waterfalls",
    state: "Osun",
    region: "South West",
    category: "Nature",
    description: "A scenic series of waterfalls surrounded by greenery and hiking paths.",
    estimatedCost: 5000,
    vibes: ["Nature", "Adventure"],
    bestTimeToVisit: "November to March",
  },
  {
    name: "Osun-Osogbo Sacred Grove",
    slug: "osun-osogbo-sacred-grove",
    state: "Osun",
    region: "South West",
    category: "Culture",
    description: "A UNESCO-listed sacred forest with shrines, sculptures and important Yoruba heritage.",
    estimatedCost: 5000,
    vibes: ["Culture", "Nature", "Relaxation"],
    bestTimeToVisit: "November to March",
  },
  {
    name: "Ikogosi Warm Springs",
    slug: "ikogosi-warm-springs",
    state: "Ekiti",
    region: "South West",
    category: "Nature",
    description: "A natural spring destination famous for the meeting of warm and cold water.",
    estimatedCost: 5000,
    vibes: ["Nature", "Relaxation", "Family"],
    bestTimeToVisit: "November to March",
  },
  {
    name: "Idanre Hills",
    slug: "idanre-hills",
    state: "Ondo",
    region: "South West",
    category: "Adventure",
    description: "Ancient hills with steps, historic settlements and beautiful views of the surrounding landscape.",
    estimatedCost: 5000,
    vibes: ["Adventure", "Nature", "Culture"],
    bestTimeToVisit: "November to March",
  },
  {
    name: "Ogbunike Caves",
    slug: "ogbunike-caves",
    state: "Anambra",
    region: "South East",
    category: "Nature",
    description: "A network of caves surrounded by forest, with cultural and spiritual significance.",
    estimatedCost: 3000,
    vibes: ["Adventure", "Nature", "Culture"],
    bestTimeToVisit: "November to March",
  },
  {
    name: "Awhum Waterfall",
    slug: "awhum-waterfall",
    state: "Enugu",
    region: "South East",
    category: "Nature",
    description: "A waterfall near Awhum community, set among striking rock formations and greenery.",
    estimatedCost: 3000,
    vibes: ["Nature", "Relaxation", "Adventure"],
    bestTimeToVisit: "November to March",
  },
  {
    name: "Ngwo Pine Forest",
    slug: "ngwo-pine-forest",
    state: "Enugu",
    region: "South East",
    category: "Nature",
    description: "A peaceful forest attraction with pine trees, walking paths and a nearby cave and waterfall.",
    estimatedCost: 3000,
    vibes: ["Nature", "Relaxation", "Adventure"],
    bestTimeToVisit: "November to March",
  },
  {
    name: "Obudu Mountain Resort",
    slug: "obudu-mountain-resort",
    state: "Cross River",
    region: "South South",
    category: "Adventure",
    description: "A mountain resort known for cool weather, scenic views and outdoor activities.",
    estimatedCost: 30000,
    vibes: ["Adventure", "Nature", "Relaxation", "Romantic"],
    bestTimeToVisit: "October to February",
  },
  {
    name: "Kwa Falls",
    slug: "kwa-falls",
    state: "Cross River",
    region: "South South",
    category: "Nature",
    description: "A beautiful waterfall surrounded by rainforest near the Afi and Cross River landscapes.",
    estimatedCost: 5000,
    vibes: ["Nature", "Adventure"],
    bestTimeToVisit: "November to March",
  },
  {
    name: "Calabar Museum",
    slug: "calabar-museum",
    state: "Cross River",
    region: "South South",
    category: "History",
    description: "A museum in a historic building exploring the history of Calabar and the region.",
    estimatedCost: 3000,
    vibes: ["Culture", "History", "Family"],
    bestTimeToVisit: "Throughout the year",
  },
  {
    name: "Ibeno Beach",
    slug: "ibeno-beach",
    state: "Akwa Ibom",
    region: "South South",
    category: "Beach",
    description: "A long Atlantic coastline known for its sandy shore and seaside scenery.",
    estimatedCost: 3000,
    vibes: ["Beach", "Relaxation", "Family"],
    bestTimeToVisit: "November to April",
  },
  {
    name: "Port Harcourt Tourist Beach",
    slug: "port-harcourt-tourist-beach",
    state: "Rivers",
    region: "South South",
    category: "Beach",
    description: "A waterfront leisure destination for visitors looking for seaside recreation.",
    estimatedCost: 5000,
    vibes: ["Beach", "Relaxation", "Family"],
    bestTimeToVisit: "November to April",
  },
  {
    name: "Finima Nature Park",
    slug: "finima-nature-park",
    state: "Rivers",
    region: "South South",
    category: "Nature",
    description: "A protected green space on Bonny Island with opportunities to experience local wildlife and vegetation.",
    estimatedCost: 5000,
    vibes: ["Nature", "Adventure"],
    bestTimeToVisit: "November to March",
  },
  {
    name: "Yankari National Park",
    slug: "yankari-national-park",
    state: "Bauchi",
    region: "North East",
    category: "Wildlife",
    description: "A major wildlife reserve known for elephants, safari experiences and Wikki Warm Springs.",
    estimatedCost: 15000,
    vibes: ["Wildlife", "Nature", "Adventure", "Family"],
    bestTimeToVisit: "December to April",
  },
  {
    name: "Kajuru Castle",
    slug: "kajuru-castle",
    state: "Kaduna",
    region: "North West",
    category: "Adventure",
    description: "A distinctive castle-style holiday property set among the hills outside Kaduna.",
    estimatedCost: 30000,
    vibes: ["Adventure", "Romantic", "Relaxation"],
    bestTimeToVisit: "November to March",
  },
  {
    name: "Matsirga Waterfalls",
    slug: "matsirga-waterfalls",
    state: "Kaduna",
    region: "North West",
    category: "Nature",
    description: "A scenic waterfall in Kaduna State surrounded by rocky terrain and vegetation.",
    estimatedCost: 5000,
    vibes: ["Nature", "Adventure"],
    bestTimeToVisit: "November to March",
  },
  {
    name: "Gurara Waterfalls",
    slug: "gurara-waterfalls",
    state: "Niger",
    region: "North Central",
    category: "Nature",
    description: "A striking waterfall and outdoor attraction on the Gurara River.",
    estimatedCost: 5000,
    vibes: ["Nature", "Adventure", "Family"],
    bestTimeToVisit: "November to March",
  },
  {
    name: "Zuma Rock",
    slug: "zuma-rock",
    state: "Niger",
    region: "North Central",
    category: "Nature",
    description: "An iconic natural rock formation near Abuja and one of Nigeria's best-known landmarks.",
    estimatedCost: 3000,
    vibes: ["Nature", "Adventure", "Culture"],
    bestTimeToVisit: "November to March",
  },
  {
    name: "Millennium Park",
    slug: "millennium-park-abuja",
    state: "FCT",
    region: "North Central",
    category: "Nature",
    description: "A large public park in Abuja with landscaped gardens and spaces for outdoor relaxation.",
    estimatedCost: 2000,
    vibes: ["Nature", "Relaxation", "Family"],
    bestTimeToVisit: "November to March",
  },
  {
    name: "Jabi Lake",
    slug: "jabi-lake",
    state: "FCT",
    region: "North Central",
    category: "Nature",
    description: "A popular Abuja waterfront area for lakeside views and leisure activities.",
    estimatedCost: 5000,
    vibes: ["Relaxation", "Nature", "Family"],
    bestTimeToVisit: "November to March",
  },
  {
    name: "Owu Waterfall",
    slug: "owu-waterfall",
    state: "Kwara",
    region: "North Central",
    category: "Nature",
    description: "A tall waterfall in a forested setting, popular with visitors seeking outdoor adventure.",
    estimatedCost: 5000,
    vibes: ["Nature", "Adventure"],
    bestTimeToVisit: "November to March",
  },
  {
    name: "Kainji Lake National Park",
    slug: "kainji-lake-national-park",
    state: "Niger",
    region: "North Central",
    category: "Wildlife",
    description: "A large national park with wildlife, savannah landscapes and the Kainji Lake area.",
    estimatedCost: 10000,
    vibes: ["Wildlife", "Nature", "Adventure"],
    bestTimeToVisit: "December to April",
  },
  {
    name: "Sukur Cultural Landscape",
    slug: "sukur-cultural-landscape",
    state: "Adamawa",
    region: "North East",
    category: "Culture",
    description: "A UNESCO World Heritage Site featuring a historic palace, stone structures and traditional terraces.",
    estimatedCost: 5000,
    vibes: ["Culture", "History", "Nature"],
    bestTimeToVisit: "November to March",
  },
  {
    name: "Gashaka-Gumti National Park",
    slug: "gashaka-gumti-national-park",
    state: "Taraba",
    region: "North East",
    category: "Wildlife",
    description: "Nigeria's largest national park, known for mountain scenery, forests and diverse wildlife.",
    estimatedCost: 15000,
    vibes: ["Wildlife", "Nature", "Adventure"],
    bestTimeToVisit: "November to March",
  },
  {
    name: "Gidan Makama Museum",
    slug: "gidan-makama-museum",
    state: "Kano",
    region: "North West",
    category: "History",
    description: "A historic museum in Kano showcasing the culture, history and traditional life of the region.",
    estimatedCost: 3000,
    vibes: ["Culture", "History", "Family"],
    bestTimeToVisit: "November to March",
  },
];

export default function SeedDestinationsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });

    return unsubscribe;
  }, []);

  async function addDestinations() {
    if (!user) {
      setMessage("Please sign in to your TripWise account first.");
      return;
    }

    try {
      setRunning(true);
      setMessage("Checking your existing destinations...");

      const snapshot = await getDocs(collection(db, "destinations"));

      const existingSlugs = new Set(
        snapshot.docs
          .map((item) => String(item.data().slug || "").toLowerCase())
          .filter(Boolean)
      );

      const existingNames = new Set(
        snapshot.docs
          .map((item) => String(item.data().name || "").trim().toLowerCase())
          .filter(Boolean)
      );

      const batch = writeBatch(db);
      let added = 0;
      let skipped = 0;

      for (const attraction of attractions) {
        const slug = attraction.slug.toLowerCase();
        const name = attraction.name.trim().toLowerCase();

        if (existingSlugs.has(slug) || existingNames.has(name)) {
          skipped++;
          continue;
        }

        const destinationRef = doc(db, "destinations", attraction.slug);

        batch.set(destinationRef, {
          ...attraction,
          createdAt: new Date().toISOString(),
        });

        added++;
      }

      if (added > 0) {
        await batch.commit();
      }

      setMessage(
        `Finished! Added ${added} attractions and skipped ${skipped} existing destinations.`
      );
    } catch (error) {
      console.error("Error adding TripWise destinations:", error);

      setMessage(
        "We could not add the destinations. Check your Firestore security rules and browser console for the exact error."
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-16">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wider text-green-700">
          TripWise database setup
        </p>

        <h1 className="mt-3 text-3xl font-extrabold text-gray-900">
          Add Nigerian tourist attractions
        </h1>

        <p className="mt-4 leading-7 text-gray-600">
          This one-time tool adds 30 individual attractions across Nigeria
          to your existing Firestore destinations collection. Existing
          attractions with matching names or slugs are skipped.
        </p>

        <div className="mt-6 rounded-xl bg-green-50 p-4 text-sm leading-6 text-green-900">
          <strong>What will be added:</strong>
          <br />
          30 attractions, their states, categories, descriptions, travel
          vibes and preliminary estimated visit costs.
        </div>

        {checkingAuth ? (
          <p className="mt-8 text-gray-600">Checking your sign-in...</p>
        ) : !user ? (
          <p className="mt-8 rounded-xl bg-amber-50 p-4 text-amber-800">
            Please sign in to TripWise before using this page.
          </p>
        ) : (
          <button
            type="button"
            onClick={addDestinations}
            disabled={running}
            className="mt-8 w-full rounded-xl bg-green-700 px-6 py-4 font-bold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? "Adding attractions..." : "Add 30 attractions to TripWise"}
          </button>
        )}

        {message && (
          <p className="mt-6 rounded-xl bg-gray-100 p-4 text-sm leading-6 text-gray-800">
            {message}
          </p>
        )}

        <p className="mt-6 text-xs leading-5 text-gray-500">
          Cost figures are preliminary planning estimates, not verified
          entrance fees or full trip budgets. Image URLs have not been
          added yet; we'll handle real attraction photographs separately.
        </p>
      </div>
    </main>
  );
}