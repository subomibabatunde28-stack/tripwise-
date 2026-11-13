
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const name = searchParams.get("name")?.trim();
  const state = searchParams.get("state")?.trim() || "";

  if (!name) {
    return NextResponse.json(
      { error: "Destination name is required." },
      { status: 400 }
    );
  }

  try {
    const search = `${name} ${state} Nigeria`;

    const url = new URL(
      "https://commons.wikimedia.org/w/api.php"
    );

    url.searchParams.set("action", "query");
    url.searchParams.set("generator", "search");
    url.searchParams.set("gsrsearch", search);
    url.searchParams.set("gsrnamespace", "6");
    url.searchParams.set("gsrlimit", "5");
    url.searchParams.set("prop", "imageinfo");
    url.searchParams.set(
      "iiprop",
      "url|extmetadata"
    );
    url.searchParams.set("iiurlwidth", "900");
    url.searchParams.set("format", "json");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "TripWiseTravelWebsite/1.0",
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      throw new Error("Image search failed.");
    }

    const data = await response.json();

    const pages = Object.values(
      data.query?.pages || {}
    ) as Array<{
      title: string;
      imageinfo?: Array<{
        thumburl?: string;
        url?: string;
        extmetadata?: Record<
          string,
          { value?: string }
        >;
      }>;
    }>;

    const imagePage = pages.find(
      (page) => page.imageinfo?.[0]?.thumburl
    );

    if (!imagePage) {
      return NextResponse.json({
        imageUrl: null,
        attribution: null,
        license: null,
      });
    }

    const image = imagePage.imageinfo![0];
    const metadata = image.extmetadata || {};

    return NextResponse.json({
      imageUrl: image.thumburl || image.url,
      attribution:
        metadata.Artist?.value || "Wikimedia Commons",
      license:
        metadata.LicenseShortName?.value || "See original file",
      source: image.url,
      title: imagePage.title,
    });
  } catch (error) {
    console.error("Destination image search error:", error);

    return NextResponse.json(
      { error: "Unable to find an image right now." },
      { status: 500 }
    );
  }
}
