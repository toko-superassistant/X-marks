'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Archive, 
  ExternalLink, 
  RefreshCw, 
  Twitter, 
  LayoutGrid, 
  List, 
  ChevronRight,
  X,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for clean tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Bookmark {
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

const CATEGORIES = ['Development', 'Design', 'Business', 'AI', 'Dubai', 'General'];

export default function Home() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await fetch('/api/bookmarks');
      const data = await res.json();
      setBookmarks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load bookmarks');
      setBookmarks([]);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetch('/api/sync', { method: 'POST' });
      await fetchBookmarks();
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredBookmarks = useMemo(() => {
    const searchLower = searchQuery.trim().toLowerCase();
    return bookmarks.filter(b => {
      const matchesSearch = !searchLower || 
                           b.content?.toLowerCase().includes(searchLower) ||
                           b.author_name?.toLowerCase().includes(searchLower) ||
                           b.author_handle?.toLowerCase().includes(searchLower);
      const matchesCategory = selectedCategory === 'all' || 
                             b.categories.includes(selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [bookmarks, searchQuery, selectedCategory]);

  const handleArchive = async (id: string) => {
    try {
      // Optimistic update
      setBookmarks(prev => prev.filter(b => b.id !== id));
      await fetch(`/api/bookmarks/${id}/archive`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to archive:', error);
      fetchBookmarks(); // Revert on failure
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-bg font-sans">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-brand-border bg-brand-sidebar p-6 lg:block z-20">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-accent shadow-xl shadow-black/10">
            <Twitter className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">X-marks</span>
        </div>

        <nav className="space-y-1">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
              selectedCategory === 'all' ? "bg-slate-100 text-black" : "text-brand-muted hover:bg-slate-50 hover:text-black"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Library
          </button>
          
          <div className="pt-8 pb-2">
            <span className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Categories</span>
          </div>
          
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                selectedCategory === cat ? "bg-slate-100 text-black" : "text-brand-muted hover:bg-slate-50 hover:text-black"
              )}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              {cat}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-50 shadow-lg shadow-black/10"
          >
            <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
            {isSyncing ? 'Syncing...' : 'Sync Account'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-10 glass px-6 py-6 lg:px-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {selectedCategory === 'all' ? 'All Bookmarks' : selectedCategory}
              </h2>
              <p className="text-sm font-medium text-brand-muted">{filteredBookmarks.length} items found</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Find a bookmark..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-brand-border bg-white px-10 py-2.5 text-sm outline-none transition-all focus:border-black focus:ring-4 focus:ring-black/5 md:w-64"
                />
              </div>
              <div className="hidden bg-white border border-brand-border rounded-2xl p-1 shadow-sm sm:flex">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn("p-1.5 rounded-lg transition-all", viewMode === 'grid' ? "bg-slate-100 text-black" : "text-slate-300 hover:text-black")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn("p-1.5 rounded-lg transition-all", viewMode === 'list' ? "bg-slate-100 text-black" : "text-slate-300 hover:text-black")}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
          <div className={cn(
            viewMode === 'grid' ? "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3" : "space-y-4"
          )}>
            {filteredBookmarks.map((bookmark) => (
              <BookmarkCard 
                key={bookmark.id} 
                bookmark={bookmark} 
                viewMode={viewMode}
                onOpen={() => setSelectedBookmark(bookmark)}
                onArchive={handleArchive}
              />
            ))}
          </div>

          {filteredBookmarks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[40px] bg-white shadow-2xl shadow-slate-200">
                <Search className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No bookmarks found</h3>
              <p className="mt-2 text-brand-muted">Try a different search or sync your account.</p>
            </div>
          )}
        </div>
      </main>

      {/* Detail Overlay */}
      {selectedBookmark && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedBookmark(null)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] bg-white p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedBookmark(null)}
              className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-8 flex items-center gap-4">
              <img 
                src={selectedBookmark.author_avatar || `https://ui-avatars.com/api/?name=${selectedBookmark.author_name}&background=random`} 
                className="h-14 w-14 rounded-full ring-4 ring-slate-50" 
              />
              <div>
                <h4 className="text-xl font-bold">{selectedBookmark.author_name}</h4>
                <p className="text-brand-muted">@{selectedBookmark.author_handle}</p>
              </div>
            </div>

            <p className="mb-8 whitespace-pre-wrap text-lg leading-relaxed text-slate-800">
              {selectedBookmark.content}
            </p>

            {selectedBookmark.media_urls.length > 0 && (
              <div className="mb-8 space-y-4">
                {selectedBookmark.media_urls.map((m, i) => (
                  <img key={i} src={m.url} className="w-full rounded-3xl shadow-lg shadow-black/5" />
                ))}
              </div>
            )}

            <div className="flex gap-4">
              <a 
                href={selectedBookmark.url} 
                target="_blank" 
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-100 py-4 text-sm font-bold transition-all hover:bg-slate-200"
              >
                <ExternalLink className="h-4 w-4" /> View Original
              </a>
              <button 
                onClick={async (e) => {
                  const btn = e.currentTarget;
                  const originalContent = btn.innerHTML;
                  btn.disabled = true;
                  btn.innerText = "Syncing Archive to X...";
                  
                  try {
                    await fetch(`/api/bookmarks/${selectedBookmark.id}/archive`, { method: 'POST' });
                    setSelectedBookmark(null);
                    fetchBookmarks();
                  } catch (err) {
                    btn.disabled = false;
                    btn.innerHTML = originalContent;
                  }
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-50 py-4 text-sm font-bold text-rose-600 transition-all hover:bg-rose-100 disabled:opacity-50"
              >
                <Archive className="h-4 w-4" /> Archive & Remove from X
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookmarkCard({ bookmark, viewMode, onOpen, onArchive }: { 
  bookmark: Bookmark, 
  viewMode: 'grid' | 'list',
  onOpen: () => void,
  onArchive: (id: string) => void
}) {
  const isGrid = viewMode === 'grid';
  const hasMedia = bookmark.media_urls.length > 0;

  const dateLabel = useMemo(() => {
    try {
      return format(new Date(bookmark.bookmarked_at), 'MMM d');
    } catch {
      return 'Recent';
    }
  }, [bookmark.bookmarked_at]);

  return (
    <article 
      onClick={onOpen}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-[32px] border border-brand-border bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/5",
        !isGrid && "flex-row gap-6 p-4"
      )}
    >
      {hasMedia && (
        <div className={cn(
          "relative overflow-hidden bg-slate-100",
          isGrid ? "aspect-[16/10] w-full" : "h-32 w-48 rounded-2xl flex-shrink-0"
        )}>
          <img 
            src={bookmark.media_urls[0].previewUrl || bookmark.media_urls[0].url} 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/5 transition-colors group-hover:bg-transparent" />
        </div>
      )}

      <div className={cn("flex flex-1 flex-col p-6", !isGrid && "p-2")}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <img 
              src={bookmark.author_avatar || `https://ui-avatars.com/api/?name=${bookmark.author_name}&background=random`} 
              className="h-6 w-6 rounded-full" 
            />
            <span className="truncate text-[11px] font-bold text-slate-900">{bookmark.author_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-slate-400">{dateLabel}</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onArchive(bookmark.id);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
              title="Archive and Remove from X"
            >
              <Archive className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className={cn(
          "leading-relaxed text-slate-700",
          isGrid ? "line-clamp-4 text-sm" : "line-clamp-2 text-[15px] font-medium"
        )}>
          {bookmark.content}
        </p>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-1.5">
             {bookmark.categories.length > 0 ? (
               bookmark.categories.slice(0, 1).map(cat => (
                <span key={cat} className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                  {cat}
                </span>
               ))
             ) : (
                <span className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-400">
                  Uncategorized
                </span>
             )}
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-black" />
        </div>
      </div>
    </article>
  );
}
