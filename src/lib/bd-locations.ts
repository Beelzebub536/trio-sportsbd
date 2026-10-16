// Static list of the 8 administrative divisions of Bangladesh and their districts.
// Used by the checkout address form (division -> district selects, upazila as free text).

export type Division = {
  name: string;
  districts: string[];
};

export const bdDivisions: Division[] = [
  {
    name: "Barishal",
    districts: [
      "Barguna",
      "Barishal",
      "Bhola",
      "Jhalokati",
      "Patuakhali",
      "Pirojpur",
    ],
  },
  {
    name: "Chattogram",
    districts: [
      "Bandarban",
      "Brahmanbaria",
      "Chandpur",
      "Chattogram",
      "Cumilla",
      "Cox's Bazar",
      "Feni",
      "Khagrachhari",
      "Lakshmipur",
      "Noakhali",
      "Rangamati",
    ],
  },
  {
    name: "Dhaka",
    districts: [
      "Dhaka",
      "Faridpur",
      "Gazipur",
      "Gopalganj",
      "Kishoreganj",
      "Madaripur",
      "Manikganj",
      "Munshiganj",
      "Narayanganj",
      "Narsingdi",
      "Rajbari",
      "Shariatpur",
      "Tangail",
    ],
  },
  {
    name: "Khulna",
    districts: [
      "Bagerhat",
      "Chuadanga",
      "Jashore",
      "Jhenaidah",
      "Khulna",
      "Kushtia",
      "Magura",
      "Meherpur",
      "Narail",
      "Satkhira",
    ],
  },
  {
    name: "Mymensingh",
    districts: ["Jamalpur", "Mymensingh", "Netrokona", "Sherpur"],
  },
  {
    name: "Rajshahi",
    districts: [
      "Bogura",
      "Chapainawabganj",
      "Joypurhat",
      "Naogaon",
      "Natore",
      "Pabna",
      "Rajshahi",
      "Sirajganj",
    ],
  },
  {
    name: "Rangpur",
    districts: [
      "Dinajpur",
      "Gaibandha",
      "Kurigram",
      "Lalmonirhat",
      "Nilphamari",
      "Panchagarh",
      "Rangpur",
      "Thakurgaon",
    ],
  },
  {
    name: "Sylhet",
    districts: ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"],
  },
];

/** Division names only, in official order. */
export const divisions: string[] = bdDivisions.map((d) => d.name);

/** Map of division name -> district names. */
export const districtsByDivision: Record<string, string[]> = Object.fromEntries(
  bdDivisions.map((d) => [d.name, d.districts]),
);

/** Return the districts for a division, or an empty list for an unknown name. */
export function getDistricts(division: string): string[] {
  return districtsByDivision[division] ?? [];
}

export const isDivision = (value: string): boolean =>
  bdDivisions.some((d) => d.name === value);

export const isDistrictOf = (division: string, district: string): boolean =>
  getDistricts(division).includes(district);
