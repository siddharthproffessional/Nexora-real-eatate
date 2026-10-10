import type { Metadata } from "next";
import { SearchPage, searchMetadataRobots } from "@/components/search/search-page";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  return {
    title: "Properties in Dubai",
    description: "Search homes, off-plan projects and commercial space across Dubai by community, budget, bedrooms and size.",
    alternates: { canonical: "/properties" },
    robots: searchMetadataRobots(params),
  };
}

export default async function PropertiesPage({ searchParams }: Props) {
  return (
    <SearchPage
      basePath="/properties"
      title="All properties"
      intro="Homes for sale and rent, off-plan projects and commercial space across Dubai. Filter by community, budget, size and more."
      searchParams={await searchParams}
      fixed={{}}
      showCategory={true}
    />
  );
}
