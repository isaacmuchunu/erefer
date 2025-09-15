import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreateReferralForm } from '@/components/forms/CreateReferralForm';

interface CreateReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function CreateReferralModal({ isOpen, onClose, onSubmit }: CreateReferralModalProps) {
  const handleSubmit = (data: any) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1189px] max-h-[842px] w-[1189px] h-[842px] overflow-y-auto" style={{
        width: '1189px', // A4 landscape width in pixels at 96 DPI
        height: '842px', // A4 landscape height in pixels at 96 DPI
        maxWidth: '95vw',
        maxHeight: '95vh'
      }}>
        <DialogHeader className="sr-only">
          <DialogTitle>Create New Referral</DialogTitle>
          <DialogDescription>
            Fill out the form to create a new patient referral
          </DialogDescription>
        </DialogHeader>
        <CreateReferralForm onSubmit={handleSubmit} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
}
