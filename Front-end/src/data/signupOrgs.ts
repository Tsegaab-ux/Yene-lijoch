export type Organization = {
  id: number;
  name: string;
  city: string;
};

export type OrgPerson = {
  id: number;
  first_name: string;
  last_name: string;
  organization: number;
};

export const MOCK_ORGANIZATIONS: Organization[] = [
  { id: 1, name: "Sunrise Sunday School", city: "Addis Ababa" },
  { id: 2, name: "Hope Kids Church", city: "Bahir Dar" },
  { id: 3, name: "Yene Lijoch Academy", city: "Addis Ababa" },
  { id: 4, name: "Grace Family Center", city: "Hawassa" },
  { id: 5, name: "Light of Life School", city: "Mekelle" },
  { id: 6, name: "Faith Children's Hub", city: "Dire Dawa" },
];

export const MOCK_ORG_PEOPLE: OrgPerson[] = [
  // Sunrise
  { id: 7, first_name: "Kal", last_name: "Bekele", organization: 1 },
  { id: 8, first_name: "Amara", last_name: "Bekele", organization: 1 },
  { id: 9, first_name: "Yonas", last_name: "Tadesse", organization: 1 },
  { id: 10, first_name: "Hanna", last_name: "Abebe", organization: 1 },
  // Hope Kids
  { id: 11, first_name: "Dawit", last_name: "Mekonnen", organization: 2 },
  { id: 12, first_name: "Sara", last_name: "Hailu", organization: 2 },
  { id: 13, first_name: "Liya", last_name: "Girma", organization: 2 },
  // Yene Lijoch Academy
  { id: 14, first_name: "Abel", last_name: "Kebede", organization: 3 },
  { id: 15, first_name: "Naomi", last_name: "Assefa", organization: 3 },
  { id: 16, first_name: "Elias", last_name: "Worku", organization: 3 },
  { id: 17, first_name: "Ruth", last_name: "Tesfaye", organization: 3 },
  { id: 18, first_name: "Miki", last_name: "Solomon", organization: 3 },
  // Grace
  { id: 19, first_name: "Bethel", last_name: "Alemu", organization: 4 },
  { id: 20, first_name: "Samuel", last_name: "Desta", organization: 4 },
  // Light of Life
  { id: 21, first_name: "Helen", last_name: "Gebre", organization: 5 },
  { id: 22, first_name: "Jonas", last_name: "Berhanu", organization: 5 },
  { id: 23, first_name: "Marta", last_name: "Fikadu", organization: 5 },
  // Faith
  { id: 24, first_name: "Kidus", last_name: "Negash", organization: 6 },
  { id: 25, first_name: "Selam", last_name: "Yilma", organization: 6 },
];

export function searchOrganizations(query: string): Organization[] {
  const q = query.trim().toLowerCase();
  if (!q) return MOCK_ORGANIZATIONS;
  return MOCK_ORGANIZATIONS.filter(
    (org) =>
      org.name.toLowerCase().includes(q) || org.city.toLowerCase().includes(q)
  );
}

export function getOrganization(id: number): Organization | undefined {
  return MOCK_ORGANIZATIONS.find((o) => o.id === id);
}

export function getPeopleForOrganization(orgId: number): OrgPerson[] {
  return MOCK_ORG_PEOPLE.filter((p) => p.organization === orgId);
}

export function personFullName(person: OrgPerson): string {
  return `${person.first_name} ${person.last_name}`;
}
