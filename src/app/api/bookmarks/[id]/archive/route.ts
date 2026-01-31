import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ARCHIVED_FILE = path.join(process.cwd(), 'public', 'archived.json');

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Read current archived IDs
    let archivedIds: string[] = [];
    try {
      const data = await fs.readFile(ARCHIVED_FILE, 'utf-8');
      archivedIds = JSON.parse(data);
    } catch (e) {
      // File might not exist yet
    }

    // Add new ID if not already there
    if (!archivedIds.includes(id)) {
      archivedIds.push(id);
      await fs.writeFile(ARCHIVED_FILE, JSON.stringify(archivedIds, null, 2));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Archive API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
