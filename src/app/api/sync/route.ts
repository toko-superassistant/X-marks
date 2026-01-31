import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getBookmarks, saveBookmarks, transformRawTweet } from '@/lib/data';

const execAsync = promisify(exec);

export async function POST() {
  try {
    const AUTH_TOKEN = "2834910cc22d3b6113d812243cbebf6863eca777";
    const CT0 = "345711efa13529daf6109db8c66f4c5808d6632cd4b6da6ef69cda384fdb3d87c0b02a612ec69696fe5789fcb7d86ad90c1573aca8e7e18475732ef40d47cc9bc000c0c4f9c8dba4360d19f246206588";

    // Run bird CLI locally
    const { stdout } = await execAsync(
      `bird bookmarks --all --json --auth-token "${AUTH_TOKEN}" --ct0 "${CT0}"`,
      { timeout: 120000 }
    );

    const rawTweets = JSON.parse(stdout);
    const existingBookmarks = await getBookmarks();
    
    // Merge logic: use tweet ID as key to prevent duplicates
    const bookmarkMap = new Map(existingBookmarks.map(b => [b.id, b]));
    
    let addedCount = 0;
    for (const tweet of rawTweets) {
      if (!bookmarkMap.has(tweet.id)) {
        bookmarkMap.set(tweet.id, transformRawTweet(tweet));
        addedCount++;
      }
    }

    const updatedBookmarks = Array.from(bookmarkMap.values());
    await saveBookmarks(updatedBookmarks);

    return NextResponse.json({ 
      success: true, 
      added: addedCount, 
      total: updatedBookmarks.length 
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
