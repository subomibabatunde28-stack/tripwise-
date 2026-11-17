
"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useTrip } from "@/app/context/TripContext";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export default function CreateTripPage() {
  const router = useRouter();

  const {
    trip,
    days,
    updateTrip,
    saveTrip,
    isLoadingTrip,
    saveStatus,
  } = useTrip();

  const selectedDestinations = days
    .flatMap((day) => day.activities)
    .filter((activity) => activity.destinationId)
    .filter(
      (activity, index, allActivities) =>
        allActivities.findIndex(
          (item) => item.destinationId === activity.destinationId
        ) === index
    );

  const handleChange = (
    field: string,
    value: string | number
  ) => {
    updateTrip({ [field]: value });
  };

  const handleSaveTrip = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trip.tripName.trim()) {
      alert("Please enter a name for your trip.");
      return;
    }

    try {
      const saved = await saveTrip();

      if (saved) {
        router.push("/my-trips");
      } else {
        alert("Your trip could not be saved. Please try again.");
      }
    } catch (error) {
      console.error("Trip saving error:", error);
      alert("Something went wrong while saving your trip.");
    }
  };

  const destinationCost = selectedDestinations.reduce(
    (total, destination) => total + (Number(destination.cost) || 0),
    0
  );

  const transportCost = Number(trip.transportCost) || 0;
  const accommodationCost = Number(trip.accommodationCost) || 0;
  const foodBudget = Number(trip.foodBudget) || 0;
  const otherExpenses = Number(trip.otherExpenses) || 0;

  const estimatedTotal =
    destinationCost +
    transportCost +
    accommodationCost +
    foodBudget +
    otherExpenses;

  const totalBudget = Number(trip.budget) || 0;
  const remainingBudget = totalBudget - estimatedTotal;
  const isOverBudget = totalBudget > 0 && remainingBudget < 0;

  if (isLoadingTrip) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9f6]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />
          <p className="font-medium text-gray-600">
            Loading your trip...
          </p>
        </div>
      </main>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-4 focus:ring-green-50";

  const labelClass =
    "mb-2 block text-sm font-semibold text-gray-700";

  const sectionClass =
    "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6";

  return (
    <main className="min-h-screen bg-[#f7f9f6] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <button
          type="button"
          onClick={() => router.push("/my-trips")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-green-700"
        >
          <span aria-hidden="true">←</span>
          Back to My Trips
        </button>

        <div className="mb-7">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-green-700">
            Your next adventure starts here
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Create Your Trip
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Organise your destinations, travel details and expenses
            in one place.
          </p>
        </div>

        <form onSubmit={handleSaveTrip} className="space-y-5">

          {/* Trip details */}
          <section className={sectionClass}>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                Trip Details
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Give your trip a name and choose your travel dates.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="sm:col-span-2 lg:col-span-1">
                <label htmlFor="tripName" className={labelClass}>
                  Trip Name
                </label>
                <input
                  id="tripName"
                  type="text"
                  value={trip.tripName}
                  onChange={(e) =>
                    handleChange("tripName", e.target.value)
                  }
                  placeholder="e.g. My December Adventure"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label htmlFor="departure" className={labelClass}>
                  Departure Date
                </label>
                <input
                  id="departure"
                  type="date"
                  value={trip.departure}
                  onChange={(e) =>
                    handleChange("departure", e.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="duration" className={labelClass}>
                  Trip Duration
                </label>
                <select
                  id="duration"
                  value={trip.duration}
                  onChange={(e) =>
                    handleChange("duration", e.target.value)
                  }
                  className={inputClass}
                >
                  <option value="Day Trip">Day Trip</option>
                  <option value="Weekend">Weekend</option>
                  <option value="3 Days">3 Days</option>
                  <option value="5 Days">5 Days</option>
                  <option value="1 Week">1 Week</option>
                  <option value="2 Weeks">2 Weeks</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            </div>
          </section>

          {/* Destinations */}
          <section className={sectionClass}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Your Destinations
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Places you selected from Destinations and Recommendations.
                </p>
              </div>

              <span className="rounded-full bg-green-50 px-3 py-2 text-sm font-bold text-green-800">
                {selectedDestinations.length}{" "}
                {selectedDestinations.length === 1 ? "place" : "places"}
              </span>
            </div>

            {selectedDestinations.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {selectedDestinations.map((destination) => (
                  <div
                    key={destination.destinationId}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 p-3"
                  >
                    {destination.imageUrl ? (
                      <img
                        src={destination.imageUrl}
                        alt={destination.title}
                        className="h-16 w-16 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-green-50 text-center text-xs text-green-700">
                        No image
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-gray-900">
                        {destination.title}
                      </h3>

                      {destination.state && (
                        <p className="mt-1 truncate text-xs text-gray-500">
                          {destination.state}
                        </p>
                      )}

                      <p className="mt-1 text-xs font-semibold text-green-700">
                        Added to your trip
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
                <h3 className="font-semibold text-gray-800">
                  No destinations selected yet
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Add places from the Destinations or Recommendations
                  pages and they will appear here automatically.
                </p>
              </div>
            )}
          </section>

          {/* Budget and expenses */}
          <div className="grid items-start gap-5 lg:grid-cols-2">

            {/* Budget */}
            <section className={sectionClass}>
              <h2 className="text-lg font-bold text-gray-900">
                Plan Your Budget
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                How much do you want to spend on this trip?
              </p>

              <div className="mt-5 rounded-xl bg-green-50 p-4">
                <label htmlFor="budget" className={labelClass}>
                  Total Travel Budget
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-gray-500">
                    ₦
                  </span>

                  <input
                    id="budget"
                    type="number"
                    min="0"
                    value={trip.budget || ""}
                    onChange={(e) =>
                      handleChange(
                        "budget",
                        Math.max(0, Number(e.target.value) || 0)
                      )
                    }
                    placeholder="Enter your budget"
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-9 pr-4 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                  />
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-700">
                  Estimated destination activities
                </p>
                <p className="mt-2 text-xl font-bold text-gray-900">
                  {formatNaira(destinationCost)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Based on the costs of your selected destinations.
                </p>
              </div>
            </section>

            {/* Expenses */}
            <section className={sectionClass}>
              <h2 className="text-lg font-bold text-gray-900">
                Estimated Expenses
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add your expected travel costs.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="transportCost" className={labelClass}>
                    Transportation (₦)
                  </label>
                  <input
                    id="transportCost"
                    type="number"
                    min="0"
                    value={trip.transportCost || ""}
                    onChange={(e) =>
                      handleChange(
                        "transportCost",
                        Math.max(0, Number(e.target.value) || 0)
                      )
                    }
                    placeholder="e.g. 25000"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="accommodationName" className={labelClass}>
                    Accommodation Name
                  </label>
                  <input
                    id="accommodationName"
                    type="text"
                    value={trip.accommodationName || ""}
                    onChange={(e) =>
                      handleChange("accommodationName", e.target.value)
                    }
                    placeholder="Hotel or accommodation"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="accommodationNights" className={labelClass}>
                    Number of Nights
                  </label>
                  <input
                    id="accommodationNights"
                    type="number"
                    min="1"
                    value={trip.accommodationNights || 1}
                    onChange={(e) =>
                      handleChange(
                        "accommodationNights",
                        Math.max(1, Number(e.target.value) || 1)
                      )
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="accommodationCost" className={labelClass}>
                    Accommodation Cost (₦)
                  </label>
                  <input
                    id="accommodationCost"
                    type="number"
                    min="0"
                    value={trip.accommodationCost || ""}
                    onChange={(e) =>
                      handleChange(
                        "accommodationCost",
                        Math.max(0, Number(e.target.value) || 0)
                      )
                    }
                    placeholder="Enter estimated cost"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="foodBudget" className={labelClass}>
                    Food Budget (₦)
                  </label>
                  <input
                    id="foodBudget"
                    type="number"
                    min="0"
                    value={trip.foodBudget || ""}
                    onChange={(e) =>
                      handleChange(
                        "foodBudget",
                        Math.max(0, Number(e.target.value) || 0)
                      )
                    }
                    placeholder="Enter food budget"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="otherExpenses" className={labelClass}>
                    Other Expenses (₦)
                  </label>
                  <input
                    id="otherExpenses"
                    type="number"
                    min="0"
                    value={trip.otherExpenses || ""}
                    onChange={(e) =>
                      handleChange(
                        "otherExpenses",
                        Math.max(0, Number(e.target.value) || 0)
                      )
                    }
                    placeholder="Other expenses"
                    className={inputClass}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Cost summary */}
          <section className={sectionClass}>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                Your Trip Cost Summary
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Review your estimated expenses and remaining budget.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Destination Activities", value: destinationCost },
                { label: "Transportation", value: transportCost },
                { label: "Accommodation", value: accommodationCost },
                { label: "Food", value: foodBudget },
                { label: "Other Expenses", value: otherExpenses },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl bg-gray-50 p-4"
                >
                  <p className="text-xs font-medium text-gray-500">
                    {item.label}
                  </p>
                  <p className="mt-2 font-bold text-gray-900">
                    {formatNaira(item.value)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 p-4">
              <div>
                <p className="text-sm font-semibold text-gray-600">
                  Estimated Total
                </p>
                <p className="mt-1 text-2xl font-bold text-green-700">
                  {formatNaira(estimatedTotal)}
                </p>
              </div>

              {totalBudget > 0 && (
                <div className="text-left sm:text-right">
                  <p className="text-sm font-semibold text-gray-600">
                    {isOverBudget ? "Amount Over Budget" : "Remaining Budget"}
                  </p>
                  <p
                    className={`mt-1 text-xl font-bold ${
                      isOverBudget ? "text-red-700" : "text-green-700"
                    }`}
                  >
                    {formatNaira(Math.abs(remainingBudget))}
                  </p>
                </div>
              )}
            </div>

            {totalBudget > 0 && (
              <div
                className={`mt-3 rounded-xl p-3 text-sm ${
                  isOverBudget
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-800"
                }`}
              >
                {isOverBudget
                  ? "Your estimated expenses are higher than your budget. Consider adjusting your plans."
                  : "Your estimated expenses are within your budget."}
              </div>
            )}
          </section>

          {/* Save trip */}
          <section className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Ready to save your trip?
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Your trip details, destinations and estimated expenses
                will be saved together.
              </p>
            </div>

            <button
              type="submit"
              disabled={saveStatus === "Saving..."}
              className="w-full rounded-xl bg-green-700 px-6 py-4 text-base font-bold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveStatus === "Saving..."
                ? "Saving Your Trip..."
                : "Save Trip"}
            </button>

            <p className="mt-3 text-center text-xs text-gray-500">
              You can revisit your saved trip from My Trips.
            </p>
          </section>
        </form>
      </div>
    </main>
  );
}
