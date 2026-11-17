
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useTrip,
  type SavedTrip,
  type ExpenseCategory,
} from "@/app/context/TripContext";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function getExpenseAmount(amount: unknown): number {
  if (typeof amount === "number") {
    return Number.isFinite(amount) ? Math.max(0, amount) : 0;
  }

  if (typeof amount === "string") {
    const parsed = Number(amount.replace(/[₦,\s]/g, "").trim());
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }

  return 0;
}

const expenseCategories: ExpenseCategory[] = [
  "Transportation",
  "Accommodation",
  "Food",
  "Other",
];

function normalizeCategory(value: unknown): ExpenseCategory {
  const category = String(value ?? "").toLowerCase();

  if (
    category.includes("transport") ||
    category.includes("travel") ||
    category.includes("flight") ||
    category.includes("fuel")
  ) {
    return "Transportation";
  }

  if (
    category.includes("accommodation") ||
    category.includes("hotel") ||
    category.includes("lodging")
  ) {
    return "Accommodation";
  }

  if (
    category.includes("food") ||
    category.includes("meal") ||
    category.includes("restaurant") ||
    category.includes("dining")
  ) {
    return "Food";
  }

  return "Other";
}

function getDestinations(savedTrip: SavedTrip) {
  return savedTrip.days
    .flatMap((day) => day.activities)
    .filter((activity) => activity.destinationId)
    .filter(
      (activity, index, allActivities) =>
        allActivities.findIndex(
          (item) => item.destinationId === activity.destinationId
        ) === index
    );
}

function getActivityCost(savedTrip: SavedTrip) {
  return savedTrip.days.reduce(
    (total, day) =>
      total +
      day.activities.reduce(
        (sum, activity) =>
          sum + getExpenseAmount(activity.cost),
        0
      ),
    0
  );
}

function getPlannedCategoryCost(
  savedTrip: SavedTrip,
  category: ExpenseCategory
) {
  const trip = savedTrip.trip;

  switch (category) {
    case "Transportation":
      return getExpenseAmount(trip.transportCost);
    case "Accommodation":
      return getExpenseAmount(trip.accommodationCost);
    case "Food":
      return getExpenseAmount(trip.foodBudget);
    case "Other":
      return getExpenseAmount(trip.otherExpenses);
    default:
      return 0;
  }
}

function getAdditionalCategoryCost(
  savedTrip: SavedTrip,
  category: ExpenseCategory
) {
  return savedTrip.expenses
    .filter(
      (expense) => normalizeCategory(expense.category) === category
    )
    .reduce(
      (total, expense) =>
        total + getExpenseAmount(expense.amount),
      0
    );
}

function getTotalCost(savedTrip: SavedTrip) {
  const plannedCosts = expenseCategories.reduce(
    (total, category) =>
      total + getPlannedCategoryCost(savedTrip, category),
    0
  );

  const additionalExpenses = savedTrip.expenses.reduce(
    (total, expense) =>
      total + getExpenseAmount(expense.amount),
    0
  );

  return getActivityCost(savedTrip) + plannedCosts + additionalExpenses;
}

export default function MyTripsPage() {
  const router = useRouter();

  const {
    savedTrips,
    loadSavedTrip,
    deleteSavedTrip,
    createNewTrip,
    isLoadingTrip,
  } = useTrip();

  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [openingTripId, setOpeningTripId] = useState<string | null>(null);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);

  const selectedTrip =
    savedTrips.find((saved) => saved.id === selectedTripId) ?? null;

  function handleCreateNewTrip() {
    createNewTrip();
    router.push("/create-trip");
  }

  function handleOpenTrip(id: string) {
    setSelectedTripId((current) => current === id ? null : id);
  }

  async function handleContinuePlanning(id: string) {
    setOpeningTripId(id);

    try {
      await loadSavedTrip(id);
      router.push("/create-trip");
    } catch (error) {
      console.error("Unable to continue planning:", error);
      alert("Unable to open this trip. Please try again.");
    } finally {
      setOpeningTripId(null);
    }
  }

  async function handleDeleteTrip(id: string, name: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingTripId(id);

    try {
      const deleted = await deleteSavedTrip(id);

      if (deleted && selectedTripId === id) {
        setSelectedTripId(null);
      }

      if (!deleted) {
        alert("Unable to delete this trip. Please try again.");
      }
    } catch (error) {
      console.error("Unable to delete trip:", error);
      alert("Something went wrong while deleting this trip.");
    } finally {
      setDeletingTripId(null);
    }
  }

  if (isLoadingTrip) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9f6]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-green-800" />
          <p className="text-sm font-medium text-gray-600">
            Loading your saved trips...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9f6]">
      {/* PAGE HEADER */}
      <section className="relative overflow-hidden bg-[#102f24] px-4 py-14 text-white sm:px-6 md:py-20">
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
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-green-300">
            Your travel collection
          </p>

          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
            My Trips
            <span className="block text-green-300">My Adventures.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-green-50/90 sm:text-base">
            Your saved Nigerian adventures, all in one place.
            Open any trip to see its destinations, itinerary and budget.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        {/* SAVED TRIPS */}
        <section>
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
                Your travel collection
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-gray-900 md:text-3xl">
                Your Saved Trips
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Select a trip to view all its details.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="w-fit rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-800">
                {savedTrips.length}{" "}
                {savedTrips.length === 1 ? "saved trip" : "saved trips"}
              </span>

              <button
                type="button"
                onClick={handleCreateNewTrip}
                className="rounded-xl bg-green-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-900"
              >
                + Create New Trip
              </button>
            </div>
          </div>

          {savedTrips.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white px-5 py-14 text-center">
              <div className="text-5xl">🧳</div>

              <h3 className="mt-4 text-xl font-bold text-gray-900">
                Your adventures start here
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                You haven't saved any trips yet. Start planning
                an adventure and save it to find it here.
              </p>

              <button
                type="button"
                onClick={handleCreateNewTrip}
                className="mt-6 rounded-xl bg-green-800 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-green-900"
              >
                Create My First Trip
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {savedTrips.map((savedTrip) => {
                const destinations = getDestinations(savedTrip);

                const activityCount = savedTrip.days.reduce(
                  (total, day) => total + day.activities.length,
                  0
                );

                const isOpen = selectedTripId === savedTrip.id;

                return (
                  <article
                    key={savedTrip.id}
                    className={`overflow-hidden rounded-2xl border bg-white transition ${
                      isOpen
                        ? "border-green-500 shadow-md"
                        : "border-gray-200 shadow-sm hover:border-green-300"
                    }`}
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                            Saved adventure
                          </p>

                          <h3 className="mt-2 break-words text-xl font-extrabold text-gray-900">
                            {savedTrip.trip.tripName || "My Nigerian Adventure"}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {savedTrip.trip.destinationState ||
                              "Destination not selected"}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800">
                          Saved
                        </span>
                      </div>

                      <div className="mt-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                          Destinations
                        </p>

                        {destinations.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {destinations.slice(0, 4).map((destination) => (
                              <span
                                key={destination.destinationId}
                                className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-800"
                              >
                                {destination.title}
                              </span>
                            ))}

                            {destinations.length > 4 && (
                              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                                +{destinations.length - 4} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-gray-400">
                            No destinations added yet.
                          </p>
                        )}
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-gray-50 p-3">
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="mt-1 font-bold text-gray-900">
                            {savedTrip.trip.duration || "Not set"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-gray-50 p-3">
                          <p className="text-xs text-gray-500">Travel budget</p>
                          <p className="mt-1 font-bold text-gray-900">
                            {formatNaira(getExpenseAmount(savedTrip.trip.budget))}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                        {savedTrip.trip.departure && (
                          <span>
                            <strong>Departure:</strong>{" "}
                            {savedTrip.trip.departure}
                          </span>
                        )}

                        <span>
                          <strong>Days:</strong> {savedTrip.days.length}
                        </span>

                        <span>
                          <strong>Activities:</strong> {activityCount}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 border-t border-gray-100 bg-gray-50/70 p-4">
                      <button
                        type="button"
                        onClick={() => handleOpenTrip(savedTrip.id)}
                        className="flex-1 rounded-xl border border-green-800 px-4 py-3 text-sm font-bold text-green-800 transition hover:bg-green-50"
                      >
                        {isOpen ? "Close Trip" : "Open Trip"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleContinuePlanning(savedTrip.id)}
                        disabled={openingTripId === savedTrip.id}
                        className="flex-1 rounded-xl bg-green-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-900 disabled:opacity-50"
                      >
                        {openingTripId === savedTrip.id
                          ? "Opening..."
                          : "Continue Planning"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteTrip(
                            savedTrip.id,
                            savedTrip.trip.tripName
                          )
                        }
                        disabled={deletingTripId === savedTrip.id}
                        className="rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingTripId === savedTrip.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* OPENED TRIP DETAILS */}
        {selectedTrip && (
          <section className="mt-10 scroll-mt-8">
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="bg-[#102f24] p-6 text-white sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-300">
                      Your saved adventure
                    </p>

                    <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                      {selectedTrip.trip.tripName || "My Nigerian Adventure"}
                    </h2>

                    <p className="mt-2 text-sm text-green-50/80">
                      {selectedTrip.trip.destinationState ||
                        "Your selected destinations"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedTripId(null)}
                    className="rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Close Details ✕
                  </button>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="text-xs text-green-100">Departure</p>
                    <p className="mt-1 font-bold">
                      {selectedTrip.trip.departure || "Not set"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="text-xs text-green-100">Duration</p>
                    <p className="mt-1 font-bold">
                      {selectedTrip.trip.duration || "Not set"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="text-xs text-green-100">Activities</p>
                    <p className="mt-1 font-bold">
                      {selectedTrip.days.reduce(
                        (total, day) => total + day.activities.length,
                        0
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-10 p-5 sm:p-8">
                {/* DESTINATIONS */}
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">
                    Your Destinations
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    All the places included in this trip.
                  </p>

                  {getDestinations(selectedTrip).length > 0 ? (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {getDestinations(selectedTrip).map((destination) => (
                        <article
                          key={destination.destinationId}
                          className="overflow-hidden rounded-xl border border-gray-100"
                        >
                          {destination.imageUrl ? (
                            <img
                              src={destination.imageUrl}
                              alt={destination.title}
                              className="h-40 w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-40 items-center justify-center bg-green-50 text-4xl">
                              📍
                            </div>
                          )}

                          <div className="p-4">
                            <h4 className="font-bold text-gray-900">
                              {destination.title}
                            </h4>

                            <p className="mt-1 text-sm text-gray-500">
                              {destination.state}, Nigeria
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 rounded-xl bg-gray-50 p-5 text-sm text-gray-500">
                      No destinations have been added to this trip.
                    </p>
                  )}
                </div>

                {/* BUDGET */}
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">
                    Your Trip Budget
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    A breakdown of the estimated cost of this adventure.
                  </p>

                  {(() => {
                    const totalBudget = getExpenseAmount(selectedTrip.trip.budget);
                    const totalCost = getTotalCost(selectedTrip);
                    const remaining = totalBudget - totalCost;
                    const percentage =
                      totalBudget > 0 ? (totalCost / totalBudget) * 100 : 0;
                    const overBudget =
                      totalBudget > 0 && totalCost > totalBudget;

                    return (
                      <>
                        <div className="mt-5 grid gap-4 sm:grid-cols-3">
                          <div className="rounded-2xl bg-gray-50 p-5">
                            <p className="text-sm text-gray-500">Total budget</p>
                            <p className="mt-2 text-xl font-extrabold text-gray-900">
                              {formatNaira(totalBudget)}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-green-50 p-5">
                            <p className="text-sm text-green-700">
                              Estimated trip cost
                            </p>
                            <p className="mt-2 text-xl font-extrabold text-green-900">
                              {formatNaira(totalCost)}
                            </p>
                          </div>

                          <div className={`rounded-2xl p-5 ${
                            overBudget ? "bg-red-50" : "bg-blue-50"
                          }`}>
                            <p className="text-sm text-gray-600">
                              {overBudget ? "Amount over budget" : "Remaining budget"}
                            </p>
                            <p className={`mt-2 text-xl font-extrabold ${
                              overBudget ? "text-red-800" : "text-blue-900"
                            }`}>
                              {formatNaira(Math.abs(remaining))}
                            </p>
                          </div>
                        </div>

                        {totalBudget > 0 && (
                          <div className="mt-5 rounded-2xl border border-gray-100 p-5">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-bold text-gray-800">
                                Budget usage
                              </p>
                              <p className="font-bold text-gray-900">
                                {percentage.toFixed(1)}%
                              </p>
                            </div>

                            <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className={`h-full rounded-full ${
                                  overBudget ? "bg-red-500" : "bg-green-700"
                                }`}
                                style={{
                                  width: `${Math.min(percentage, 100)}%`,
                                }}
                              />
                            </div>

                            <div className="mt-3 flex justify-between gap-3 text-xs text-gray-500">
                              <span>{formatNaira(totalCost)} planned</span>
                              <span>{formatNaira(totalBudget)} budget</span>
                            </div>
                          </div>
                        )}

                        {/* EXPENSE CATEGORIES */}
                        <div className="mt-6 rounded-2xl border border-gray-100 p-5">
                          <h4 className="font-bold text-gray-900">
                            Expense Categories
                          </h4>

                          <p className="mt-1 text-sm text-gray-500">
                            Your planned and additional expenses by category.
                          </p>

                          <div className="mt-5 space-y-5">
                            {expenseCategories.map((category) => {
                              const planned = getPlannedCategoryCost(
                                selectedTrip,
                                category
                              );

                              const additional = getAdditionalCategoryCost(
                                selectedTrip,
                                category
                              );

                              return (
                                <div
                                  key={category}
                                  className="flex items-center justify-between gap-4"
                                >
                                  <div>
                                    <p className="font-semibold text-gray-800">
                                      {category}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                      Planned: {formatNaira(planned)}
                                      {" · "}
                                      Additional: {formatNaira(additional)}
                                    </p>
                                  </div>

                                  <p className="shrink-0 font-bold text-gray-900">
                                    {formatNaira(planned + additional)}
                                  </p>
                                </div>
                              );
                            })}

                            <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-5">
                              <div>
                                <p className="font-semibold text-gray-800">
                                  Activities and attractions
                                </p>
                                <p className="mt-1 text-xs text-gray-400">
                                  Costs attached to selected destinations
                                </p>
                              </div>

                              <p className="shrink-0 font-bold text-gray-900">
                                {formatNaira(getActivityCost(selectedTrip))}
                              </p>
                            </div>

                            <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-5">
                              <p className="font-extrabold text-gray-900">
                                Total estimated cost
                              </p>
                              <p className="text-xl font-extrabold text-green-800">
                                {formatNaira(totalCost)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* ITINERARY */}
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">
                    Your Itinerary
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Your planned activities, arranged by day.
                  </p>

                  <div className="mt-5 space-y-5">
                    {selectedTrip.days.map((day, index) => (
                      <section
                        key={day.id}
                        className="overflow-hidden rounded-2xl border border-gray-100"
                      >
                        <div className="flex items-center justify-between gap-3 bg-gray-50 px-5 py-4">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                              Day {index + 1}
                            </p>
                            <h4 className="mt-1 font-bold text-gray-900">
                              {day.title}
                            </h4>
                          </div>

                          <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-800">
                            {day.activities.length}{" "}
                            {day.activities.length === 1 ? "activity" : "activities"}
                          </span>
                        </div>

                        <div className="space-y-4 p-4 sm:p-5">
                          {day.activities.length === 0 ? (
                            <p className="text-sm text-gray-400">
                              No activities planned for this day.
                            </p>
                          ) : (
                            day.activities.map((activity) => (
                              <article
                                key={activity.id}
                                className="flex flex-col gap-4 rounded-xl border border-gray-100 p-4 sm:flex-row"
                              >
                                <div className="h-40 w-full shrink-0 overflow-hidden rounded-lg bg-green-50 sm:h-28 sm:w-36">
                                  {activity.imageUrl ? (
                                    <img
                                      src={activity.imageUrl}
                                      alt={activity.title}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full items-center justify-center text-3xl">
                                      📍
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-800">
                                      {activity.type}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {activity.time}
                                    </span>
                                  </div>

                                  <h5 className="mt-2 font-bold text-gray-900">
                                    {activity.title}
                                  </h5>

                                  <p className="mt-1 text-sm text-gray-500">
                                    {activity.state}, Nigeria
                                  </p>

                                  {activity.description && (
                                    <p className="mt-2 text-sm leading-6 text-gray-600">
                                      {activity.description}
                                    </p>
                                  )}

                                  <p className="mt-3 text-sm font-bold text-green-800">
                                    {activity.cost > 0
                                      ? formatNaira(activity.cost)
                                      : "Cost not available"}
                                  </p>
                                </div>
                              </article>
                            ))
                          )}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>

                {/* CONTINUE PLANNING */}
                <div className="rounded-2xl bg-green-50 p-5 sm:p-6">
                  <h3 className="text-lg font-extrabold text-green-950">
                    Want to make changes to this trip?
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-green-900/80">
                    Continue planning to update your destinations,
                    itinerary, accommodation and travel budget.
                  </p>

                  <button
                    type="button"
                    onClick={() => handleContinuePlanning(selectedTrip.id)}
                    disabled={openingTripId === selectedTrip.id}
                    className="mt-5 w-full rounded-xl bg-green-800 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-green-900 disabled:opacity-50 sm:w-auto"
                  >
                    {openingTripId === selectedTrip.id
                      ? "Opening Trip..."
                      : "Continue Planning →"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="mt-12 border-t border-gray-200 py-8 text-center">
          <p className="text-sm text-gray-500">
            Your journey across Nigeria, organised in one place.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            TripWise — Discover. Plan. Explore.
          </p>
        </footer>
      </div>
    </main>
  );
}
