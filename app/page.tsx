
import Link from "next/link";

const destinations = [
  {
    name: "Obudu Mountain Resort",
    location: "Cross River State",
    category: "Nature & Adventure",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1g6UGxzpioVSRcFan32JnIXyZOP5_ok2OWltJcK8DVfViLnCa5BkDDms&s=10",
    description:
      "Escape to breathtaking mountain scenery and peaceful landscapes.",
  },
  {
    name: "Olumo Rock",
    location: "Abeokuta, Ogun State",
    category: "History & Culture",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlRi7NZcCcjy0EUZHCqwBm8LRyV1qrVUTw1luZRSW0fg&s=10",
    description:
      "Discover the fascinating history behind one of Nigeria's landmarks.",
  },
  {
    name: "Lekki Conservation Centre",
    location: "Lagos State",
    category: "Wildlife & Nature",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFX1q825VYN76dvnIflXXeesiZeWJVVRdFlYl_CZ7KvA&s=10",
    description:
      "Experience beautiful greenery and an unforgettable nature escape.",
  },
];

const experiences = [
  {
    title: "Nature Escapes",
    description: "Explore waterfalls, mountains, forests and beautiful landscapes.",
  },
  {
    title: "Adventure",
    description: "Find exciting outdoor activities and unforgettable experiences.",
  },
  {
    title: "Culture & History",
    description: "Discover Nigeria's heritage, traditions and historic landmarks.",
  },
  {
    title: "Relaxation",
    description: "Find peaceful getaways, beaches and places to unwind.",
  },
];

const benefits = [
  {
    number: "01",
    title: "Discover Hidden Gems",
    description:
      "Explore famous attractions and lesser-known beautiful places across Nigeria.",
  },
  {
    number: "02",
    title: "Travel Within Budget",
    description:
      "Find destinations that suit your spending plans and travel preferences.",
  },
  {
    number: "03",
    title: "Plan Your Adventures",
    description:
      "Save favourite destinations and organise your trips in one place.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fffefa] text-gray-900">

      {/* HERO SECTION */}
      <section className="relative flex min-h-[650px] items-center overflow-hidden bg-[#102f25] text-white sm:min-h-[720px]">
        <img
          src="https://commonwealthchamber.com/wp-content/uploads/2021/07/dreamstime_xxl_183054326.jpg"
          alt="Beautiful landscape in Nigeria"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071c13]/90 via-[#071c13]/60 to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-green-400/40 bg-green-400/15 px-4 py-2 text-xs font-bold tracking-widest text-green-300 backdrop-blur-sm">
              EXPLORE THE BEAUTY OF NIGERIA
            </span>

            <h1 className="mt-7 text-5xl font-black leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl">
              Your next
              <span className="block text-green-400">adventure</span>
              starts here.
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-gray-200 sm:text-lg">
              From breathtaking landscapes to unforgettable cultural
              experiences, discover incredible destinations across Nigeria.
              Find somewhere amazing to go with TripWise.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/destinations"
                className="rounded-xl bg-green-500 px-8 py-4 text-center font-bold text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-green-400"
              >
                Explore destinations →
              </Link>

              <Link
                href="/recommendations"
                className="rounded-xl border border-white/50 bg-white/10 px-8 py-4 text-center font-bold text-white backdrop-blur-sm transition hover:bg-white hover:text-green-950"
              >
                Find my perfect trip
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-9 border-t border-white/30 pt-8">
              <div>
                <p className="text-3xl font-black text-green-400">36</p>
                <p className="mt-1 text-sm text-gray-200">States to explore</p>
              </div>
              <div>
                <p className="text-3xl font-black text-green-400">∞</p>
                <p className="mt-1 text-sm text-gray-200">Places to discover</p>
              </div>
              <div>
                <p className="text-3xl font-black text-green-400">1</p>
                <p className="mt-1 text-sm text-gray-200">Amazing Nigeria</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-extrabold uppercase tracking-[0.2em] text-green-700">
            Welcome to TripWise
          </span>

          <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
            There is so much more to discover in Nigeria.
          </h2>

          <p className="mt-6 text-base leading-8 text-gray-600">
            Beautiful landscapes, rich cultures, exciting adventures and
            peaceful escapes. TripWise makes discovering your next destination
            easier, more personal and more enjoyable.
          </p>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="bg-[#f5f7f2] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-widest text-green-700">
                Handpicked destinations
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Explore beautiful places
              </h2>

              <p className="mt-3 text-gray-600">
                Get inspired by some amazing places around Nigeria.
              </p>
            </div>

            <Link
              href="/destinations"
              className="font-bold text-green-700 hover:text-green-900"
            >
              View all destinations →
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {destinations.map((place) => (
              <article
                key={place.name}
                className="group overflow-hidden rounded-3xl bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative h-72 overflow-hidden bg-gray-200">
                  <img
                    src={place.image}
                    alt={place.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  <span className="absolute left-5 top-5 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-green-800">
                    {place.category}
                  </span>

                  <div className="absolute bottom-5 left-5 text-white">
                    <p className="text-sm font-medium text-green-200">
                      📍 {place.location}
                    </p>

                    <h3 className="mt-2 text-2xl font-extrabold">
                      {place.name}
                    </h3>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-sm leading-7 text-gray-600">
                    {place.description}
                  </p>

                  <Link
                    href="/destinations"
                    className="mt-5 inline-flex font-bold text-green-700 hover:text-green-900"
                  >
                    Discover more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCES */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-extrabold uppercase tracking-widest text-green-700">
            Your kind of adventure
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            How do you want to travel?
          </h2>

          <p className="mt-4 leading-7 text-gray-600">
            Whether you love adventure or prefer a quiet escape, there is
            something waiting for you.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {experiences.map((item) => (
            <Link
              href="/recommendations"
              key={item.title}
              className="group rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-green-200 hover:shadow-xl"
            >
              <div className="h-1.5 w-12 rounded-full bg-green-500 transition-all group-hover:w-20" />

              <h3 className="mt-7 text-xl font-extrabold">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                {item.description}
              </p>

              <p className="mt-6 font-bold text-green-700">
                Explore experience →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* PERSONALIZED RECOMMENDATIONS */}
      <section className="bg-[#103b2c] py-24 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-widest text-green-300">
              Your trip, your rules
            </p>

            <h2 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
              Not sure where to go?
              <span className="block text-green-400">
                Let TripWise help.
              </span>
            </h2>

            <p className="mt-6 max-w-xl leading-8 text-green-100/80">
              Tell us your budget, the experiences you enjoy and the state
              you want to visit. Discover destinations that match your
              travel preferences.
            </p>

            <Link
              href="/recommendations"
              className="mt-8 inline-flex rounded-xl bg-green-500 px-8 py-4 font-bold text-white transition hover:bg-green-400"
            >
              Find my recommendations →
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-8 sm:p-10">
            <h3 className="text-xl font-extrabold">
              Your perfect trip starts with:
            </h3>

            <div className="mt-8 space-y-8">
              {[
                {
                  number: "01",
                  title: "Your budget",
                  detail: "Discover places within your spending limit.",
                },
                {
                  number: "02",
                  title: "Your interests",
                  detail: "Choose the experiences you love.",
                },
                {
                  number: "03",
                  title: "Your destination",
                  detail: "Explore your preferred state or anywhere in Nigeria.",
                },
              ].map((item) => (
                <div key={item.number} className="flex items-center gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-400/15 text-lg font-extrabold text-green-300">
                    {item.number}
                  </div>

                  <div>
                    <h4 className="font-extrabold">{item.title}</h4>
                    <p className="mt-1 text-sm text-green-100/70">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY TRIPWISE */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <p className="text-sm font-extrabold uppercase tracking-widest text-green-700">
            Why choose TripWise?
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            More than just a travel guide.
          </h2>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-gray-100 bg-white p-9 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-xl font-black text-green-700">
                {item.number}
              </div>

              <h3 className="mt-6 text-xl font-extrabold">{item.title}</h3>

              <p className="mt-3 leading-7 text-gray-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#f5f7f2] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-sm font-extrabold uppercase tracking-widest text-green-700">
              Start your journey
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Three simple steps
            </h2>
          </div>

          <div className="mt-14 grid gap-7 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Discover",
                detail:
                  "Explore amazing destinations and hidden gems across Nigeria.",
              },
              {
                number: "02",
                title: "Choose",
                detail:
                  "Find places that fit your interests, travel style and budget.",
              },
              {
                number: "03",
                title: "Plan",
                detail:
                  "Save your favourite places and organise your next adventure.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="rounded-3xl bg-white p-9 shadow-sm"
              >
                <span className="text-5xl font-black text-green-700">
                  {step.number}
                </span>

                <h3 className="mt-8 text-2xl font-extrabold">
                  {step.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-green-700 px-6 py-24 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-extrabold uppercase tracking-widest text-green-200">
            Your next adventure awaits
          </p>

          <h2 className="mt-5 text-4xl font-black sm:text-6xl">
            Nigeria is waiting to be explored.
          </h2>

          <p className="mt-6 leading-8 text-green-100">
            Discover beautiful destinations, plan unforgettable experiences
            and see Nigeria from a whole new perspective.
          </p>

          <Link
            href="/destinations"
            className="mt-9 inline-flex rounded-xl bg-white px-9 py-4 font-extrabold text-green-800 shadow-lg transition hover:-translate-y-1 hover:bg-green-50"
          >
            Start exploring →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0b1d16] py-14 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="text-3xl font-black">
              Trip<span className="text-green-400">Wise</span>
            </h2>

            <p className="mt-5 max-w-xs text-sm leading-7 text-gray-400">
              Discover Nigeria. Travel your way. Find amazing destinations
              and create unforgettable memories.
            </p>
          </div>

          <div>
            <h3 className="font-extrabold">Explore</h3>

            <div className="mt-5 flex flex-col gap-4 text-sm text-gray-400">
              <Link href="/destinations" className="hover:text-green-400">
                Destinations
              </Link>
              <Link href="/recommendations" className="hover:text-green-400">
                Recommendations
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-extrabold">Your Trips</h3>

            <div className="mt-5 flex flex-col gap-4 text-sm text-gray-400">
              <Link href="/planner" className="hover:text-green-400">
                Plan a Trip
              </Link>
              <Link href="/my-trips" className="hover:text-green-400">
                My Trips
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-extrabold">Start Exploring</h3>

            <p className="mt-5 text-sm leading-7 text-gray-400">
              Your next Nigerian adventure could be closer than you think.
            </p>

            <Link
              href="/destinations"
              className="mt-4 inline-block font-bold text-green-400 hover:text-green-300"
            >
              Explore now →
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 px-6 pt-7 text-center text-sm text-gray-500">
          © 2026 TripWise. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
