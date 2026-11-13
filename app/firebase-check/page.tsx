
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  limit,
  query,
} from "firebase/firestore";

export default function FirebaseCheck() {
  const [status, setStatus] = useState("Checking Firebase...");

  useEffect(() => {
    async function checkConnection() {
      try {
        const q = query(
          collection(db, "destinations"),
          limit(1)
        );

        await getDocs(q);

        setStatus("Firebase connected successfully!");
      } catch (error) {
        console.error(error);
        setStatus("Firebase connection failed. Check your configuration and security rules.");
      }
    }

    checkConnection();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="p-8 rounded-xl shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">
          Tripwise Firebase Test
        </h1>

        <p>{status}</p>
      </div>
    </main>
  );
}
