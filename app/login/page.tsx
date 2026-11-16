
"use client";

import { useState, type FormEvent } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  linkWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (isSignUp) {
        const currentUser = auth.currentUser;

        if (currentUser?.isAnonymous) {
          const credential = EmailAuthProvider.credential(
            email,
            password
          );

          await linkWithCredential(currentUser, credential);
        } else {
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
        }
      } else {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }

      router.push("/");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };

      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          setError("This email already has an account. Please log in.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/weak-password":
          setError("Your password must contain at least 6 characters.");
          break;
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          setError("Incorrect email or password.");
          break;
        case "auth/credential-already-in-use":
          setError("This email already belongs to another account.");
          break;
        default:
          setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset instructions have been sent to your email.");
    } catch {
      setError("Unable to send reset email. Please check your email address.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F3F7F3] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10">

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-3xl"></span>
            <h1 className="text-3xl font-bold text-[#16834A]">
              TripWise
            </h1>
          </div>

          <h2 className="text-3xl font-bold text-[#172D22] mb-2">
            {isSignUp ? "Create Your Account" : "Welcome Back!"}
          </h2>

          <p className="text-gray-500">
            {isSignUp
              ? "Start planning your next Nigerian adventure."
              : "Log in to your TripWise account."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-[#16834A] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-16 text-gray-800 outline-none focus:ring-2 focus:ring-[#16834A] focus:border-transparent"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#16834A] font-semibold"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {!isSignUp && (
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-[#16834A] font-semibold hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}

          {message && (
            <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#16834A] hover:bg-[#116B3B] disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading
              ? "Please wait..."
              : isSignUp
              ? "Create Account"
              : "Log In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-7">
          {isSignUp
            ? "Already have an account?"
            : "Don't have an account?"}{" "}

          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setMessage("");
            }}
            className="text-[#16834A] font-bold hover:underline"
          >
            {isSignUp ? "Log In" : "Sign Up"}
          </button>
        </p>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sm text-gray-500 hover:text-[#16834A]"
          >
            ← Back to Home
          </button>
        </div>

      </div>
    </main>
  );
}
