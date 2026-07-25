import type { ReactNode } from "react";
import { X } from "lucide-react";
import Button from "./Button";

interface ModalProps {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}

export default function Modal({
  title,
  description,
  children,
  onClose,
}: ModalProps) {
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        aria-label={title}
        aria-modal="true"
        className="modal-panel"
        role="dialog"
      >
        <header className="modal-header">
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <Button
            aria-label="Close dialog"
            icon={<X size={17} />}
            onClick={onClose}
            variant="ghost"
          />
        </header>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}
