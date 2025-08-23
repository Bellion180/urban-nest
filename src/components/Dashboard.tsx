import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { buildings } from '@/data/mockData';
import { Building, Users, ArrowRight, Layers } from 'lucide-react';
import Header from './Header';

const Dashboard = () => {
  const navigate = useNavigate();



  const handleNivelesSelect = (buildingId: string) => {
    navigate(`/building/${buildingId}/niveles`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Bienvenido</h2>
          <p className="text-muted-foreground">Selecciona un edificio para ver los residentes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buildings.map((building) => (
            <Card 
              key={building.id} 
              className="bg-tlahuacali-cream hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <div className="aspect-video relative">
                <img 
                  src={building.imagen} 
                  alt={building.nombre}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-tlahuacali-red text-white px-3 py-1 rounded-full text-sm font-medium">
                  {building.nombre}
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {building.nombre}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {building.descripcion}
                </p>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Building className="h-4 w-4" />
                      <span>{building.apartamentos} apts</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{building.residentes} residentes</span>
                    </div>
                  </div>
                </div>
                

                
                <Button
                  onClick={() => handleNivelesSelect(building.id)}
                  variant="outline"
                  className="w-full border-tlahuacali-red text-tlahuacali-red hover:bg-tlahuacali-red hover:text-white"
                >
                  <Layers className="mr-2 h-4 w-4" />
                  Seleccionar Niveles
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;