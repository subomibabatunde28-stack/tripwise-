
"use client";

import { useState } from "react";
import { useTrip } from "@/app/context/TripContext";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function MyTripsPage() {
  const {
    trip,
    days,
    addDay,
    removeActivity,
    updateTrip,
    saveTrip,
    isLoadingTrip,
    saveStatus,
  } = useTrip();

  // Tracks whether the trip is currently being saved.
  const [isSaving, setIsSaving] = useState(false);

  // Handles saving and prevents repeated clicks.
  async function handleSaveTrip() {
    if (isSaving) return;

    setIsSaving(true);

    try {
      await saveTrip();
    } finally {
      setIsSaving(false);
    }
  }

  const totalCost = days.reduce(
    (total, day) =>
      total +
      day.activities.reduce(
        (dayTotal, activity) => dayTotal + activity.cost,
        0
      ),
    0
  );

  const totalActivities = days.reduce(
    (total, day) => total + day.activities.length,
    0
  );

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
      {/* Hero */}
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
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-green-300">
            Your personal travel planner
          </p>

          <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
            Your Journey.
            <span className="block text-green-300">
              Your Adventure.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-green-50/90 md:text-lg">
            Bring your travel plans together. Organise destinations,
            build your itinerary and keep track of your Nigerian
            adventure in one place.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        {/* Trip overview */}
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_12px_45px_rgba(0,0,0,0.045)] md:p-9">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
              Your travel details
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-gray-900 md:text-3xl">
              Trip overview
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Give your trip a name and keep an eye on your plans.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="tripName"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Trip name
              </label>

              <input
                id="tripName"
                type="text"
                value={trip.tripName}
                onChange={(event) =>
                  updateTrip({ tripName: event.target.value })
                }
                placeholder="Give your trip a name"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-lg font-bold text-gray-900 outline-none transition placeholder:text-gray-400 placeholder:font-normal focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <p className="mb-2 block text-sm font-semibold text-gray-700">
                Destination state
              </p>

              <div className="flex min-h-[54px] items-center rounded-xl border border-green-100 bg-green-50 px-4 py-3.5 font-semibold text-green-900">
                {trip.destinationState ||
                  "Add a destination from Recommendations"}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-[#f8faf8] p-5">
              <p className="text-sm font-medium text-gray-500">
                Trip days
              </p>

              <p className="mt-3 text-3xl font-extrabold text-gray-900">
                {days.length}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Planned days
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-[#f8faf8] p-5">
              <p className="text-sm font-medium text-gray-500">
                Destinations added
              </p>

              <p className="mt-3 text-3xl font-extrabold text-gray-900">
                {totalActivities}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Planned activities
              </p>
            </div>

            <div className="col-span-2 rounded-2xl border border-green-100 bg-green-50 p-5 md:col-span-1">
              <p className="text-sm font-medium text-green-700">
                Estimated destination cost
              </p>

              <p className="mt-3 text-2xl font-extrabold text-green-900">
                {formatNaira(totalCost)}
              </p>

              <p className="mt-1 text-xs text-green-700/70">
                Based on added activities
              </p>
            </div>
          </div>

          {/* Save Trip */}
          <div className="mt-8 flex flex-col gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleSaveTrip}
              disabled={isSaving}
              className={`rounded-xl px-7 py-3.5 text-sm font-bold text-white shadow-lg transition ${
                isSaving
                  ? "cursor-not-allowed bg-gray-400"
                  : "cursor-pointer bg-green-800 shadow-green-900/10 hover:-translate-y-0.5 hover:bg-green-900"
              }`}
            >
              {isSaving ? "Saving your trip..." : "Save My Trip"}
            </button>

            {saveStatus && (
              <p
                role="status"
                aria-live="polite"
                className={`text-sm font-medium ${
                  saveStatus.includes("successfully")
                    ? "text-green-700"
                    : saveStatus.includes("could not") ||
                        saveStatus.includes("Please log in")
                      ? "text-red-600"
                      : "text-gray-600"
                }`}
              >
                {saveStatus}
              </p>
            )}
          </div>
        </section>

        {/* Itinerary */}
        <section className="mt-14">
          <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
                Your travel schedule
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
                Your itinerary
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Organise your destinations and activities day by day.
              </p>
            </div>

            <button
              type="button"
              onClick={addDay}
              className="rounded-xl bg-green-800 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-900"
            >
              + Add another day
            </button>
          </div>

          {/* Empty trip */}
          {totalActivities === 0 && (
            <div className="mb-7 rounded-2xl border border-green-100 bg-green-50 p-7 md:p-9">
              <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                Your adventure starts here
              </p>

              <h3 className="mt-3 text-xl font-bold text-green-950">
                Your trip is waiting to be planned.
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-green-900/80">
                Visit Recommendations, discover a destination you
                love and select Add to My Trip. Your chosen
                destinations will appear in your itinerary.
              </p>
            </div>
          )}

          {/* Day cards */}
          <div className="space-y-6">
            {days.map((day, index) => (
              <section
                key={day.id}
                className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-white px-6 py-5 md:px-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-800 text-lg font-extrabold text-white">
                      {index + 1}
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                        Itinerary day {index + 1}
                      </p>

                      <h3 className="mt-1 text-xl font-bold text-gray-900">
                        {day.title}
                      </h3>
                    </div>
                  </div>

                  <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-bold text-green-800">
                    {day.activities.length}{" "}
                    {day.activities.length === 1
                      ? "activity"
                      : "activities"}
                  </span>
                </div>

                <div className="p-5 md:p-8">
                  {day.activities.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-[#fafbf9] px-5 py-10 text-center">
                      <h4 className="font-bold text-gray-800">
                        Nothing planned for this day yet.
                      </h4>

                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                        Visit Recommendations and add a destination
                        to start filling this day with activities.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {day.activities.map((activity) => (
                        <article
                          key={activity.id}
                          className="group flex flex-col gap-5 rounded-2xl border border-gray-100 bg-white p-4 transition hover:border-green-100 hover:shadow-md sm:flex-row sm:p-5"
                        >
                          {/* Photograph */}
                          <div className="h-52 w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-green-100 to-green-200 sm:h-36 sm:w-48">
                            {activity.imageUrl ? (
                              <img
                                src={activity.imageUrl}
                                alt={activity.title}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center px-4 text-center text-sm font-medium text-green-800">
                                Photograph unavailable
                              </div>
                            )}
                          </div>

                          {/* Activity details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800">
                                {activity.type}
                              </span>

                              <span className="text-xs font-medium text-gray-500">
                                {activity.time}
                              </span>
                            </div>

                            <h4 className="mt-3 text-xl font-bold text-gray-900">
                              {activity.title}
                            </h4>

                            <p className="mt-1 text-sm font-medium text-gray-500">
                              {activity.state}, Nigeria
                            </p>

                            {activity.description && (
                              <p className="mt-3 text-sm leading-6 text-gray-600">
                                {activity.description}
                              </p>
                            )}

                            <div className="mt-4">
                              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Estimated cost
                              </p>

                              <p className="mt-1 text-lg font-extrabold text-green-800">
                                {activity.cost > 0
                                  ? formatNaira(activity.cost)
                                  : "Cost not yet available"}
                              </p>
                            </div>
                          </div>

                          {/* Remove */}
                          <div className="flex shrink-0 items-start sm:justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                removeActivity(day.id, activity.id)
                              }
                              className="rounded-lg px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </section>

        {/* Footer note */}
        <div className="mt-12 border-t border-gray-200 py-7 text-center">
          <p className="text-sm leading-6 text-gray-500">
            Your journey across Nigeria, organised in one place.
          </p>
        </div>
      </div>
    </main>
  );
}
