// Icones SVG illustratives pour les categories de la plateforme.
// Dessinees specifiquement pour FITAHIANTSOA plutot que d'utiliser des emojis generiques.
// Chaque icone est un mini-pictogramme en deux tons (terre cuite / vert riziere) coherent avec le design system.

const MOTOCULTEUR = (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Motoculteur stylise, simplifie pour rester lisible en petit format */}
    <circle cx="20" cy="46" r="9" stroke="currentColor" strokeWidth="4" />
    <circle cx="20" cy="46" r="2.5" fill="currentColor" />
    <rect x="13" y="20" width="24" height="15" rx="3" stroke="currentColor" strokeWidth="4" />
    <path d="M20 35V40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <path d="M37 26H47C49 26 50 27.5 50 29.5V35" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <path d="M31 20V11C31 9.5 32 8.5 33.5 8.5H40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <path d="M37 38L43 50H29L37 38Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);

const GOUTTE_IRRIGATION = (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Goutte d'eau + tuyau, pour irrigation */}
    <path d="M32 8C32 8 20 26 20 38C20 47.5 25.5 54 32 54C38.5 54 44 47.5 44 38C44 26 32 8 32 8Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
    <path d="M26 40C26 44 28.5 47 32 47" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
  </svg>
);

const CLE_OUTILLAGE = (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Cle a molette + tournevis croises : outillage */}
    <path d="M14 50L34 30" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M28 16C24 12 18 12 14 16C10 20 10 26 14 30C18 34 24 34 28 30C30.5 27.5 31.5 24 30.5 21" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <path d="M30 34L50 14" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M44 8L56 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <path d="M50 14L56 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const STETHOSCOPE = (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Stethoscope stylise */}
    <path d="M20 10V28C20 35 25.5 40 32 40C38.5 40 44 35 44 28V10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M20 16H14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M44 16H50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M32 40V48" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <circle cx="32" cy="54" r="6" stroke="currentColor" strokeWidth="3" />
    <circle cx="14" cy="13" r="3" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="50" cy="13" r="3" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

const BOITE_GENERIQUE = (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Boite/colis generique */}
    <path d="M10 22L32 12L54 22V44L32 54L10 44V22Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    <path d="M10 22L32 32L54 22" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    <path d="M32 32V54" stroke="currentColor" strokeWidth="3" />
    <path d="M21 17L43 27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
  </svg>
);

const BOUSSOLE_TOURISME = (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Boussole stylisee : exploration et circuits touristiques */}
    <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="4" />
    <path d="M32 14V19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    <path d="M32 45V50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    <path d="M14 32H19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    <path d="M45 32H50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    <path d="M40 24L34 34L24 40L30 30L40 24Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12" />
  </svg>
);

export const CATEGORY_ICON_SVG = {
  'equipements-ruraux': MOTOCULTEUR,
  irrigation: GOUTTE_IRRIGATION,
  outillage: CLE_OUTILLAGE,
  'materiel-medical': STETHOSCOPE,
  tourisme: BOUSSOLE_TOURISME,
  autres: BOITE_GENERIQUE,
};
