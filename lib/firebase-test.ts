
import { db } from "./firebase";
import {
  collection,
  getDocs,
  limit,
  query,
} from "firebase/firestore";

export async function testFirebase() {
  try {
    const q = query(collection(db, "destinations"), limit(1));
    await getDocs(q);

    console.log("Firebase connected successfully!");
    return true;
  } catch (error) {
    console.error("Firebase connection failed:", error);
    return false;
  }
}
