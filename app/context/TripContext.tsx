
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  onAuthStateChanged,
  signInAnonymously,
} from "firebase/auth";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

// ==========================================
// TYPES
// ==========================================

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

export type ExpenseCategory =
  | "Transportation"
  | "Accommodation"
  | "Food"
  | "Other";

export type ExpensePriceStatus =
  | "verified"
  | "estimated"
  | "user-entered";

export type TripExpense = {
  id: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  priceStatus: ExpensePriceStatus;
  notes?: string;
};

export type TripDetails = {
  tripName: string;
  destinationState: string;
  departure: string;
  duration: string;
  budget: number;

  transportCost?: number;
  accommodationName?: string;
  accommodationNights?: number;
  accommodationCost?: number;
  foodBudget?: number;
  otherExpenses?: number;
};

export type SavedTrip = {
  id: string;
  trip: TripDetails;
  days: TripDay[];
  expenses: TripExpense[];
  updatedAt?: string;
};

type TripContextType = {
  trip: TripDetails;
  days: TripDay[];
  expenses: TripExpense[];

  savedTrips: SavedTrip[];
  activeTripId: string | null;

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

  addExpense: (expense: TripExpense) => void;
  updateExpense: (expenseId: string, updates: Partial<TripExpense>) => void;
  removeExpense: (expenseId: string) => void;

  saveTrip: () => Promise<boolean>;
  loadSavedTrip: (tripId: string) => Promise<void>;
  createNewTrip: () => void;
  deleteSavedTrip: (tripId: string) => Promise<boolean>;

  isLoadingTrip: boolean;
  saveStatus: string;
};

// ==========================================
// DEFAULT VALUES
// ==========================================

const DEFAULT_TRIP: TripDetails = {
  tripName: "My Nigerian Adventure",
  destinationState: "",
  departure: "",
  duration: "Weekend",
  budget: 0,
  transportCost: 0,
  accommodationName: "",
  accommodationNights: 1,
  accommodationCost: 0,
  foodBudget: 0,
  otherExpenses: 0,
};

const createDefaultDays = (): TripDay[] => [
  {
    id: "day-1",
    title: "Day 1",
    activities: [],
  },
];

// ==========================================
// HELPERS
// ==========================================

const createId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const normalizeExpense = (
  raw: any,
  index: number
): TripExpense => {
  const rawAmount = raw?.amount ?? raw?.cost ?? raw?.price ?? 0;

  const amount =
    typeof rawAmount === "number"
      ? rawAmount
      : Number(
          String(rawAmount)
            .replace(/[₦,\s]/g, "")
            .replace(/[^\d.-]/g, "")
        ) || 0;

  const rawCategory = String(raw?.category ?? "Other").toLowerCase();

  let category: ExpenseCategory = "Other";

  if (
    rawCategory.includes("transport") ||
    rawCategory.includes("travel")
  ) {
    category = "Transportation";
  } else if (
    rawCategory.includes("accommodation") ||
    rawCategory.includes("hotel") ||
    rawCategory.includes("lodging")
  ) {
    category = "Accommodation";
  } else if (
    rawCategory.includes("food") ||
    rawCategory.includes("restaurant") ||
    rawCategory.includes("meal")
  ) {
    category = "Food";
  }

  const rawStatus = raw?.priceStatus ?? raw?.status;

  const priceStatus: ExpensePriceStatus =
    rawStatus === "verified" ||
    rawStatus === "estimated" ||
    rawStatus === "user-entered"
      ? rawStatus
      : "user-entered";

  return {
    id: String(raw?.id ?? `saved-expense-${index}`),
    category,
    title: String(raw?.title ?? raw?.name ?? "Trip expense"),
    amount,
    priceStatus,
    notes: raw?.notes ? String(raw.notes) : "",
  };
};

const normalizeSavedTrip = (
  id: string,
  data: any
): SavedTrip => {
  const rawTrip = data?.trip ?? {};

  const trip: TripDetails = {
    ...DEFAULT_TRIP,
    ...rawTrip,
    budget: Number(rawTrip?.budget) || 0,
  };

  const days: TripDay[] = Array.isArray(data?.days)
    ? data.days.map((day: any, index: number) => ({
        id: String(day?.id ?? `day-${index + 1}`),
        title: String(day?.title ?? `Day ${index + 1}`),
        activities: Array.isArray(day?.activities)
          ? day.activities.map((activity: any) => ({
              ...activity,
              id: String(activity?.id ?? createId()),
              cost: Number(activity?.cost) || 0,
            }))
          : [],
      }))
    : createDefaultDays();

  const expenses: TripExpense[] = Array.isArray(data?.expenses)
    ? data.expenses.map(normalizeExpense)
    : [];

  let updatedAt = "";

  if (typeof data?.updatedAt === "string") {
    updatedAt = data.updatedAt;
  } else if (data?.updatedAt?.toDate) {
    updatedAt = data.updatedAt.toDate().toISOString();
  }

  return {
    id,
    trip,
    days: days.length ? days : createDefaultDays(),
    expenses,
    updatedAt,
  };
};

// ==========================================
// CONTEXT
// ==========================================

const TripContext = createContext<TripContextType | undefined>(
  undefined
);

// ==========================================
// PROVIDER
// ==========================================

export function TripProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [trip, setTrip] = useState<TripDetails>(DEFAULT_TRIP);
  const [days, setDays] = useState<TripDay[]>(createDefaultDays);
  const [expenses, setExpenses] = useState<TripExpense[]>([]);

  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");

  // ========================================
  // LOAD SAVED TRIPS
  // ========================================

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        let currentUser = user;

        if (!currentUser) {
          const credential = await signInAnonymously(auth);
          currentUser = credential.user;
        }

        if (!mounted) return;

        setUserId(currentUser.uid);

        const tripsRef = collection(
          db,
          "users",
          currentUser.uid,
          "trips"
        );

        const snapshot = await getDocs(tripsRef);

        if (!mounted) return;

        const loadedTrips = snapshot.docs.map((tripDoc) =>
          normalizeSavedTrip(tripDoc.id, tripDoc.data())
        );

        loadedTrips.sort((a, b) => {
          const dateA = a.updatedAt
            ? new Date(a.updatedAt).getTime()
            : 0;

          const dateB = b.updatedAt
            ? new Date(b.updatedAt).getTime()
            : 0;

          return dateB - dateA;
        });

        setSavedTrips(loadedTrips);

        if (loadedTrips.length > 0) {
          const latestTrip = loadedTrips[0];

          setTrip(latestTrip.trip);
          setDays(latestTrip.days);
          setExpenses(latestTrip.expenses);
          setActiveTripId(latestTrip.id);
        } else {
          setTrip(DEFAULT_TRIP);
          setDays(createDefaultDays());
          setExpenses([]);
          setActiveTripId(null);
        }
      } catch (error) {
        console.error("Error loading saved trips:", error);
        if (mounted) {
          setSaveStatus("Unable to load your saved trips.");
        }
      } finally {
        if (mounted) {
          setIsLoadingTrip(false);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // ========================================
  // ADD DESTINATION
  // ========================================

  const addDestination = (destination: {
    id: string;
    name: string;
    state: string;
    description?: string;
    imageUrl?: string;
    cost?: number;
  }) => {
    setDays((currentDays) => {
      const alreadyAdded = currentDays.some((day) =>
        day.activities.some(
          (activity) => activity.destinationId === destination.id
        )
      );

      if (alreadyAdded) return currentDays;

      const newActivity: TripActivity = {
        id: createId(),
        destinationId: destination.id,
        title: destination.name,
        state: destination.state,
        description: destination.description,
        imageUrl: destination.imageUrl,
        time: "09:00",
        type: "Attraction",
        cost: Number(destination.cost) || 0,
      };

      const updatedDays = [...currentDays];

      if (updatedDays.length === 0) {
        updatedDays.push({
          id: createId(),
          title: "Day 1",
          activities: [newActivity],
        });
      } else {
        updatedDays[0] = {
          ...updatedDays[0],
          activities: [...updatedDays[0].activities, newActivity].sort(
            (a, b) => a.time.localeCompare(b.time)
          ),
        };
      }

      return updatedDays;
    });

    setTrip((current) => ({
      ...current,
      destinationState: current.destinationState || destination.state,
    }));
  };

  // ========================================
  // ADD ACTIVITY
  // ========================================

  const addActivity = (dayId: string, activity: TripActivity) => {
    setDays((currentDays) =>
      currentDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              activities: [...day.activities, activity].sort((a, b) =>
                a.time.localeCompare(b.time)
              ),
            }
          : day
      )
    );
  };

  // ========================================
  // REMOVE ACTIVITY
  // ========================================

  const removeActivity = (dayId: string, activityId: string) => {
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
  };

  // ========================================
  // ADD DAY
  // ========================================

  const addDay = () => {
    setDays((currentDays) => [
      ...currentDays,
      {
        id: createId(),
        title: `Day ${currentDays.length + 1}`,
        activities: [],
      },
    ]);
  };

  // ========================================
  // UPDATE TRIP
  // ========================================

  const updateTrip = (details: Partial<TripDetails>) => {
    setTrip((current) => ({
      ...current,
      ...details,
    }));
  };

  // ========================================
  // EXPENSES
  // ========================================

  const addExpense = (expense: TripExpense) => {
    setExpenses((current) => [...current, expense]);
  };

  const updateExpense = (
    expenseId: string,
    updates: Partial<TripExpense>
  ) => {
    setExpenses((current) =>
      current.map((expense) =>
        expense.id === expenseId
          ? { ...expense, ...updates }
          : expense
      )
    );
  };

  const removeExpense = (expenseId: string) => {
    setExpenses((current) =>
      current.filter((expense) => expense.id !== expenseId)
    );
  };

  // ========================================
  // SAVE TRIP
  // ========================================

  const saveTrip = async (): Promise<boolean> => {
    if (!userId) {
      setSaveStatus("Please wait while your trip storage loads.");
      return false;
    }

    try {
      setSaveStatus("Saving your trip...");

      const tripId = activeTripId ?? doc(
        collection(db, "users", userId, "trips")
      ).id;

      const updatedAt = new Date().toISOString();

      const tripToSave: SavedTrip = {
        id: tripId,
        trip: { ...trip },
        days: [...days],
        expenses: [...expenses],
        updatedAt,
      };

      const tripRef = doc(
        db,
        "users",
        userId,
        "trips",
        tripId
      );

      await setDoc(tripRef, {
        trip: tripToSave.trip,
        days: tripToSave.days,
        expenses: tripToSave.expenses,
        updatedAt,
      });

      setActiveTripId(tripId);

      setSavedTrips((current) => {
        const withoutCurrent = current.filter(
          (saved) => saved.id !== tripId
        );

        return [tripToSave, ...withoutCurrent];
      });

      setSaveStatus("Your trip has been saved successfully!");
      return true;
    } catch (error) {
      console.error("Error saving trip:", error);
      setSaveStatus("Unable to save your trip. Please try again.");
      return false;
    }
  };

  // ========================================
  // LOAD A SAVED TRIP
  // ========================================

  const loadSavedTrip = async (tripId: string) => {
    const selectedTrip = savedTrips.find(
      (saved) => saved.id === tripId
    );

    if (!selectedTrip) {
      setSaveStatus("This saved trip could not be found.");
      return;
    }

    setIsLoadingTrip(true);

    try {
      setTrip(selectedTrip.trip);
      setDays(selectedTrip.days);
      setExpenses(selectedTrip.expenses);
      setActiveTripId(selectedTrip.id);
      setSaveStatus(`Now editing: ${selectedTrip.trip.tripName}`);
    } catch (error) {
      console.error("Error opening saved trip:", error);
      setSaveStatus("Unable to open this trip.");
    } finally {
      setIsLoadingTrip(false);
    }
  };

  // ========================================
  // CREATE A NEW TRIP
  // ========================================

  const createNewTrip = () => {
    setTrip({ ...DEFAULT_TRIP });
    setDays(createDefaultDays());
    setExpenses([]);
    setActiveTripId(null);
    setSaveStatus("New trip started. Save it when you're ready.");
  };

  // ========================================
  // DELETE A SAVED TRIP
  // ========================================

  const deleteSavedTrip = async (
    tripId: string
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      await deleteDoc(
        doc(db, "users", userId, "trips", tripId)
      );

      setSavedTrips((current) =>
        current.filter((saved) => saved.id !== tripId)
      );

      if (activeTripId === tripId) {
        setTrip({ ...DEFAULT_TRIP });
        setDays(createDefaultDays());
        setExpenses([]);
        setActiveTripId(null);
        setSaveStatus("Trip deleted. You can start a new trip.");
      }

      return true;
    } catch (error) {
      console.error("Error deleting saved trip:", error);
      setSaveStatus("Unable to delete this trip. Please try again.");
      return false;
    }
  };

  // ========================================
  // PROVIDER VALUE
  // ========================================

  return (
    <TripContext.Provider
      value={{
        trip,
        days,
        expenses,

        savedTrips,
        activeTripId,

        addDestination,
        addActivity,
        removeActivity,
        addDay,
        updateTrip,

        addExpense,
        updateExpense,
        removeExpense,

        saveTrip,
        loadSavedTrip,
        createNewTrip,
        deleteSavedTrip,

        isLoadingTrip,
        saveStatus,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

// ==========================================
// HOOK
// ==========================================

export function useTrip() {
  const context = useContext(TripContext);

  if (!context) {
    throw new Error("useTrip must be used inside a TripProvider");
  }

  return context;
}
