import Button from "./Button";
import Modal from "./Modal";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  isLoading = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} description={description} onClose={onCancel}>
      <footer className="modal-actions">
        <Button onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button isLoading={isLoading} onClick={onConfirm} variant="danger">
          {confirmLabel}
        </Button>
      </footer>
    </Modal>
  );
}
