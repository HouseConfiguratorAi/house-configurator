export interface BedrijfInfo {
  naam: string;
  adres: string;
  postcode: string;
  stad: string;
  telefoon: string;
  email: string;
  website: string;
  btwNummer: string;
  kvkNummer: string;
  ibanNummer: string;
}

export interface KlantInfo {
  naam: string;
  adres: string;
  postcode: string;
  stad: string;
  telefoon: string;
  email: string;
}

export interface OfferteRegel {
  id: string;
  omschrijving: string;
  detail: string;
  eenheid: string;
  aantal: number;
  prijs: number;
  btw: number; // percentage
}

export interface Offerte {
  nummer: string;
  datum: string;
  geldigTot: string;
  bedrijf: BedrijfInfo;
  klant: KlantInfo;
  regels: OfferteRegel[];
  notities: string;
  betalingstermijn: string;
  extraVoorwaarden: string;
}
