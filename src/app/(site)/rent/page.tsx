import type { Metadata } from "next";
import { SearchPage, searchMetadataRobots } from "@/components/search/search-page";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  return {
    title: "Properties for rent in Dubai",
    description: "Apartments and villas for rent across Dubai. Annual rents shown in AED.",
    alternates: { canonical: "/rent" },
    robots: searchMetadataRobots(params),
  };
}

export default async function RentPage({ searchParams }: Props) {
  return (
    <SearchPage
      basePath="/rent"
      title="Properties for rent in Dubai"
      intro="Apartments and villas available on annual tenancies. Rents are shown per year in AED."
      searchParams={await searchParams}
      fixed={{ category: "rent", segment: "residential" }}
      showCategory={false}
    />
  );
}
