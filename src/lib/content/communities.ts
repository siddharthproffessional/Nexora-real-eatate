import type { Community } from "@/lib/domain/types";
import { communityPhotos, type Photo } from "@/config/media";

/**
 * Community guides. Editorial, qualitative content only — no prices, yields or statistics.
 * Coordinates are approximate community centres used for map embeds.
 * Freehold status reflects designated freehold areas for non-UAE nationals; confirm with the
 * Dubai Land Department before publishing.
 */
export const communities: Community[] = [
  {
    slug: "downtown-dubai",
    name: "Downtown Dubai",
    intro: "High-rise living around Burj Khalifa, The Dubai Mall and the Boulevard.",
    overview: [
      "Downtown Dubai is the city's most recognisable address, built around Burj Khalifa, The Dubai Mall and the Dubai Fountain. Residential towers line the Boulevard, with Dubai Opera and a dense cluster of restaurants and hotels a short walk away.",
      "Most homes are apartments in high-rise towers, from compact one-bedrooms to full-floor penthouses, alongside a lower-rise district of mid-rise buildings. Buyers here typically value walkability, skyline views and proximity to the business districts of DIFC and Business Bay.",
    ],
    highlights: [
      "Walking distance to The Dubai Mall and Dubai Opera",
      "Metro access along Sheikh Zayed Road",
      "Neighbouring DIFC and Business Bay for commuting professionals",
      "Strong short-stay and long-let demand from visitors and professionals",
    ],
    propertyStyles: ["Apartments", "Penthouses", "Serviced residences"],
    location: { lat: 25.195, lng: 55.276 },
    freehold: true,
  },
  {
    slug: "dubai-marina",
    name: "Dubai Marina",
    intro: "Waterfront towers around a man-made marina, steps from the beach.",
    overview: [
      "Dubai Marina is a waterfront district built around a man-made canal lined with residential towers, yacht berths and the Marina Walk promenade. Jumeirah Beach Residence and the beach sit on its seaward edge.",
      "The community is almost entirely apartments, with a wide range of sizes and finishes. It is popular with professionals and families who want a lively, walkable neighbourhood with the Dubai Metro and Dubai Tram on the doorstep.",
    ],
    highlights: [
      "Marina Walk promenade with cafés and restaurants",
      "Beach access at JBR",
      "Served by the Dubai Metro and Dubai Tram",
      "Established rental market with a broad tenant base",
    ],
    propertyStyles: ["Apartments", "Penthouses", "Duplexes"],
    location: { lat: 25.08, lng: 55.14 },
    freehold: true,
  },
  {
    slug: "palm-jumeirah",
    name: "Palm Jumeirah",
    intro: "Beachfront villas on the fronds and sea-view apartments along the trunk.",
    overview: [
      "Palm Jumeirah is the palm-shaped island off the Jumeirah coastline. Apartment buildings and hotels line the trunk, private villas with beach frontage sit along the fronds, and resorts occupy the crescent.",
      "It attracts buyers looking for private beach access and resort-style amenities. Villa inventory on the fronds is finite, which is one reason the island is closely watched by international buyers.",
    ],
    highlights: [
      "Private beach frontage on many villa plots",
      "Resort, dining and beach club amenities",
      "Palm Monorail connecting the trunk to the mainland",
      "Limited villa supply on the fronds",
    ],
    propertyStyles: ["Villas", "Apartments", "Penthouses", "Branded residences"],
    location: { lat: 25.112, lng: 55.138 },
    freehold: true,
  },
  {
    slug: "business-bay",
    name: "Business Bay",
    intro: "Canal-side towers mixing offices and apartments next to Downtown.",
    overview: [
      "Business Bay is a mixed-use district along the Dubai Water Canal, directly beside Downtown Dubai. Office towers, hotels and residential buildings share the waterfront, with a canal-side boardwalk running through the area.",
      "It suits buyers and tenants who want city-centre access at a range of price points, and companies looking for office space close to Downtown and Sheikh Zayed Road.",
    ],
    highlights: [
      "Dubai Water Canal boardwalk",
      "Office and residential towers side by side",
      "Next to Downtown Dubai and Sheikh Zayed Road",
      "Wide choice of apartment sizes and office floor plates",
    ],
    propertyStyles: ["Apartments", "Offices", "Retail"],
    location: { lat: 25.186, lng: 55.264 },
    freehold: true,
  },
  {
    slug: "dubai-hills-estate",
    name: "Dubai Hills Estate",
    intro: "A master-planned green community with a championship golf course and central park.",
    overview: [
      "Dubai Hills Estate is a master-planned community between Downtown Dubai and Dubai Marina, organised around an 18-hole championship golf course, a central park network and Dubai Hills Mall.",
      "It offers a mix of villas, townhouses and low- and mid-rise apartments, and is a frequent choice for families who want green space, schools and healthcare within the community.",
    ],
    highlights: [
      "Championship golf course and landscaped parks",
      "Dubai Hills Mall within the community",
      "Schools and healthcare facilities nearby",
      "Central location between Downtown and the Marina",
    ],
    propertyStyles: ["Villas", "Townhouses", "Apartments"],
    location: { lat: 25.104, lng: 55.243 },
    freehold: true,
  },
  {
    slug: "dubai-creek-harbour",
    name: "Dubai Creek Harbour",
    intro: "A developing waterfront district on the creek, facing the Downtown skyline.",
    overview: [
      "Dubai Creek Harbour is a large waterfront development on the banks of Dubai Creek, next to the Ras Al Khor Wildlife Sanctuary. Many towers look across the water to the Downtown skyline.",
      "The district is still being built out in phases, so it features prominently in off-plan sales. Buyers should review each project's construction progress and registration details carefully.",
    ],
    highlights: [
      "Creek-front promenades and skyline views",
      "Next to the Ras Al Khor Wildlife Sanctuary",
      "Active off-plan launches across several phases",
      "Road links to Downtown Dubai and Dubai International Airport",
    ],
    propertyStyles: ["Apartments", "Off-plan residences", "Townhouses"],
    location: { lat: 25.203, lng: 55.345 },
    freehold: true,
  },
  {
    slug: "jumeirah-village-circle",
    name: "Jumeirah Village Circle",
    intro: "Low-rise apartments and townhouses around neighbourhood parks.",
    overview: [
      "Jumeirah Village Circle, usually called JVC, is a circular community of low- and mid-rise apartment buildings, townhouses and villas arranged around neighbourhood parks.",
      "It is one of the city's more accessible entry points for first-time buyers and investors, with a large and active rental market.",
    ],
    highlights: [
      "Accessible entry prices compared with waterfront districts",
      "Neighbourhood parks and community retail",
      "Road links to Al Khail Road and Sheikh Mohammed Bin Zayed Road",
      "Broad tenant base for apartments",
    ],
    propertyStyles: ["Apartments", "Townhouses", "Villas"],
    location: { lat: 25.06, lng: 55.209 },
    freehold: true,
  },
  {
    slug: "arabian-ranches",
    name: "Arabian Ranches",
    intro: "An established villa community with a golf club and family amenities.",
    overview: [
      "Arabian Ranches is a mature villa and townhouse community off Al Qudra Road, with landscaped streets, a golf club, schools and a community retail centre.",
      "It is a long-standing choice for families who want a private garden and an established neighbourhood rather than a high-rise address.",
    ],
    highlights: [
      "Villas and townhouses with private gardens",
      "Golf club and equestrian heritage",
      "Schools and community retail within the area",
      "Established, mature landscaping",
    ],
    propertyStyles: ["Villas", "Townhouses"],
    location: { lat: 25.05, lng: 55.272 },
    freehold: true,
  },
];

export function getCommunity(slug: string) {
  return communities.find((c) => c.slug === slug) ?? null;
}

export function getCommunityName(slug: string | null | undefined) {
  if (!slug) return null;
  return getCommunity(slug)?.name ?? slug;
}

export function getCommunityPhoto(slug: string): Photo {
  return communityPhotos[slug as keyof typeof communityPhotos] ?? communityPhotos["downtown-dubai"];
}

/** Communities shown on the homepage discovery index, in display order. */
export const featuredCommunitySlugs = ["downtown-dubai", "dubai-marina", "palm-jumeirah", "business-bay", "dubai-hills-estate", "dubai-creek-harbour"];
