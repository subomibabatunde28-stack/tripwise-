
import DestinationClient from "./DestinationClient";

export default async function DestinationDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <DestinationClient slug={slug} />;
}
