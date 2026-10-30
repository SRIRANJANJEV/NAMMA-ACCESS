import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <div className="flex gap-4">
        <div className={`p-2.5 rounded-xl ${variant === 'danger' ? 'bg-danger-500/10' : variant === 'warning' ? 'bg-warning-500/10' : 'bg-primary-500/10'}`}>
          <AlertTriangle size={20} className={variant === 'danger' ? 'text-danger-400' : variant === 'warning' ? 'text-warning-400' : 'text-primary-400'} />
        </div>
        <p className="text-sm text-slate-300 flex-1">{message}</p>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
        <Button variant={variant === 'danger' ? 'danger' : variant === 'warning' ? 'warning' : 'primary'} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
