import type { Metadata } from "next";
import { SearchPage, searchMetadataRobots } from "@/components/search/search-page";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  return {
    title: "Off-plan projects in Dubai",
    description: "Off-plan apartments and villas in Dubai with starting prices and payment plans.",
    alternates: { canonical: "/off-plan" },
    robots: searchMetadataRobots(params),
  };
}

export default async function OffPlanPage({ searchParams }: Props) {
  return (
    <SearchPage
      basePath="/off-plan"
      title="Off-plan projects in Dubai"
      intro="New-build projects sold before completion. Prices are starting prices; payment plans are shown as supplied by the developer, and handover dates only once verified."
      searchParams={await searchParams}
      fixed={{ category: "off-plan" }}
      showCategory={false}
    />
  );
}
