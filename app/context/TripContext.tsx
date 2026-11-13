
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type TripActivity = {
  id: string;
  destinationId?: string;
  title: string;
  state: string;
  description?: string;
  imageUrl?: string;
  time: string;
  type: "Attraction" | "Hotel" | "Transport" | "Restaurant";
  cost: number;
};

export type TripDay = {
  id: string;
  title: string;
  activities: TripActivity[];
};

export type TripDetails = {
  tripName: string;
  destinationState: string;
  departure: string;
  duration: string;
  budget: number;
};

type TripContextType = {
  trip: TripDetails;
  days: TripDay[];
  addDestination: (destination: {
    id: string;
    name: string;
    state: string;
    description?: string;
    imageUrl?: string;
    cost?: number;
  }) => void;
  addActivity: (dayId: string, activity: TripActivity) => void;
  removeActivity: (dayId: string, activityId: string) => void;
  addDay: () => void;
  updateTrip: (details: Partial<TripDetails>) => void;
  saveTrip: () => Promise<boolean>;
  isLoadingTrip: boolean;
  saveStatus: string;
};

const DEFAULT_TRIP: TripDetails = {
  tripName: "My Nigerian Adventure",
  destinationState: "",
  departure: "",
  duration: "Weekend",
  budget: 0,
};

function createDefaultDays(): TripDay[] {
  return [
    {
      id: "day-1",
      title: "Day 1",
      activities: [],
    },
  ];
}

const TripContext = createContext<TripContextType | undefined>(
  undefined
);

export function TripProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [trip, setTrip] = useState<TripDetails>(DEFAULT_TRIP);
  const [days, setDays] = useState<TripDay[]>(createDefaultDays());

  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");

  // Load the signed-in user's saved trip from Firestore.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUserId(user?.uid || null);
      setSaveStatus("");
      setIsLoadingTrip(true);

      if (!user) {
        setTrip(DEFAULT_TRIP);
        setDays(createDefaultDays());
        setIsLoadingTrip(false);
        return;
      }

      try {
        const tripRef = doc(
          db,
          "users",
          user.uid,
          "trips",
          "currentTrip"
        );

        const snapshot = await getDoc(tripRef);

        if (snapshot.exists()) {
          const savedData = snapshot.data();

          if (savedData.trip) {
            setTrip({
              ...DEFAULT_TRIP,
              ...savedData.trip,
            });
          } else {
            setTrip(DEFAULT_TRIP);
          }

          if (Array.isArray(savedData.days)) {
            setDays(savedData.days);
          } else {
            setDays(createDefaultDays());
          }

          setSaveStatus("Your saved trip has been loaded.");
        } else {
          setTrip(DEFAULT_TRIP);
          setDays(createDefaultDays());
        }
      } catch (error) {
        console.error("Could not load saved trip:", error);
        setSaveStatus(
          "Could not load your saved trip. Please try again."
        );
      } finally {
        setIsLoadingTrip(false);
      }
    });

    return () => unsubscribe();
  }, []);

  function addDestination(destination: {
    id: string;
    name: string;
    state: string;
    description?: string;
    imageUrl?: string;
    cost?: number;
  }) {
    setDays((currentDays) => {
      const alreadyAdded = currentDays.some((day) =>
        day.activities.some(
          (activity) => activity.destinationId === destination.id
        )
      );

      if (alreadyAdded) return currentDays;

      const firstDay = currentDays[0];

      const newActivity: TripActivity = {
        id: crypto.randomUUID(),
        destinationId: destination.id,
        title: destination.name,
        state: destination.state,
        description: destination.description,
        imageUrl: destination.imageUrl,
        time: "09:00",
        type: "Attraction",
        cost: destination.cost || 0,
      };

      return currentDays.map((day) =>
        day.id === firstDay.id
          ? {
              ...day,
              activities: [...day.activities, newActivity].sort(
                (a, b) => a.time.localeCompare(b.time)
              ),
            }
          : day
      );
    });

    setTrip((current) => ({
      ...current,
      destinationState:
        current.destinationState || destination.state,
    }));
  }

  function addActivity(dayId: string, activity: TripActivity) {
    setDays((currentDays) =>
      currentDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              activities: [...day.activities, activity].sort(
                (a, b) => a.time.localeCompare(b.time)
              ),
            }
          : day
      )
    );
  }

  function removeActivity(dayId: string, activityId: string) {
    setDays((currentDays) =>
      currentDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              activities: day.activities.filter(
                (activity) => activity.id !== activityId
              ),
            }
          : day
      )
    );
  }

  function addDay() {
    setDays((currentDays) => [
      ...currentDays,
      {
        id: crypto.randomUUID(),
        title: `Day ${currentDays.length + 1}`,
        activities: [],
      },
    ]);
  }

  function updateTrip(details: Partial<TripDetails>) {
    setTrip((current) => ({
      ...current,
      ...details,
    }));
  }

  // Save the current itinerary under the signed-in user's account.
  async function saveTrip(): Promise<boolean> {
    if (!userId) {
      setSaveStatus("Please log in before saving your trip.");
      return false;
    }

    try {
      setSaveStatus("Saving your trip...");

      const tripRef = doc(
        db,
        "users",
        userId,
        "trips",
        "currentTrip"
      );

      await setDoc(tripRef, {
        trip,
        days,
        updatedAt: new Date().toISOString(),
      });

      setSaveStatus("Your trip has been saved successfully!");
      return true;
    } catch (error) {
      console.error("Could not save trip:", error);
      setSaveStatus(
        "We could not save your trip. Please try again."
      );
      return false;
    }
  }

  return (
    <TripContext.Provider
      value={{
        trip,
        days,
        addDestination,
        addActivity,
        removeActivity,
        addDay,
        updateTrip,
        saveTrip,
        isLoadingTrip,
        saveStatus,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);

  if (!context) {
    throw new Error(
      "useTrip must be used inside a TripProvider"
    );
  }

  return context;
}
