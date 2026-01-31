import fs from 'fs/promises';
import path from 'path';

export interface Bookmark {
  id: string;
  url: string;
  content: string;
  author_name: string;
  author_handle: string;
  author_avatar?: string;
  media_urls: { type: string; url: string; previewUrl?: string }[];
  categories: string[];
  bookmarked_at: string;
  synced_at: string;
}

const DATA_DIR = path.join(process.cwd(), 'public');
const BOOKMARKS_FILE = path.join(DATA_DIR, 'bookmarks.json');

export async function ensureDataDir() {
  // Directory is public, usually exists.
}

export async function getBookmarks(): Promise<Bookmark[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(BOOKMARKS_FILE, 'utf-8');
    const json = JSON.parse(data);
    
    // Handle both raw bird output structure and our own Bookmark[] structure
    const rawList = Array.isArray(json) ? json : json.tweets || [];
    
    // Check if they need transformation (bird raw has 'text', Bookmark has 'content')
    return rawList.map((item: any) => {
      if (item.content) return item; // Already transformed
      return transformRawTweet(item); // Needs transformation
    });
  } catch (error) {
    console.error('Read error:', error);
    return [];
  }
}

export async function saveBookmarks(bookmarks: Bookmark[]) {
  await ensureDataDir();
  await fs.writeFile(BOOKMARKS_FILE, JSON.stringify(bookmarks, null, 2));
}

export function transformRawTweet(tweet: any): Bookmark {
  return {
    id: tweet.id,
    url: `https://x.com/i/status/${tweet.id}`,
    content: tweet.text || '',
    author_name: tweet.author?.name || 'Unknown',
    author_handle: tweet.author?.username || 'unknown',
    author_avatar: tweet.author?.avatar,
    media_urls: tweet.media || [],
    categories: [],
    bookmarked_at: tweet.createdAt || new Date().toISOString(),
    synced_at: new Date().toISOString(),
  };
}
