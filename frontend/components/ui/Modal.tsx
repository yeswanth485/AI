"use client";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-border2 bg-surface shadow-2xl max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display text-base font-bold text-foreground tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-surface2 border border-border flex items-center justify-center text-muted hover:border-accent hover:text-accent transition-all text-sm"
          >
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
