import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail, CheckCircle } from 'lucide-react';

interface EmailSentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

const EmailSentModal: React.FC<EmailSentModalProps> = ({ isOpen, onClose, onContinue }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Correo Enviado</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 p-6">
          <div className="relative">
            <Mail className="h-16 w-16 text-tlahuacali-red" />
            <CheckCircle className="absolute -top-2 -right-2 h-8 w-8 text-green-500 bg-white rounded-full" />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">¡Correo enviado exitosamente!</h3>
            <p className="text-sm text-muted-foreground">
              Se ha enviado un código de verificación de 6 dígitos a tu correo electrónico.
            </p>
            <p className="text-xs text-muted-foreground">
              Revisa tu bandeja de entrada y carpeta de spam.
            </p>
          </div>
          
          <div className="flex space-x-2 w-full">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cerrar
            </Button>
            <Button 
              onClick={onContinue}
              className="flex-1 bg-tlahuacali-red hover:bg-tlahuacali-red/90 text-white"
            >
              Continuar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailSentModal;
