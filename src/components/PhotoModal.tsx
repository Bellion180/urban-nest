import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Upload, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhoto: string;
  residentName: string;
  onPhotoUpdate: (newPhoto: string) => void;
}

const PhotoModal: React.FC<PhotoModalProps> = ({ 
  isOpen, 
  onClose, 
  currentPhoto, 
  residentName,
  onPhotoUpdate 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Por favor selecciona un archivo de imagen válido",
          variant: "destructive",
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen debe ser menor a 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    
    try {
      // Simular upload (en un caso real, aquí subirías la imagen al servidor)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generar una nueva URL de imagen (en un caso real, el servidor devolvería la URL)
      const newPhotoUrl = URL.createObjectURL(selectedFile);
      
      onPhotoUpdate(newPhotoUrl);
      
      toast({
        title: "Foto actualizada",
        description: "La foto del residente ha sido actualizada exitosamente",
      });
      
      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la foto. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setUploading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Cambiar Foto - {residentName}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Foto actual */}
          <div className="text-center">
            <h3 className="text-sm font-medium mb-2">Foto Actual</h3>
            <img 
              src={currentPhoto} 
              alt="Foto actual"
              className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-gray-200"
            />
          </div>
          
          {/* Selector de archivo */}
          <div className="space-y-2">
            <label htmlFor="photo-upload" className="text-sm font-medium">
              Seleccionar nueva foto
            </label>
            <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 5MB
            </p>
          </div>
          
          {/* Preview de la nueva foto */}
          {previewUrl && (
            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">Vista Previa</h3>
              <img 
                src={previewUrl} 
                alt="Vista previa"
                className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-tlahuacali-red"
              />
            </div>
          )}
          
          {/* Botones de acción */}
          <div className="flex space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
              disabled={uploading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <Button 
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1 bg-tlahuacali-red hover:bg-tlahuacali-red/90 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Subiendo...' : 'Actualizar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoModal;
