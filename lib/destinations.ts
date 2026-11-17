
import {
  collection,
  getDocsFromServer,
  query,
  where,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";

export type DestinationVibe =
  | "Adventure"
  | "Romantic"
  | "Relaxation"
  | "Nature"
  | "Culture"
  | "Family"
  | "Beach"
  | "Nightlife"
  | "Wildlife"
  | "History";

export interface Destination {
  id: string;
  name: string;
  slug: string;
  state: string;
  region?: string;
  category: string;
  description: string;
  imageUrl?: string;

  // Existing estimated destination cost
  estimatedCost: number;

  // Separate estimated travel costs
  estimatedTransportCost?: number;
  estimatedAccommodationCost?: number;
  estimatedFoodCost?: number;
  estimatedActivityCost?: number;
  estimatedOtherCost?: number;

  // Recommendation information
  vibes?: DestinationVibe[];
  bestTimeToVisit?: string;
}

export async function getDestinations(): Promise<Destination[]> {
  try {
    console.log("Firebase project:", db.app.options.projectId);

    const destinationsRef = collection(db, "destinations");
    const snapshot = await getDocsFromServer(destinationsRef);

    console.log("Documents found:", snapshot.size);

    return snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    })) as Destination[];
  } catch (error) {
    console.error("Error fetching destinations:", error);
    throw error;
  }
}

export async function getDestinationBySlug(
  slug: string
): Promise<Destination | null> {
  try {
    const destinationsRef = collection(db, "destinations");

    const q = query(
      destinationsRef,
      where("slug", "==", slug),
      limit(1)
    );

    const snapshot = await getDocsFromServer(q);

    if (snapshot.empty) return null;

    const document = snapshot.docs[0];

    return {
      id: document.id,
      ...document.data(),
    } as Destination;
  } catch (error) {
    console.error("Error fetching destination:", error);
    throw error;
  }
}

export interface Activity {
  id: string;
  name: string;
  description?: string;
  estimatedCost?: number;
  destinationSlug: string;
}

export async function getActivitiesByDestinationSlug(
  slug: string
): Promise<Activity[]> {
  try {
    const activitiesRef = collection(db, "activities");

    const q = query(
      activitiesRef,
      where("destinationSlug", "==", slug)
    );

    const snapshot = await getDocsFromServer(q);

    return snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    })) as Activity[];
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
}
