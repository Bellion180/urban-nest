import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { buildings } from '@/data/mockData';
import { Building, Users, ArrowRight, Layers } from 'lucide-react';
import Header from './Header';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-7xl mx-auto"
        >
          <CarouselContent>
            {buildings.map((building) => (
              <CarouselItem key={building.id} className="md:basis-1/2 lg:basis-1/3">
                <Card 
                  className="bg-tlahuacali-cream hover:shadow-lg transition-shadow duration-300 overflow-hidden mx-2"
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
                      className="w-full bg-tlahuacali-red hover:bg-tlahuacali-red/90 text-white"
                    >
                      Ver Nivel
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </main>
    </div>
  );
};

export default Dashboard;

