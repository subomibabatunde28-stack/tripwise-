
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname() || "/";

  const isPublicPage = pathname === "/" || pathname === "/login";

  const [checking, setChecking] = useState(!isPublicPage);

  useEffect(() => {
    if (isPublicPage) {
      setChecking(false);
      return;
    }

    setChecking(true);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || user.isAnonymous) {
        const next = encodeURIComponent(pathname);
        router.replace(`/login?next=${next}`);
      } else {
        setChecking(false);
      }
    });

    return () => unsubscribe();
  }, [pathname, router, isPublicPage]);

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9f6]">
        <p className="text-gray-600">Checking your account...</p>
      </div>
    );
  }

  return <>{children}</>;
}
