import type { Metadata } from "next";
import { SearchPage, searchMetadataRobots } from "@/components/search/search-page";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  return {
    title: "Properties for sale in Dubai",
    description: "Apartments, villas, townhouses and penthouses for sale across Dubai's leading communities.",
    alternates: { canonical: "/buy" },
    robots: searchMetadataRobots(params),
  };
}

export default async function BuyPage({ searchParams }: Props) {
  return (
    <SearchPage
      basePath="/buy"
      title="Properties for sale in Dubai"
      intro="Ready apartments, villas, townhouses and penthouses across Dubai's established communities. Prices exclude transfer and agency fees — ask an advisor for the full cost of buying."
      searchParams={await searchParams}
      fixed={{ category: "sale", segment: "residential" }}
      showCategory={false}
    />
  );
}
