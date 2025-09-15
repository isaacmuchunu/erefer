import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreatePatientForm } from '@/components/forms/CreatePatientForm';

interface CreatePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function CreatePatientModal({ isOpen, onClose, onSubmit }: CreatePatientModalProps) {
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
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>
            Enter patient information to create a new patient record
          </DialogDescription>
        </DialogHeader>
        <CreatePatientForm onSubmit={handleSubmit} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
}
