"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getDestinationBySlug,
  getActivitiesByDestinationSlug,
  Destination,
  Activity,
} from "@/lib/destinations";

function DestinationContent() {
  const params = useParams();
  const slug = params.slug as string;

  const [destination, setDestination] =
    useState<Destination | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDestination() {
      try {
        setLoading(true);
        const data = await getDestinationBySlug(slug);
setDestination(data);
const activityData = await getActivitiesByDestinationSlug(slug);
setActivities(activityData);
      } catch (err) {
        console.error(err);
        setError("Unable to load this destination.");
      } finally {
        setLoading(false);
      }
    }

    loadDestination();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading destination...</p>
      </main>
    );
  }

  if (error || !destination) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500">
          {error || "Destination not found."}
        </p>
        <Link href="/destinations" className="mt-5 text-green-700 font-semibold">
          Back to destinations
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/destinations"
          className="text-green-700 font-semibold hover:underline"
        >
          ← Back to destinations
        </Link>

        {destination.imageUrl ? (
          <img
            src={destination.imageUrl}
            alt={destination.name}
            className="w-full h-96 object-cover rounded-2xl mt-8"
          />
        ) : (
          <div className="w-full h-96 bg-green-100 rounded-2xl mt-8 flex items-center justify-center">
            Destination image coming soon
          </div>
        )}

        <div className="mt-8">
          <span className="text-green-700 font-semibold">
            {destination.category}
          </span>

          <h1 className="text-4xl font-bold text-gray-900 mt-2">
            {destination.name}
          </h1>

          <p className="text-gray-500 mt-2 text-lg">
            {destination.state}, Nigeria
          </p>

          <p className="text-gray-700 mt-6 text-lg leading-8">
            {destination.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-bold text-gray-900">Estimated Cost</h2>
              <p className="text-green-700 text-2xl font-bold mt-2">
                ₦{destination.estimatedCost.toLocaleString()}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-bold text-gray-900">Best Time to Visit</h2>
              <p className="text-gray-700 text-lg mt-2">
                {destination.bestTimeToVisit || "Not specified"}
              </p>
            </div>
          </div>
        </div>
                <section className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Things to Do
          </h2>

          {activities.length === 0 ? (
            <p className="text-gray-600">
              No activities available yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white p-6 rounded-xl shadow"
                >
                  <h3 className="text-xl font-bold text-gray-900">
                    {activity.name}
                  </h3>

                  <p className="text-gray-600 mt-3">
                    {activity.description}
                  </p>

                  <p className="text-green-700 font-semibold mt-4">
                    Estimated cost: ₦
                    {(activity.estimatedCost ?? 0).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function DestinationDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p>Loading destination...</p>
        </main>
      }
    >
      <DestinationContent />
    </Suspense>
  );
}