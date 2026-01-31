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
      // 1. Delete from X.com first
      const AUTH_TOKEN = "2834910cc22d3b6113d812243cbebf6863eca777";
      const CT0 = "345711efa13529daf6109db8c66f4c5808d6632cd4b6da6ef69cda384fdb3d87c0b02a612ec69696fe5789fcb7d86ad90c1573aca8e7e18475732ef40d47cc9bc000c0c4f9c8dba4360d19f246206588";
      
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      try {
        await execAsync(`bird unbookmark ${id} --auth-token "${AUTH_TOKEN}" --ct0 "${CT0}"`);
        console.log(`Successfully unbookmarked ${id} from X.com`);
      } catch (e) {
        console.error(`Failed to unbookmark ${id} from X.com:`, e);
        // We still archive it locally even if X.com fails to keep UI in sync
      }

      // 2. Archive locally
      archivedIds.push(id);
      await fs.writeFile(ARCHIVED_FILE, JSON.stringify(archivedIds, null, 2));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Archive API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
