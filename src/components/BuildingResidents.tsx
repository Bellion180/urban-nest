import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { buildings, residents } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Phone, Mail, MapPin, Wallet, User, Building } from 'lucide-react';
import Header from './Header';

const BuildingResidents = () => {
  const { buildingId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [selectedResident, setSelectedResident] = React.useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  const building = buildings.find(b => b.id === buildingId);
  const buildingResidents = residents.filter(r => r.edificio === buildingId);

  if (!building) {
    return <div>Edificio no encontrado</div>;
  }

  const handleResidentClick = (residentId: string) => {
    setSelectedResident(residentId);
    setIsDialogOpen(true);
  };

  const handleOptionClick = (option: string) => {
    if (selectedResident) {
      switch (option) {
        case 'financieros':
          if (isAdmin) {
            navigate(`/resident/${selectedResident}/financial`);
          }
          break;
        case 'personal':
          navigate(`/resident/${selectedResident}/personal`);
          break;
        case 'invi':
          if (isAdmin) {
            navigate(`/resident/${selectedResident}/invi`);
          }
          break;
      }
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
          
          <h2 className="text-3xl font-bold text-foreground mb-2">{building.nombre}</h2>
          <p className="text-muted-foreground">{building.descripcion}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buildingResidents.map((resident) => (
            <Card 
              key={resident.id} 
              className="bg-tlahuacali-cream hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => handleResidentClick(resident.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <img 
                    src={resident.foto} 
                    alt={`${resident.nombre} ${resident.apellido}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">
                        {resident.nombre} {resident.apellido}
                      </h3>
                      <Badge 
                        variant={resident.estatus === 'activo' ? 'default' : 'destructive'}
                        className={resident.estatus === 'activo' 
                          ? 'bg-success text-white' 
                          : 'bg-destructive text-white'
                        }
                      >
                        {resident.estatus}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>Apartamento {resident.apartamento}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{resident.telefono}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{resident.email}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-muted-foreground">
                      <p>{resident.profesion}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {buildingResidents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay residentes registrados en este edificio</p>
          </div>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Selecciona una opción</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isAdmin && (
              <Button
                variant="outline"
                className="w-full flex items-center justify-start gap-2"
                onClick={() => handleOptionClick('financieros')}
              >
                <Wallet className="h-4 w-4" />
                Información Financiera
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full flex items-center justify-start gap-2"
              onClick={() => handleOptionClick('personal')}
            >
              <User className="h-4 w-4" />
              Información Personal
            </Button>
            {isAdmin && (
              <Button
                variant="outline"
                className="w-full flex items-center justify-start gap-2"
                onClick={() => handleOptionClick('invi')}
              >
                <Building className="h-4 w-4" />
                Información INVI
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuildingResidents;