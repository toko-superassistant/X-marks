import { NextResponse } from 'next/server';
import { getBookmarks } from '@/lib/data';

export async function GET() {
  try {
    const bookmarks = await getBookmarks();
    // Sort by most recent first
    const sorted = bookmarks.sort((a, b) => 
      new Date(b.bookmarked_at).getTime() - new Date(a.bookmarked_at).getTime()
    );
    return NextResponse.json(sorted);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}
