import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface SimplePhotoModalProps {
  photo: string;
  isOpen: boolean;
  onClose: () => void;
}

const SimplePhotoModal: React.FC<SimplePhotoModalProps> = ({ 
  photo, 
  isOpen, 
  onClose 
}) => {
  if (!photo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-3xl p-0 overflow-hidden mx-auto">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <img 
            src={photo}
            alt="Foto del residente"
            className="w-full h-auto max-h-[80vh] object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimplePhotoModal;
