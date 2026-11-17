
import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import AuthGuard from "./components/AuthGuard";
import { TripProvider } from "./context/TripContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TripWise",
  description:
    "Discover beautiful destinations in Nigeria and plan your next trip with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TripProvider>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>

          <Suspense fallback={null}>
            <AuthGuard>{children}</AuthGuard>
          </Suspense>
        </TripProvider>
      </body>
    </html>
  );
}
