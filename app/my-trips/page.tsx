
"use client";

import { useState, type FormEvent } from "react";
import {
  useTrip,
  type ExpenseCategory,
} from "@/app/context/TripContext";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

const expenseCategories: ExpenseCategory[] = [
  "Transportation",
  "Accommodation",
  "Food",
  "Other",
];

function getExpenseAmount(amount: unknown): number {
  if (typeof amount === "number") {
    return Number.isFinite(amount) ? Math.max(0, amount) : 0;
  }

  if (typeof amount === "string") {
    const parsed = Number(
      amount.replace(/[₦,\s]/g, "").trim()
    );
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }

  return 0;
}

function normalizeCategory(value: unknown): ExpenseCategory {
  const category = String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ");

  if (
    [
      "transportation", "transport", "travel", "transit",
      "bus", "flight", "flights", "taxi", "cab", "fuel",
      "fuel cost",
    ].includes(category)
  ) return "Transportation";

  if (
    [
      "accommodation", "accommodations", "accomodation",
      "hotel", "hotels", "lodging", "stay", "stays",
      "guest house", "guesthouse", "resort",
    ].includes(category)
  ) return "Accommodation";

  if (
    [
      "food", "meal", "meals", "restaurant", "restaurants",
      "dining", "drinks", "groceries",
    ].includes(category)
  ) return "Food";

  return "Other";
}

export default function MyTripsPage() {
  const {
    trip,
    days,
    expenses,
    savedTrips,
    activeTripId,
    addDay,
    removeActivity,
    updateTrip,
    addExpense,
    removeExpense,
    saveTrip,
    createNewTrip,
    loadSavedTrip,
    deleteSavedTrip,
    isLoadingTrip,
    saveStatus,
  } = useTrip();

  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] =
    useState<ExpenseCategory>("Transportation");
  const [expenseNotes, setExpenseNotes] = useState("");
  const [addingExpense, setAddingExpense] = useState(false);
  const [saving, setSaving] = useState(false);

  const totalActivities = days.reduce(
    (total, day) => total + day.activities.length,
    0
  );

  const activityCost = days.reduce(
    (total, day) =>
      total +
      day.activities.reduce(
        (sum, activity) =>
          sum +
          (Number.isFinite(activity.cost)
            ? Math.max(0, activity.cost)
            : 0),
        0
      ),
    0
  );

  const unavailableActivities = days.reduce(
    (total, day) =>
      total +
      day.activities.filter(
        (activity) =>
          !Number.isFinite(activity.cost) ||
          activity.cost <= 0
      ).length,
    0
  );

  const expenseTotal = expenses.reduce(
    (total, expense) =>
      total + getExpenseAmount(expense.amount),
    0
  );

  const totalCost = activityCost + expenseTotal;
  const remainingBudget = trip.budget - totalCost;

  const budgetPercentage =
    trip.budget > 0
      ? Math.min((totalCost / trip.budget) * 100, 100)
      : 0;

  const isOverBudget =
    trip.budget > 0 && totalCost > trip.budget;

  const categoryTotals = expenseCategories.map((category) => ({
    category,
    total: expenses
      .filter(
        (expense) =>
          normalizeCategory(expense.category) === category
      )
      .reduce(
        (sum, expense) =>
          sum + getExpenseAmount(expense.amount),
        0
      ),
  }));

  function handleAddExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(expenseAmount);

    if (
      !expenseTitle.trim() ||
      !expenseAmount ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) return;

    addExpense({
  id: crypto.randomUUID(),
  title: expenseTitle.trim(),
  category: expenseCategory,
  amount,
  priceStatus: "user-entered",
  notes: expenseNotes.trim(),
});

    setExpenseTitle("");
    setExpenseAmount("");
    setExpenseNotes("");
    setAddingExpense(false);
  }

  async function handleSaveTrip() {
    setSaving(true);
    await saveTrip();
    setSaving(false);
  }

  async function handleOpenTrip(id: string) {
    await loadSavedTrip(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDeleteTrip(id: string, name: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    await deleteSavedTrip(id);
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

      {/* HERO */}

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
            Discover, organise and budget for your next
            Nigerian adventure. Keep your itinerary,
            expenses and travel plans together in one place.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">

        {/* ======================================
            SAVED TRIPS
        ====================================== */}

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-9">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
                Your travel collection
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-gray-900 md:text-3xl">
                My Saved Trips
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Find, open and manage all your saved adventures.
              </p>
            </div>

            <button
              type="button"
              onClick={createNewTrip}
              className="rounded-xl bg-green-800 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-green-900"
            >
              + Create New Trip
            </button>
          </div>

          {savedTrips.length === 0 ? (
            <div className="mt-7 rounded-2xl border-2 border-dashed border-gray-200 bg-[#fafbf9] px-5 py-10 text-center">
              <div className="text-4xl">🧳</div>

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                No saved trips yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Plan your first adventure, then select Save My Trip.
                Your saved trips will appear here.
              </p>

              <button
                type="button"
                onClick={createNewTrip}
                className="mt-5 rounded-xl bg-green-800 px-6 py-3 text-sm font-bold text-white hover:bg-green-900"
              >
                Start Planning
              </button>
            </div>
          ) : (
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {savedTrips.map((savedTrip) => (
                <article
                  key={savedTrip.id}
                  className={`rounded-2xl border p-5 transition ${
                    activeTripId === savedTrip.id
                      ? "border-green-500 bg-green-50/50"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-extrabold text-gray-900">
                        {savedTrip.trip.tripName}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {savedTrip.trip.destinationState ||
                          "Destination not selected"}
                      </p>
                    </div>

                    {activeTripId === savedTrip.id && (
                      <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                        Currently open
                      </span>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">
                        Trip duration
                      </p>
                      <p className="mt-1 font-bold text-gray-900">
                        {savedTrip.trip.duration}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">
                        Travel budget
                      </p>
                      <p className="mt-1 font-bold text-gray-900">
                        {formatNaira(savedTrip.trip.budget)}
                      </p>
                    </div>
                  </div>

                  {savedTrip.trip.departure && (
                    <p className="mt-3 text-xs text-gray-500">
                      Departure: {savedTrip.trip.departure}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleOpenTrip(savedTrip.id)}
                      disabled={activeTripId === savedTrip.id}
                      className="flex-1 rounded-xl bg-green-800 px-4 py-3 text-sm font-bold text-white hover:bg-green-900 disabled:cursor-default disabled:bg-green-200 disabled:text-green-900"
                    >
                      {activeTripId === savedTrip.id
                        ? "Currently Open"
                        : "Open Trip"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteTrip(
                          savedTrip.id,
                          savedTrip.trip.tripName
                        )
                      }
                      className="rounded-xl border border-red-100 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ======================================
            TRIP OVERVIEW
        ====================================== */}

        <section className="mt-10 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
            Your travel details
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-gray-900 md:text-3xl">
            Trip overview
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Personalise your trip and set your travel budget.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="tripName" className="mb-2 block text-sm font-semibold text-gray-700">
                Trip name
              </label>
              <input
                id="tripName"
                type="text"
                value={trip.tripName}
                onChange={(event) =>
                  updateTrip({ tripName: event.target.value })
                }
                placeholder="My Nigerian Adventure"
                className="w-full rounded-xl border border-gray-200 px-4 py-3.5 font-bold text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Destination state
              </label>
              <div className="flex min-h-[54px] items-center rounded-xl border border-green-100 bg-green-50 px-4 py-3.5 font-semibold text-green-900">
                {trip.destinationState ||
                  "Add a destination from Recommendations"}
              </div>
            </div>

            <div>
              <label htmlFor="departure" className="mb-2 block text-sm font-semibold text-gray-700">
                Departure date
              </label>
              <input
                id="departure"
                type="date"
                value={trip.departure}
                onChange={(event) =>
                  updateTrip({ departure: event.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-gray-800 outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label htmlFor="duration" className="mb-2 block text-sm font-semibold text-gray-700">
                Trip duration
              </label>
              <select
                id="duration"
                value={trip.duration}
                onChange={(event) =>
                  updateTrip({ duration: event.target.value })
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-gray-800 outline-none focus:border-green-600"
              >
                {["Weekend", "3 Days", "5 Days", "7 Days", "2 Weeks", "1 Month", "Custom"].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="budget" className="mb-2 block text-sm font-semibold text-gray-700">
                Your total travel budget (₦)
              </label>
              <input
                id="budget"
                type="number"
                min="0"
                value={trip.budget || ""}
                onChange={(event) =>
                  updateTrip({
                    budget: Math.max(0, Number(event.target.value) || 0),
                  })
                }
                placeholder="Enter your available travel budget"
                className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
              <p className="mt-2 text-xs text-gray-400">
                Set the maximum amount you want to spend on this trip.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-[#f8faf8] p-5">
              <p className="text-sm text-gray-500">Trip days</p>
              <p className="mt-3 text-3xl font-extrabold text-gray-900">
                {days.length}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-[#f8faf8] p-5">
              <p className="text-sm text-gray-500">Planned activities</p>
              <p className="mt-3 text-3xl font-extrabold text-gray-900">
                {totalActivities}
              </p>
            </div>

            <div className="col-span-2 rounded-2xl border border-green-100 bg-green-50 p-5 md:col-span-1">
              <p className="text-sm text-green-700">Estimated trip cost</p>
              <p className="mt-3 text-2xl font-extrabold text-green-900">
                {formatNaira(totalCost)}
              </p>
            </div>
          </div>
        </section>

        {/* ======================================
            FINANCIAL DASHBOARD
        ====================================== */}

        <section className="mt-12">
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
              Your travel finances
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
              Your trip budget
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Understand what your adventure will cost before you set off.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Total estimated expenses
              </p>
              <p className="mt-4 text-2xl font-extrabold text-gray-900">
                {formatNaira(totalCost)}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Activities and additional expenses
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Available budget
              </p>
              <p className="mt-4 text-2xl font-extrabold text-gray-900">
                {formatNaira(trip.budget)}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Your planned spending limit
              </p>
            </div>

            <div className={`rounded-2xl border p-6 shadow-sm ${
              trip.budget > 0 && !isOverBudget
                ? "border-green-100 bg-green-50"
                : isOverBudget
                  ? "border-red-100 bg-red-50"
                  : "border-gray-100 bg-white"
            }`}>
              <p className={`text-sm font-medium ${
                isOverBudget ? "text-red-700" : "text-green-700"
              }`}>
                {isOverBudget ? "Amount over budget" : "Remaining budget"}
              </p>
              <p className={`mt-4 text-2xl font-extrabold ${
                isOverBudget ? "text-red-900" : "text-green-900"
              }`}>
                {formatNaira(Math.abs(remainingBudget))}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                {trip.budget > 0
                  ? isOverBudget
                    ? "You need to reduce your expenses."
                    : "Available for your adventure."
                  : "Enter a budget to compare your expenses."}
              </p>
            </div>
          </div>

          {trip.budget > 0 && (
            <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h3 className="font-bold text-gray-900">Budget usage</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {budgetPercentage.toFixed(1)}% of your budget allocated
                  </p>
                </div>
                <p className={`font-bold ${isOverBudget ? "text-red-600" : "text-green-700"}`}>
                  {formatNaira(totalCost)} / {formatNaira(trip.budget)}
                </p>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    isOverBudget ? "bg-red-500" : "bg-green-700"
                  }`}
                  style={{ width: `${budgetPercentage}%` }}
                />
              </div>

              <p className={`mt-4 text-sm font-medium ${
                isOverBudget ? "text-red-600" : "text-green-700"
              }`}>
                {isOverBudget
                  ? "Your planned expenses exceed your budget."
                  : "Your planned expenses are within your budget."}
              </p>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900">
              Expense breakdown
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              See how your travel money is allocated.
            </p>

            <div className="mt-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">
                    Activities and attractions
                  </p>
                  <p className="text-xs text-gray-400">
                    Destination activity costs
                  </p>
                </div>
                <p className="font-bold text-gray-900">
                  {formatNaira(activityCost)}
                </p>
              </div>

              {categoryTotals.map((item) => (
                <div key={item.category} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {item.category}
                    </p>
                    <p className="text-xs text-gray-400">
                      Additional travel expenses
                    </p>
                  </div>
                  <p className="font-bold text-gray-900">
                    {formatNaira(item.total)}
                  </p>
                </div>
              ))}

              <div className="border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between">
                  <p className="font-extrabold text-gray-900">
                    Total trip cost
                  </p>
                  <p className="text-xl font-extrabold text-green-800">
                    {formatNaira(totalCost)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {unavailableActivities > 0 && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="font-bold text-amber-900">
                Some destination prices are unavailable
              </h3>
              <p className="mt-2 text-sm leading-6 text-amber-800">
                {unavailableActivities} planned{" "}
                {unavailableActivities === 1 ? "activity has" : "activities have"}{" "}
                no available cost information. These activities are excluded
                from your calculated total until their prices are provided.
              </p>
            </div>
          )}
        </section>

        {/* ======================================
            EXPENSE MANAGEMENT
        ====================================== */}

        <section className="mt-14">
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
              Manage your expenses
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
              Plan your expenses
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Add the costs involved in making your journey happen.
            </p>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Additional trip expenses
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Transportation, hotels, meals and more.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAddingExpense(!addingExpense)}
                className="rounded-xl bg-green-800 px-5 py-3 text-sm font-bold text-white hover:bg-green-900"
              >
                {addingExpense ? "Cancel" : "+ Add expense"}
              </button>
            </div>

            {addingExpense && (
              <form
                onSubmit={handleAddExpense}
                className="mt-7 rounded-2xl border border-green-100 bg-green-50/50 p-5 md:p-7"
              >
                <h4 className="mb-6 font-bold text-gray-900">
                  Add a new expense
                </h4>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="expenseTitle" className="mb-2 block text-sm font-semibold text-gray-700">
                      Expense name
                    </label>
                    <input
                      id="expenseTitle"
                      type="text"
                      required
                      value={expenseTitle}
                      onChange={(event) => setExpenseTitle(event.target.value)}
                      placeholder="e.g. Return bus ticket"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="expenseCategory" className="mb-2 block text-sm font-semibold text-gray-700">
                      Expense category
                    </label>
                    <select
                      id="expenseCategory"
                      value={expenseCategory}
                      onChange={(event) =>
                        setExpenseCategory(event.target.value as ExpenseCategory)
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-600"
                    >
                      {expenseCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="expenseAmount" className="mb-2 block text-sm font-semibold text-gray-700">
                      Amount (₦)
                    </label>
                    <input
                      id="expenseAmount"
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={expenseAmount}
                      onChange={(event) => setExpenseAmount(event.target.value)}
                      placeholder="Enter amount"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="expenseNotes" className="mb-2 block text-sm font-semibold text-gray-700">
                      Notes (optional)
                    </label>
                    <input
                      id="expenseNotes"
                      type="text"
                      value={expenseNotes}
                      onChange={(event) => setExpenseNotes(event.target.value)}
                      placeholder="Additional information"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-600"
                    />
                  </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-gray-500">
                  Prices entered here are marked as user-entered,
                  not independently verified.
                </p>

                <button
                  type="submit"
                  className="mt-6 w-full rounded-xl bg-green-800 px-6 py-3.5 text-sm font-bold text-white hover:bg-green-900 sm:w-auto"
                >
                  Add expense to my trip
                </button>
              </form>
            )}

            <div className="mt-7 space-y-4">
              {expenses.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-[#fafbf9] px-5 py-10 text-center">
                  <h4 className="font-bold text-gray-800">
                    No additional expenses yet.
                  </h4>
                  <p className="mt-2 text-sm text-gray-500">
                    Add your transportation, accommodation, food and other expenses here.
                  </p>
                </div>
              ) : (
                expenses.map((expense) => (
                  <article
                    key={expense.id}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 p-5 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <span className="inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-800">
                        {normalizeCategory(expense.category)}
                      </span>
                      <h4 className="mt-2 font-bold text-gray-900">
                        {expense.title}
                      </h4>
                      {expense.notes && (
                        <p className="mt-1 text-sm text-gray-500">
                          {expense.notes}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-400">
                        Price status: {expense.priceStatus}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <p className="text-lg font-extrabold text-green-800">
                        {formatNaira(getExpenseAmount(expense.amount))}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeExpense(expense.id)}
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ======================================
            SAVE TRIP
        ====================================== */}

        <section className="mt-10 rounded-3xl bg-[#102f24] p-7 text-white md:p-9">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-green-300">
                Keep your plans safe
              </p>
              <h2 className="mt-2 text-2xl font-extrabold">
                Save your travel plans
              </h2>
              <p className="mt-2 text-sm leading-6 text-green-50/80">
                Save this trip's itinerary, budget and expenses.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveTrip}
              disabled={saving}
              className="rounded-xl bg-green-400 px-7 py-3.5 text-sm font-extrabold text-green-950 transition hover:bg-green-300 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save My Trip"}
            </button>
          </div>

          {saveStatus && (
            <p className={`mt-5 text-sm font-medium ${
              saveStatus.includes("successfully") ||
              saveStatus.includes("loaded")
                ? "text-green-300"
                : saveStatus.toLowerCase().includes("could not") ||
                  saveStatus.toLowerCase().includes("couldn't")
                  ? "text-red-300"
                  : "text-green-100"
            }`}>
              {saveStatus}
            </p>
          )}
        </section>

        {/* ======================================
            ITINERARY
        ====================================== */}

        <section className="mt-16">
          <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
                Your travel schedule
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
                Your itinerary
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Organise your destinations and activities day by day.
              </p>
            </div>

            <button
              type="button"
              onClick={addDay}
              className="rounded-xl bg-green-800 px-6 py-3.5 text-sm font-bold text-white hover:bg-green-900"
            >
              + Add another day
            </button>
          </div>

          {totalActivities === 0 && (
            <div className="mb-7 rounded-2xl border border-green-100 bg-green-50 p-7">
              <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                Your adventure starts here
              </p>
              <h3 className="mt-3 text-xl font-bold text-green-950">
                Your trip is waiting to be planned.
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-green-900/80">
                Visit Recommendations, discover a destination you love
                and select Add to My Trip. Your chosen destinations
                will appear here.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {days.map((day, index) => (
              <section
                key={day.id}
                className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-6 py-5 md:px-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-800 text-lg font-extrabold text-white">
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
                    {day.activities.length === 1 ? "activity" : "activities"}
                  </span>
                </div>

                <div className="p-5 md:p-8">
                  {day.activities.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-[#fafbf9] px-5 py-10 text-center">
                      <h4 className="font-bold text-gray-800">
                        Nothing planned for this day yet.
                      </h4>
                      <p className="mt-2 text-sm text-gray-500">
                        Visit Recommendations and add a destination
                        to start filling this day.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {day.activities.map((activity) => (
                        <article
                          key={activity.id}
                          className="flex flex-col gap-5 rounded-2xl border border-gray-100 p-4 sm:flex-row sm:p-5"
                        >
                          <div className="h-52 w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-green-100 to-green-200 sm:h-36 sm:w-48">
                            {activity.imageUrl ? (
                              <img
                                src={activity.imageUrl}
                                alt={activity.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-green-800">
                                Photograph unavailable
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800">
                                {activity.type}
                              </span>
                              <span className="text-xs text-gray-500">
                                {activity.time}
                              </span>
                            </div>

                            <h4 className="mt-3 text-xl font-bold text-gray-900">
                              {activity.title}
                            </h4>
                            <p className="mt-1 text-sm text-gray-500">
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

                          <div className="flex shrink-0 items-start">
                            <button
                              type="button"
                              onClick={() =>
                                removeActivity(day.id, activity.id)
                              }
                              className="rounded-lg px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
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

        <div className="mt-12 border-t border-gray-200 py-7 text-center">
          <p className="text-sm leading-6 text-gray-500">
            Your journey across Nigeria, organised in one place.
          </p>
        </div>
      </div>
    </main>
  );
}
