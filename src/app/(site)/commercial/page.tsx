import type { Metadata } from "next";
import { SearchPage, searchMetadataRobots } from "@/components/search/search-page";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  return {
    title: "Commercial property in Dubai",
    description: "Offices and retail units for sale and rent in Dubai's business districts.",
    alternates: { canonical: "/commercial" },
    robots: searchMetadataRobots(params),
  };
}

export default async function CommercialPage({ searchParams }: Props) {
  return (
    <SearchPage
      basePath="/commercial"
      title="Commercial property in Dubai"
      intro="Offices and retail units for sale and lease in Business Bay, Downtown Dubai and Dubai Marina."
      searchParams={await searchParams}
      fixed={{ segment: "commercial" }}
      showCategory={true}
    />
  );
}
