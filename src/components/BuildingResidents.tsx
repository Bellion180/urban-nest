import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { buildings, residents } from '@/data/mockData';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Phone, Mail, MapPin, Wallet, User, Building } from 'lucide-react';
import Header from './Header';

const BuildingResidents = () => {
  const { buildingId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';
  const [selectedResident, setSelectedResident] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [building, setBuilding] = useState<any>(null);
  const [buildingResidents, setBuildingResidents] = useState<any[]>([]);

  useEffect(() => {
    // Obtener edificio desde la API
    fetch(`/api/buildings`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const found = data.find((b: any) => b.id === buildingId);
        setBuilding(found);
      });
    // Obtener residentes desde la API
    fetch(`/api/residents?building=${buildingId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    })
      .then(res => res.json())
      .then(data => setBuildingResidents(data));
  }, [buildingId]);

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
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Volver al Dashboard</span>
            <span className="sm:hidden">Volver</span>
          </Button>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{building.nombre}</h2>
          <p className="text-sm sm:text-base text-muted-foreground">{building.descripcion}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {buildingResidents.map((resident) => (
            <Card 
              key={resident.id} 
              className="bg-tlahuacali-cream hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => handleResidentClick(resident.id)}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                  <img 
                    src={resident.foto} 
                    alt={`${resident.nombre} ${resident.apellido}`}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mx-auto sm:mx-0 flex-shrink-0"
                  />
                  
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                        {resident.nombre} {resident.apellido}
                      </h3>
                      <Badge 
                        variant={resident.estatus === 'activo' ? 'default' : 'destructive'}
                        className={`text-xs flex-shrink-0 ${resident.estatus === 'activo' 
                          ? 'bg-success text-white' 
                          : 'bg-destructive text-white'
                        }`}
                      >
                        {resident.estatus}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center justify-center sm:justify-start space-x-2">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>Apartamento {resident.apartamento}</span>
                      </div>
                      
                      <div className="flex items-center justify-center sm:justify-start space-x-2">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{resident.telefono}</span>
                      </div>
                      
                      <div className="flex items-center justify-center sm:justify-start space-x-2">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate text-xs">{resident.email}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-center sm:text-left text-muted-foreground">
                      <p className="truncate">{resident.profesion}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {buildingResidents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">No hay residentes registrados en este edificio</p>
            </div>
          </div>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[90vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Selecciona una opción</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:gap-4 py-4">
            {isAdmin && (
              <Button
                variant="outline"
                className="w-full flex items-center justify-start gap-2 text-sm sm:text-base py-2 sm:py-3"
                onClick={() => handleOptionClick('financieros')}
              >
                <Wallet className="h-4 w-4" />
                Información Financiera
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full flex items-center justify-start gap-2 text-sm sm:text-base py-2 sm:py-3"
              onClick={() => handleOptionClick('personal')}
            >
              <User className="h-4 w-4" />
              Información Personal
            </Button>
            {isAdmin && (
              <Button
                variant="outline"
                className="w-full flex items-center justify-start gap-2 text-sm sm:text-base py-2 sm:py-3"
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