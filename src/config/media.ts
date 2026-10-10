/**
 * Photography used by the demonstration site.
 *
 * All images are free-to-use photographs from Unsplash (https://unsplash.com/license), hot-linked from the
 * Unsplash CDN and resized by the custom loader in src/lib/media/image-loader.ts.
 * Replace them with the company's own licensed photography before launch — community imagery in particular
 * is illustrative and should be swapped for verified photography of each area.
 */

export interface Photo {
  src: string;
  alt: string;
  credit: string;
}

const unsplash = (id: string, alt: string, credit: string): Photo => ({
  src: `https://images.unsplash.com/photo-${id}`,
  alt,
  credit,
});

export const heroPhoto = unsplash("1634007626524-f47fa37810a7", "Burj Khalifa rising above the illuminated Downtown Dubai skyline at night", "Ahmed Aldaie");

export const pagePhotos = {
  about: unsplash("1719474818087-f334f1e92985", "Rooftop view across Dubai's high-rise skyline", "Nisha Vastu"),
  sell: unsplash("1741380530342-10f7b1214eeb", "Dubai skyline framed by an archway at sunset", "Tommaso Delton"),
  consultation: unsplash("1616594039964-ae9021a400a0", "Bedroom with an upholstered bed, chandelier and city view", "Spacejoy"),
  contact: unsplash("1510665724063-f77a01074aa2", "Burj Khalifa illuminated against the night sky", "Clay Banks"),
  insights: unsplash("1607414851776-f2fcc379fb48", "City skyline across the water at sunset", "Karen Dalton"),
  offPlan: unsplash("1706855203772-c249b75fe016", "Architectural visualisation of a modern villa with a pool", "Salman Saqib"),
  login: unsplash("1612873649383-edf91f1cf7fe", "City skyline at night", "Ishan @seefromthesky"),
} satisfies Record<string, Photo>;

export const communityPhotos = {
  "downtown-dubai": unsplash("1651467606797-e1c660cf3fda", "Burj Khalifa above the Downtown Dubai skyline under storm clouds", "Ahmed Aldaie"),
  "dubai-marina": unsplash("1686048075764-996b3c825d7b", "Marina berths lined with yachts beside residential towers", "dara"),
  "palm-jumeirah": unsplash("1634148551170-d37d021e0cc9", "Resort architecture on the Palm Jumeirah crescent with palm trees", "Faisal Manga"),
  "business-bay": unsplash("1721804222969-e15023a77eef", "Aerial view of high-rise towers in a business district", "Nelemson Guevarra"),
  "dubai-hills-estate": unsplash("1745761320791-5ae142edee8c", "Contemporary villa set among palm trees", "Tim Schmidbauer"),
  "dubai-creek-harbour": unsplash("1706798636338-5d3a527412dc", "Dubai skyline seen across the creek waters", "Shifan Hassan"),
  "jumeirah-village-circle": unsplash("1615747476328-41153cf6da54", "White residential building under a clear blue sky", "Ismail Merad"),
  "arabian-ranches": unsplash("1613977257365-aaae5a9817ff", "White villa with a private swimming pool", "John Fornander"),
} satisfies Record<string, Photo>;

/** Interior and exterior photography used across demo listings. */
export const listingPhotos = {
  towerWhite: unsplash("1582672060674-bc2bd808a8b5", "White high-rise residential tower under a blue sky", "Wael Hneini"),
  towerWater: unsplash("1580674684081-7617fbf3d745", "High-rise towers beside the water", "Wael Hneini"),
  towerSea: unsplash("1611577810610-642f8ac05c32", "High-rise buildings near the sea", "Emma Harrisova"),
  towersGroup: unsplash("1719474814929-2c94d3bc308a", "Group of residential towers", "Nisha Vastu"),
  towerPool: unsplash("1524234599372-a5bd0194758d", "Residential towers beside a pool deck", "Nick Fewings"),
  towerPalm: unsplash("1583759604327-f9dcd23499d5", "White building beside palm trees", "Nick Fewings"),
  nightView: unsplash("1739900292622-a7f860175aad", "City lights seen from the top of a tower at night", "Nejc Soklič"),
  skyView: unsplash("1652707228067-25672fa0b082", "Night view over the city from a skyscraper", "PhotoHound"),
  emptyRoomCity: unsplash("1719474815388-03fdde90a9f8", "Empty room with floor-to-ceiling windows and city views", "Nisha Vastu"),
  emptyRoomSea: unsplash("1707484687082-9493754d389f", "Empty room with a view of the sea", "Vangel Dimo"),

  livingWindows: unsplash("1757924461488-ef9ad0670978", "Living room with large windows and lounge seating", "Aalo Lens"),
  livingElegant: unsplash("1758448755952-42b404bc6f39", "Living room with tailored furniture and decor", "Aalo Lens"),
  livingGlass: unsplash("1568115286680-d203e08a8be6", "Living area with full-height glazing", "Moritz Bruder"),
  livingCondo: unsplash("1565623833408-d77e39b88af6", "Open-plan apartment living space", "Mostafa Safadel"),
  livingBeige: unsplash("1560448204-e02f11c3d0e2", "Living room with a beige sofa and armchair", "Francesca Tosolini"),
  livingKalaman: unsplash("1699225741963-5e8e15e40719", "Living room with large windows", "Kalaman"),
  livingOpen: unsplash("1680416124510-5eae1beca412", "Open-plan living room and kitchen", "Christian"),
  livingWindow2: unsplash("1666585607888-3f6fe0b323d8", "Living room with a large window", "S.Group"),

  bedroomChandelier: unsplash("1617098900591-3f90928e8c54", "Bedroom with a crystal chandelier and dark bedside tables", "Spacejoy"),
  bedroomCity: unsplash("1616594039964-ae9021a400a0", "Bedroom with an upholstered bed and city view", "Spacejoy"),
  bedroomTufted: unsplash("1505693416388-ac5ce068fe85", "Bedroom with a tufted headboard", "Quilia"),
  bedroomBlue: unsplash("1566665797739-1674de7a421a", "Bedroom with an upholstered headboard and wooden blinds", "mark champs"),
  bedroomGrey: unsplash("1560185893-a55cbc8c57e8", "Bedroom with dark walls and a large bed", "Francesca Tosolini"),

  kitchenMarble: unsplash("1683629357963-adf2b1fa9ad9", "Kitchen with marble worktops and white cabinetry", "Brian Zajac"),
  kitchenIsland: unsplash("1686056040167-1e3dead46d9a", "Large kitchen with a central island and bar stools", "Brian Zajac"),
  kitchenSteel: unsplash("1639405069836-f82aa6dcb900", "Kitchen with stainless steel appliances and marble worktops", "Lotus Design N Print"),
  kitchenBar: unsplash("1632583824020-937ae9564495", "Modern kitchen with a breakfast bar", "Kam Idris"),
  kitchenWindow: unsplash("1719474815671-08411b0ea840", "Kitchen with a large window", "Nisha Vastu"),
  bathroom: unsplash("1719474818095-2d75b8b57251", "Bathroom with a large mirror and vanity", "Nisha Vastu"),

  villaPool: unsplash("1613977257365-aaae5a9817ff", "White villa with a private swimming pool", "John Fornander"),
  villaInfinity: unsplash("1543489822-c49534f3271f", "Infinity pool overlooking the bay", "big.tiny.belly"),
  villaGolden: unsplash("1544984243-ec57ea16fe25", "Pool beside a house at golden hour", "Roberto Nickson"),
  villaStone: unsplash("1722421492323-eaf9c401befe", "Three-storey villa with stone cladding at dusk", "Naksha Banwao"),
  villaBalconies: unsplash("1721815693498-cc28507c0ba2", "Two-storey villa with balconies", "Naksha Banwao"),
  villaPalms: unsplash("1745761320791-5ae142edee8c", "Contemporary villa among palm trees", "Tim Schmidbauer"),
  villaWhiteBrown: unsplash("1602343168117-bb8ffe3e2e9f", "White villa beside a swimming pool", "Alejandra Cifre González"),
  villaWindows: unsplash("1719887805632-de5be825f72b", "House with large windows and palm trees", "Jusuf Bachtiar"),
  renderVilla: unsplash("1706855203772-c249b75fe016", "Architectural visualisation of a modern villa with a pool", "Salman Saqib"),
  renderPergola: unsplash("1686164748261-33e13eef70b6", "Architectural visualisation of a modern house with a pergola roof", "Salman Saqib"),

  officeHall: unsplash("1497366216548-37526070297c", "Office hallway with timber and glass partitions", "Nastuh Abootalebi"),
  officeDining: unsplash("1497366811353-6870744d04b2", "Office breakout space with a dining table", "Nastuh Abootalebi"),
  officeConference: unsplash("1706074793638-da28b90ea8ae", "Conference room with a long table", "Hammer Group"),
  officeMeeting: unsplash("1706074740295-d7a79c079562", "Glass-walled meeting room", "Hammer Group"),
  officeOpen: unsplash("1631193816258-28b44b21e78b", "Open-plan office with rows of desks", "Petr"),
  officeGlass: unsplash("1497366754035-f200968a6e72", "Hallway between glass-panel doors", "Nastuh Abootalebi"),
} satisfies Record<string, Photo>;

export const insightPhotos = {
  market: unsplash("1741380530342-10f7b1214eeb", "Dubai skyline framed by an archway at sunset", "Tommaso Delton"),
  community: unsplash("1686048075764-996b3c825d7b", "Marina berths lined with yachts beside residential towers", "dara"),
  firstTime: unsplash("1758448755952-42b404bc6f39", "Living room with tailored furniture and decor", "Aalo Lens"),
  investing: unsplash("1526495124232-a04e1849168c", "Architectural detail of high-rise buildings", "Ryan Miglinczy"),
  rentVsBuy: unsplash("1680416124510-5eae1beca412", "Open-plan living room and kitchen", "Christian"),
  ownership: unsplash("1564005991505-41c5fd1cdb71", "High-rise buildings in daylight", "laura Shaw"),
} satisfies Record<string, Photo>;
