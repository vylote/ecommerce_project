import { useEffect, useId, useRef, useState } from "react";

export default function useDismissiblePopover() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const dismissOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    const container = containerRef.current;
    const dismissOnEscape = (event) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", dismissOutside);
    container?.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      container?.removeEventListener("keydown", dismissOnEscape);
    };
  }, [isOpen]);

  return { isOpen, setIsOpen, containerRef, triggerRef, panelId };
}
