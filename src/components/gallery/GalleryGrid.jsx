"use client";

import { GalleryItem } from "./GalleryItem";

export function GalleryGrid({ items, onView, onDelete }) {
    if (!items || items.length === 0) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-8 text-center animate-in fade-in-50">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <svg
                        className="h-6 w-6 text-muted-foreground"
                        fill="none"
                        height="24"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold">No media found</h3>
                <p className="mb-4 mt-2 text-sm text-muted-foreground">
                    Upload some images or videos to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
