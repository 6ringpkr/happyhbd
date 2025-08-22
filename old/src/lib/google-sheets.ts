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

export interface Guest {
  name: string;
  uniqueId: string;
  status: 'Pending' | 'Confirmed' | 'Declined';
  rsvpAt: string; // YYYY-MM-DD when RSVP was made
  isGodparent: boolean;
  godparentAcceptedAt: string; // YYYY-MM-DD when Godparent role accepted
  godparentFullName: string; // Full legal name for dedication document
}

export async function addGuest(name: string, isGodparent: boolean): Promise<Guest> {
  const { sheets, spreadsheetId } = await getSheetsClient();
  const baseSlug = name.trim().toLowerCase().replace(/\s+/g, '-');

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
    name,
    uniqueId,
    status: 'Pending',
    rsvpAt: '',
    isGodparent,
    godparentAcceptedAt: '',
    godparentFullName: '',
  };

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${SHEET_NAME}!A:G`,
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
      ]],
    },
  });

  return newGuest;
}

export async function findGuestByUniqueId(uniqueId: string): Promise<(Guest & { row: number }) | null> {
  const { sheets, spreadsheetId } = await getSheetsClient();
  const doc = await sheets.spreadsheets.get({
    spreadsheetId,
    ranges: [`${SHEET_NAME}!A:G`],
    includeGridData: true,
  });

  const sheet = doc.data.sheets?.[0];
  const grid = sheet?.data?.[0]?.rowData || [];
  for (let i = 0; i < grid.length; i++) {
    const rowData = grid[i]?.values || [];
    const cellB = rowData[1]?.effectiveValue;
    const cellBString = cellB?.stringValue ?? (cellB?.numberValue !== undefined ? String(cellB.numberValue) : undefined);
    if (cellBString === uniqueId) {
      const name = rowData[0]?.formattedValue || '';
      const status = rowData[2]?.formattedValue || '';
      const rsvpAt = rowData[3]?.formattedValue || '';
      const isGodparent = (rowData[4]?.formattedValue || '').toString().toUpperCase() === 'TRUE';
      const godparentAcceptedAt = rowData[5]?.formattedValue || '';
      const godparentFullName = rowData[6]?.formattedValue || '';
      return {
        name,
        uniqueId,
        status: status as Guest['status'],
        rsvpAt,
        isGodparent,
        godparentAcceptedAt,
        godparentFullName,
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

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const { sheets, spreadsheetId } = await getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAME}!C${guest.row}:D${guest.row}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[status, today]],
    },
  });
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

export async function listGuests(): Promise<Array<Guest & { row: number }>> {
  const { sheets, spreadsheetId } = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAME}!A:G`,
  });
  const rows: string[][] = (res.data.values as any) || [];
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
    results.push({ name, uniqueId, status, rsvpAt, isGodparent, godparentAcceptedAt, godparentFullName, row: i + 1 });
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
  const existingIds = new Set<string>((existingRes.data.values || []).map((r: any[]) => (r?.[0] || '').toString()));

  const values: any[][] = [];
  const created: Guest[] = [];
  for (const item of items) {
    const baseSlug = item.name.trim().toLowerCase().replace(/\s+/g, '-');
    let uniqueId = baseSlug || `guest-${Date.now()}`;
    let suffix = 1;
    while (existingIds.has(uniqueId)) {
      uniqueId = `${baseSlug}-${suffix++}`;
    }
    existingIds.add(uniqueId);

    const g: Guest = {
      name: item.name,
      uniqueId,
      status: 'Pending',
      rsvpAt: '',
      isGodparent: item.isGodparent,
      godparentAcceptedAt: '',
      godparentFullName: '',
    };
    created.push(g);
    values.push([g.name, g.uniqueId, g.status, g.rsvpAt, g.isGodparent, g.godparentAcceptedAt, g.godparentFullName]);
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${SHEET_NAME}!A:G`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });

  return created;
}


