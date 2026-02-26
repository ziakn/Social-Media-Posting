"use client";

import { GalleryItem } from "./GalleryItem";

export function GalleryGrid({ items, onView, onDelete }) {
    if (!items || items.length === 0) {
        return (
            <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/10 p-12 text-center animate-in fade-in-50">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <svg
                        className="h-8 w-8 text-primary/80"
                        fill="none"
                        height="24"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold tracking-tight">No media found</h3>
                <p className="mb-4 mt-2 max-w-sm text-sm text-muted-foreground">
                    Your gallery is empty. Upload images or videos to start building your media library.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
            {items.map((item) => (
                <GalleryItem
                    key={item.id}
                    item={item}
                    onView={onView}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
