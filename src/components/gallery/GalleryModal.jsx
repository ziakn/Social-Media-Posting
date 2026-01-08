"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import GallerySelector from "./GallerySelector";

export default function GalleryModal({
    children, // Trigger element
    open,
    onOpenChange,
    onSelect,
    allowMultiple = false,
    maxSelection = Infinity,
    allowedTypes,
    title = "Select Media",
}) {
    const handleSelect = (result) => {
        onSelect(result);
        // Close modal after selection if controlled internally or if onOpenChange provided
        if (onOpenChange) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="w-full max-w-[95vw] lg:max-w-4xl h-[95vh] lg:h-[80vh] flex flex-col p-0 gap-0 rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border-0">
                <DialogHeader className="px-6 py-4 border-b shrink-0">
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 min-h-0">
                    <GallerySelector
                        onSelect={handleSelect}
                        allowMultiple={allowMultiple}
                        maxSelection={maxSelection}
                        allowedTypes={allowedTypes}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
