import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ImageLightboxProps {
  src: string;
  alt: string;
  title?: string;
  closeLabel: string;
  onClose: () => void;
}

export default function ImageLightbox({
  src,
  alt,
  title,
  closeLabel,
  onClose,
}: ImageLightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title ?? alt}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm sm:p-6"
      onMouseDown={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col items-center gap-3"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="absolute right-0 top-0 z-10 inline-flex h-10 w-10 -translate-y-full items-center justify-center rounded-full bg-surface text-ink shadow-card transition-colors hover:text-signal"
        >
          <X size={20} />
        </button>

        <img
          src={src}
          alt={alt}
          className="max-h-[80vh] w-auto max-w-full rounded-xl border border-line bg-surface object-contain shadow-card"
        />

        {title && (
          <p className="text-center font-display text-base font-semibold text-paper">
            {title}
          </p>
        )}
      </div>
    </div>
  );
}
