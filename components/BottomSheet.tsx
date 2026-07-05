"use client";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl border-t border-border p-4 max-w-[480px] mx-auto max-h-[85vh] overflow-y-auto animate-slide-up">
        <div className="w-10 h-1 rounded-full bg-border mx-auto mb-3" />
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-app-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-secondary hover:text-app-text transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
