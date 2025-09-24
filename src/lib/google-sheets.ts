import { google } from "googleapis";

// Lazily initialize Google Sheets client at request time to avoid build-time env access
let cachedSheetsClient: ReturnType<typeof google.sheets> | null = null;

function readEnv(key: string): string | undefined {
  return (process.env as Record<string, string | undefined>)[key];
}

async function getSheetsClient() {
  const GOOGLE_SHEET_ID = readEnv('GOOGLE_SHEET_ID');
  const GOOGLE_CLIENT_EMAIL = readEnv('GOOGLE_CLIENT_EMAIL');
  const RAW_GOOGLE_PRIVATE_KEY = readEnv('GOOGLE_PRIVATE_KEY');

  if (!GOOGLE_SHEET_ID || !GOOGLE_CLIENT_EMAIL || !RAW_GOOGLE_PRIVATE_KEY) {
    throw new Error("Missing Google Sheets API credentials in environment variables");
  }

  if (!cachedSheetsClient) {
    const jwtClient = new google.auth.JWT({
      email: GOOGLE_CLIENT_EMAIL,
      key: RAW_GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    await jwtClient.authorize();

    cachedSheetsClient = google.sheets({
      version: "v4",
      auth: jwtClient,
    });
  }

  return { sheets: cachedSheetsClient, spreadsheetId: GOOGLE_SHEET_ID };
}

const SHEET_NAME = (process.env.GOOGLE_SHEET_NAME || 'Sheet1') as string;
const SETTINGS_SHEET_NAME = (process.env.GOOGLE_SETTINGS_SHEET_NAME || 'Settings') as string;

export interface Guest {
  name: string;
  uniqueId: string;
  status: 'Pending' | 'Confirmed' | 'Declined';
  rsvpAt: string; // YYYY-MM-DD when RSVP was made
  isGodparent: boolean;
  godparentAcceptedAt: string; // YYYY-MM-DD when Godparent role accepted
  godparentFullName: string; // Full legal name for dedication document
  godparentDeclinedAt: string; // YYYY-MM-DD when Godparent role declined
}

/**
 * Formats a guest name to Title Case: uppercase the first letter of each word
 * and lowercase the rest. Collapses extra spaces and trims.
 * Examples: "jOhN   doe" -> "John Doe", "ana-maría o'brien" -> "Ana-María O'Brien".
 */
function formatGuestName(rawName: string): string {
  const collapsed = rawName.trim().replace(/\s+/g, ' ');
  const lower = collapsed.toLowerCase();
  // Capitalize after start or separators: space, hyphen, apostrophe, slash
  return lower.replace(/(^|[\s\-'/])(\p{L})/gu, (match, sep: string, ch: string) => sep + ch.toUpperCase());
}

export async function addGuest(name: string, isGodparent: boolean): Promise<Guest> {
  const { sheets, spreadsheetId } = await getSheetsClient();
  const formattedName = formatGuestName(name);
  const baseSlug = formattedName.trim().toLowerCase().replace(/\s+/g, '-');

  // Ensure unique slug
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAME}!B:B`,
  });
  const existingIds = new Set((existing.data.values || []).map((r) => r[0]));
  let uniqueId = baseSlug;
  let suffix = 1;
  while (existingIds.has(uniqueId)) {
    uniqueId = `${baseSlug}-${suffix++}`;
  }
  const newGuest: Guest = {
    name: formattedName,
    uniqueId,
    status: 'Pending',
    rsvpAt: '',
    isGodparent,
    godparentAcceptedAt: '',
    godparentFullName: '',
    godparentDeclinedAt: '',
  };

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${SHEET_NAME}!A:H`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        newGuest.name,
        newGuest.uniqueId,
        newGuest.status,
        newGuest.rsvpAt,
        newGuest.isGodparent,
        newGuest.godparentAcceptedAt,
        newGuest.godparentFullName,
        newGuest.godparentDeclinedAt,
      ]],
    },
  });

  return newGuest;
}

export async function findGuestByUniqueId(uniqueId: string): Promise<(Guest & { row: number }) | null> {
  const { sheets, spreadsheetId } = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAME}!A:H`,
  });
  
  const rows: string[][] = (res.data.values as unknown as string[][]) || [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] || [];
    const name = (row[0] || '').toString();
    const rowUniqueId = (row[1] || '').toString();
    
    // Skip header row
    if (i === 0) {
      const maybeHeader = [name.toLowerCase(), rowUniqueId.toLowerCase()].join(' ');
      if (maybeHeader.includes('name') && maybeHeader.includes('unique')) continue;
    }
    
    if (rowUniqueId === uniqueId) {
      const status = (row[2] || 'Pending') as Guest['status'];
      const rsvpAt = (row[3] || '').toString();
      const isGodparent = String(row[4] || '').toUpperCase() === 'TRUE';
      const godparentAcceptedAt = (row[5] || '').toString();
      const godparentFullName = (row[6] || '').toString();
      const godparentDeclinedAt = (row[7] || '').toString();
      return {
        name,
        uniqueId,
        status,
        rsvpAt,
        isGodparent,
        godparentAcceptedAt,
        godparentFullName,
        godparentDeclinedAt,
        row: i + 1,
      };
    }
  }
  return null;
}

export async function updateRsvp(uniqueId: string, status: 'Confirmed' | 'Declined'): Promise<void> {
  const guest = await findGuestByUniqueId(uniqueId);
  if (!guest) {
    throw new Error("Guest not found");
  }

  const { sheets, spreadsheetId } = await getSheetsClient();
  
  if (status === 'Confirmed') {
    // Only save RsvpDate when user accepts (Confirmed)
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_NAME}!C${guest.row}:D${guest.row}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[status, today]],
      },
    });
  } else if (status === 'Declined') {
    // For declined, only update status, don't save RsvpDate
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_NAME}!C${guest.row}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[status]],
      },
    });
  }
}

export async function acceptGodparentRole(uniqueId: string, fullName: string): Promise<void> {
  const guest = await findGuestByUniqueId(uniqueId);
  if (!guest) {
    throw new Error('Guest not found');
  }
  const today = new Date().toISOString().split('T')[0];
  const { sheets, spreadsheetId } = await getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAME}!F${guest.row}:G${guest.row}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[today, fullName]] },
  });
}

export async function declineGodparentRole(uniqueId: string): Promise<void> {
  const guest = await findGuestByUniqueId(uniqueId);
  if (!guest) {
    throw new Error('Guest not found');
  }
  const today = new Date().toISOString().split('T')[0];
  const { sheets, spreadsheetId } = await getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAME}!H${guest.row}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[today]] },
  });
}

export async function listGuests(): Promise<Array<Guest & { row: number }>> {
  const { sheets, spreadsheetId } = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAME}!A:H`,
  });
  const rows: string[][] = (res.data.values as unknown as string[][]) || [];
  const results: Array<Guest & { row: number }> = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] || [];
    const name = (row[0] || '').toString();
    const uniqueId = (row[1] || '').toString();
    if (i === 0) {
      const maybeHeader = [name.toLowerCase(), uniqueId.toLowerCase()].join(' ');
      if (maybeHeader.includes('name') && maybeHeader.includes('unique')) continue;
    }
    if (!uniqueId) continue;
    const status = (row[2] || 'Pending') as Guest['status'];
    const rsvpAt = (row[3] || '').toString();
    const isGodparent = String(row[4] || '').toUpperCase() === 'TRUE';
    const godparentAcceptedAt = (row[5] || '').toString();
    const godparentFullName = (row[6] || '').toString();
    const godparentDeclinedAt = (row[7] || '').toString();
    results.push({ name, uniqueId, status, rsvpAt, isGodparent, godparentAcceptedAt, godparentFullName, godparentDeclinedAt, row: i + 1 });
  }
  return results;
}

export async function addGuestsBulk(items: Array<{ name: string; isGodparent: boolean }>): Promise<Guest[]> {
  if (!items.length) return [];
  const { sheets, spreadsheetId } = await getSheetsClient();

  // Fetch existing uniqueIds
  const existingRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAME}!B:B`,
  });
  const existingIds = new Set<string>(((existingRes.data.values as unknown as string[][]) || []).map((r) => (r?.[0] || '').toString()));

  const values: (string | number | boolean)[][] = [];
  const created: Guest[] = [];
  for (const item of items) {
    const formattedName = formatGuestName(item.name);
    const baseSlug = formattedName.trim().toLowerCase().replace(/\s+/g, '-');
    let uniqueId = baseSlug || `guest-${Date.now()}`;
    let suffix = 1;
    while (existingIds.has(uniqueId)) {
      uniqueId = `${baseSlug}-${suffix++}`;
    }
    existingIds.add(uniqueId);

    const g: Guest = {
      name: formattedName,
      uniqueId,
      status: 'Pending',
      rsvpAt: '',
      isGodparent: item.isGodparent,
      godparentAcceptedAt: '',
      godparentFullName: '',
      godparentDeclinedAt: '',
    };
    created.push(g);
    values.push([g.name, g.uniqueId, g.status, g.rsvpAt, g.isGodparent, g.godparentAcceptedAt, g.godparentFullName, g.godparentDeclinedAt]);
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${SHEET_NAME}!A:H`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });

  return created;
}


export interface Settings {
  dedicationDateDisplay: string; // e.g., "Oct 11, 2025"
  dedicationTimeDisplay: string; // e.g., "2:00 PM"
  locationDisplay: string;  // e.g., "TBA"
  // Editable labels
  dedicationTimeLabel: string; // e.g., "Dedication Time"
  locationLabel: string; // e.g., "Location"
  // Additional detail labels
  dateLabel: string; // e.g., "Date"
  addressLabel: string; // e.g., "Address"
  mapLabel: string; // e.g., "Map"
  dressCodeLabel: string; // e.g., "Dress code"
  hostsLabel: string; // e.g., "Hosts"
  giftNote: string;         // long paragraph shown under gift note
  // Extended fields for future template customization
  eventTitle: string;       // e.g., "Dedication Ceremony"
  celebrantName: string;    // e.g., "Lauan"
  celebrantImageUrl: string; // optional hero/wordmark image for celebrant
  venueAddress: string;     // full address
  venueMapUrl: string;      // map link
  dressCode: string;        // e.g., "Smart casual"
  registryNote: string;     // freeform registry or gift guidance
  rsvpDeadlineISO: string;  // optional RSVP-by date
  hostNames: string;        // e.g., "Allan & Gia"
  themeName: string;        // e.g., "Classic", "Pixel"
  backgroundImageUrl: string; // background image for template
  accentColor: string;      // hex color like #123456
  invitationTemplate: string; // template key: classic | pixel | ...
}

export const DEFAULT_SETTINGS: Settings = {
  dedicationDateDisplay: 'Oct 11, 2025 (Saturday)',
  dedicationTimeDisplay: '10:00 AM',
  locationDisplay: 'Celebration Church | 243 Purok 2 Banlic, Calamba City, Laguna',
  // Default labels
  dedicationTimeLabel: 'Time',
  locationLabel: 'Location',
  // Additional detail labels
  dateLabel: 'Date',
  addressLabel: 'Address',
  mapLabel: 'Map',
  dressCodeLabel: 'Dress code',
  hostsLabel: 'Hosts',
  giftNote:
    'Your presence is the most precious gift we could ask for. If you wish to bless Lauan further, we would deeply appreciate monetary gifts for his future needs or gift checks from department stores. 💙',
  eventTitle: 'Dedication Ceremony',
  celebrantName: '',
  celebrantImageUrl: '',
  venueAddress: '',
  venueMapUrl: 'https://maps.app.goo.gl/WKZxYMgytgadwv9i7',
  dressCode: '',
  registryNote: '',
  rsvpDeadlineISO: '',
  hostNames: '',
  themeName: '',
  backgroundImageUrl: '',
  accentColor: '',
  invitationTemplate: 'classic',
};

/**
 * Reads key-value pairs from the Settings sheet (A: key, B: value) and merges with defaults.
 */
export async function getSettings(): Promise<Settings> {
  const { sheets, spreadsheetId } = await getSheetsClient();
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SETTINGS_SHEET_NAME}!A:B`,
    });
    const rows: string[][] = (res.data.values as unknown as string[][]) || [];
    const kv: Record<string, string> = {};
    for (let i = 0; i < rows.length; i++) {
      const [key, value] = rows[i] || [];
      if (!key) continue;
      kv[String(key).trim()] = (value ?? '').toString();
    }
    return {
      dedicationDateDisplay: kv.dedicationDateDisplay ?? DEFAULT_SETTINGS.dedicationDateDisplay,
      dedicationTimeDisplay: kv.dedicationTimeDisplay ?? DEFAULT_SETTINGS.dedicationTimeDisplay,
      locationDisplay: kv.locationDisplay ?? DEFAULT_SETTINGS.locationDisplay,
      // Labels
      dedicationTimeLabel: kv.dedicationTimeLabel ?? DEFAULT_SETTINGS.dedicationTimeLabel,
      locationLabel: kv.locationLabel ?? DEFAULT_SETTINGS.locationLabel,
      // Additional detail labels
      dateLabel: kv.dateLabel ?? DEFAULT_SETTINGS.dateLabel,
      addressLabel: kv.addressLabel ?? DEFAULT_SETTINGS.addressLabel,
      mapLabel: kv.mapLabel ?? DEFAULT_SETTINGS.mapLabel,
      dressCodeLabel: kv.dressCodeLabel ?? DEFAULT_SETTINGS.dressCodeLabel,
      hostsLabel: kv.hostsLabel ?? DEFAULT_SETTINGS.hostsLabel,
      giftNote: kv.giftNote ?? DEFAULT_SETTINGS.giftNote,
      eventTitle: kv.eventTitle ?? DEFAULT_SETTINGS.eventTitle,
      celebrantName: kv.celebrantName ?? DEFAULT_SETTINGS.celebrantName,
      celebrantImageUrl: kv.celebrantImageUrl ?? DEFAULT_SETTINGS.celebrantImageUrl,
      venueAddress: kv.venueAddress ?? DEFAULT_SETTINGS.venueAddress,
      venueMapUrl: kv.venueMapUrl ?? DEFAULT_SETTINGS.venueMapUrl,
      dressCode: kv.dressCode ?? DEFAULT_SETTINGS.dressCode,
      registryNote: kv.registryNote ?? DEFAULT_SETTINGS.registryNote,
      rsvpDeadlineISO: kv.rsvpDeadlineISO ?? DEFAULT_SETTINGS.rsvpDeadlineISO,
      hostNames: kv.hostNames ?? DEFAULT_SETTINGS.hostNames,
      themeName: kv.themeName ?? DEFAULT_SETTINGS.themeName,
      backgroundImageUrl: kv.backgroundImageUrl ?? DEFAULT_SETTINGS.backgroundImageUrl,
      accentColor: kv.accentColor ?? DEFAULT_SETTINGS.accentColor,
      invitationTemplate: kv.invitationTemplate ?? DEFAULT_SETTINGS.invitationTemplate,
    };
  } catch {
    // If the Settings sheet doesn't exist yet, return defaults
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Upserts provided settings into the Settings sheet. Values are stored as plain strings.
 */
export async function updateSettings(partial: Partial<Settings>): Promise<Settings> {
  const { sheets, spreadsheetId } = await getSheetsClient();
  // Ensure the Settings sheet exists
  await ensureSheetExists(sheets, spreadsheetId, SETTINGS_SHEET_NAME);
  // Load current rows to find indices
  let res: { data: { values?: string[][] } };
  try {
    res = (await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SETTINGS_SHEET_NAME}!A:B`,
    })) as unknown as { data: { values?: string[][] } };
  } catch {
    res = { data: { values: [] as string[][] } };
  }
  const rows: string[][] = (res.data.values || []) as string[][];
  const keyToRowIndex: Record<string, number> = {};
  for (let i = 0; i < rows.length; i++) {
    const k = (rows[i]?.[0] || '').toString();
    if (k) keyToRowIndex[k] = i + 1; // 1-indexed for Sheets ranges
  }

  // Prepare updates; do simple per-key updates/appends
  const entries = Object.entries(partial).filter(([, v]) => typeof v === 'string');
  for (const [key, value] of entries) {
    const row = keyToRowIndex[key];
    if (row) {
      // Update existing row's value in column B
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SETTINGS_SHEET_NAME}!B${row}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[value as string]] },
      });
    } else {
      // Append new key-value row
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${SETTINGS_SHEET_NAME}!A:B`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[key, value as string]] },
      });
    }
  }

  // Return merged settings
  const current = await getSettings();
  return current;
}


/**
 * Ensures a worksheet with the given title exists. Creates it if missing.
 */
async function ensureSheetExists(
  sheetsClient: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  title: string
) {
  try {
    const meta = await sheetsClient.spreadsheets.get({ spreadsheetId });
    const exists = (meta.data.sheets || []).some((s) => s.properties?.title === title);
    if (!exists) {
      await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title,
                },
              },
            },
          ],
        },
      });
      // Seed header row for readability
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId,
        range: `${title}!A1:B1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [["key", "value"]] },
      });
    }
  } catch (e) {
    // Best effort; if this fails, later calls will throw meaningful errors
  }
}


