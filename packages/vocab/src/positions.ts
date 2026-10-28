/**
 * Film crew positions, grouped by department. US titles, with the German ones many of OpenClapper's
 * first users know as search aliases (the owner worked in the German system). The id is what is
 * stored; labels can change. "other" takes a free text.
 */
export interface Position {
  id: string;
  label: string;
  department: Department;
  /** Other names the search should hit (German titles, abbreviations). */
  aliases?: string[];
}

export const DEPARTMENTS = [
  "production", "direction", "camera", "lighting", "grip", "sound", "art", "costume", "hair-makeup", "post", "writing", "other",
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const DEPARTMENT_LABEL: Record<Department, string> = {
  production: "Production",
  direction: "Direction & ADs",
  camera: "Camera",
  lighting: "Lighting",
  grip: "Grip",
  sound: "Sound",
  art: "Art",
  costume: "Costume",
  "hair-makeup": "Hair & Makeup",
  post: "Post",
  writing: "Writing",
  other: "Other",
};

export const POSITIONS: readonly Position[] = [
  { id: "producer", label: "Producer", department: "production", aliases: ["Produzent", "Produzentin"] },
  { id: "line-producer", label: "Line Producer", department: "production", aliases: ["Herstellungsleitung", "Herstellungsleiter"] },
  { id: "production-manager", label: "Production Manager", department: "production", aliases: ["Produktionsleitung", "Produktionsleiter", "UPM"] },
  { id: "production-coordinator", label: "Production Coordinator", department: "production", aliases: ["Produktionskoordination"] },
  { id: "location-manager", label: "Location Manager", department: "production", aliases: ["Motivaufnahmeleitung", "Motivaufnahmeleiter"] },
  { id: "production-assistant", label: "Production Assistant", department: "production", aliases: ["PA", "Produktionsassistenz", "Set-Runner"] },
  { id: "director", label: "Director", department: "direction", aliases: ["Regie", "Regisseur", "Regisseurin"] },
  { id: "first-ad", label: "1st AD", department: "direction", aliases: ["First Assistant Director", "Regieassistenz", "Regieassistent"] },
  { id: "second-ad", label: "2nd AD", department: "direction", aliases: ["Second Assistant Director", "1. Aufnahmeleitung", "Aufnahmeleiter", "Erster Aufnahmeleiter"] },
  { id: "third-ad", label: "3rd AD", department: "direction", aliases: ["Third Assistant Director", "2. Aufnahmeleitung", "Set-Aufnahmeleitung"] },
  { id: "script-supervisor", label: "Script Supervisor", department: "direction", aliases: ["Continuity", "Script"] },
  { id: "casting", label: "Casting", department: "direction", aliases: ["Casting Director"] },
  { id: "dp", label: "Director of Photography", department: "camera", aliases: ["DP", "DoP", "Cinematographer", "Kamera", "Bildgestaltung"] },
  { id: "camera-operator", label: "Camera Operator", department: "camera", aliases: ["Operator", "Schwenker"] },
  { id: "first-ac", label: "1st AC", department: "camera", aliases: ["Focus Puller", "Kameraassistenz", "Erste Kameraassistenz", "Schärfe"] },
  { id: "second-ac", label: "2nd AC", department: "camera", aliases: ["Clapper Loader", "Zweite Kameraassistenz", "Materialassistenz"] },
  { id: "dit", label: "DIT", department: "camera", aliases: ["Digital Imaging Technician", "Data Wrangler"] },
  { id: "steadicam", label: "Steadicam Operator", department: "camera" },
  { id: "drone", label: "Drone Operator", department: "camera", aliases: ["Drohne"] },
  { id: "stills", label: "Still Photographer", department: "camera", aliases: ["Setfotograf", "Setfotografin", "Standfoto"] },
  { id: "gaffer", label: "Gaffer", department: "lighting", aliases: ["Oberbeleuchter", "Oberbeleuchterin", "Chief Lighting Technician"] },
  { id: "best-boy-electric", label: "Best Boy Electric", department: "lighting", aliases: ["Best Girl", "Best Person"] },
  { id: "electrician", label: "Electrician", department: "lighting", aliases: ["Beleuchter", "Beleuchterin", "Spark", "Lighting Technician"] },
  { id: "key-grip", label: "Key Grip", department: "grip", aliases: ["Kamerabühne", "Oberbühne"] },
  { id: "grip", label: "Grip", department: "grip", aliases: ["Bühne", "Bühnenmann", "Bühnenfrau"] },
  { id: "dolly-grip", label: "Dolly Grip", department: "grip" },
  { id: "sound-mixer", label: "Production Sound Mixer", department: "sound", aliases: ["Tonmeister", "Tonmeisterin", "Originalton", "O-Ton"] },
  { id: "boom-operator", label: "Boom Operator", department: "sound", aliases: ["Tonangler", "Tonassistenz", "Boom"] },
  { id: "production-designer", label: "Production Designer", department: "art", aliases: ["Szenenbild", "Szenenbildner", "Szenenbildnerin"] },
  { id: "art-director", label: "Art Director", department: "art" },
  { id: "set-decorator", label: "Set Decorator", department: "art", aliases: ["Set Dresser", "Ausstattung"] },
  { id: "props", label: "Props Master", department: "art", aliases: ["Requisite", "Requisiteur", "Requisiteurin", "Props"] },
  { id: "costume-designer", label: "Costume Designer", department: "costume", aliases: ["Kostümbild", "Kostümbildner", "Kostümbildnerin"] },
  { id: "wardrobe", label: "Wardrobe", department: "costume", aliases: ["Garderobe", "Garderobiere", "Kostümassistenz"] },
  { id: "makeup", label: "Makeup Artist", department: "hair-makeup", aliases: ["Maske", "Maskenbildner", "Maskenbildnerin"] },
  { id: "hair", label: "Hair Stylist", department: "hair-makeup", aliases: ["Maske", "Haare"] },
  { id: "editor", label: "Editor", department: "post", aliases: ["Schnitt", "Cutter", "Cutterin", "Montage"] },
  { id: "colorist", label: "Colorist", department: "post", aliases: ["Grading", "Farbkorrektur"] },
  { id: "sound-designer", label: "Sound Designer", department: "post", aliases: ["Sounddesign", "Tonmischung", "Re-recording Mixer"] },
  { id: "vfx", label: "VFX Artist", department: "post", aliases: ["Visual Effects", "Compositing"] },
  { id: "composer", label: "Composer", department: "post", aliases: ["Filmmusik", "Komponist", "Komponistin"] },
  { id: "screenwriter", label: "Screenwriter", department: "writing", aliases: ["Drehbuch", "Drehbuchautor", "Drehbuchautorin", "Writer"] },
  { id: "actor", label: "Actor", department: "other", aliases: ["Schauspiel", "Schauspieler", "Schauspielerin", "Darsteller", "Cast"] },
  { id: "student", label: "Film Student", department: "other", aliases: ["Filmstudent", "Filmstudentin", "Filmhochschule"] },
  { id: "other", label: "Other", department: "other", aliases: ["Sonstiges"] },
];

const BY_ID = new Map(POSITIONS.map((p) => [p.id, p]));
export const positionById = (id: string): Position | undefined => BY_ID.get(id);
export const isPositionId = (v: unknown): v is string => typeof v === "string" && BY_ID.has(v);

/** The department of each picked position, without duplicates, in DEPARTMENTS order. */
export function departmentsOf(ids: readonly string[]): Department[] {
  const set = new Set(ids.map((id) => BY_ID.get(id)?.department).filter((d): d is Department => d !== undefined));
  return DEPARTMENTS.filter((d) => set.has(d));
}

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Positions whose label, department or an alias contains the query (accent- and case-insensitive); all of them for an empty query. */
export function searchPositions(query: string): Position[] {
  const q = fold(query.trim());
  if (!q) return [...POSITIONS];
  return POSITIONS.filter((p) => fold(p.label).includes(q) || fold(DEPARTMENT_LABEL[p.department]).includes(q) || p.aliases?.some((a) => fold(a).includes(q)));
}
