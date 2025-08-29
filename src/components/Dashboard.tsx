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
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Bienvenido</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Selecciona un edificio para ver los residentes
          </p>
        </div>

        {/* Mobile: Stack cards vertically, Desktop: Use carousel */}
        <div className="block sm:hidden space-y-4">
          {buildings.map((building) => (
            <Card 
              key={building.id}
              className="carousel-card bg-tlahuacali-cream hover:shadow-lg overflow-hidden"
            >
              <div className="aspect-video relative">
                <img 
                  src={building.imagen} 
                  alt={building.nombre}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-tlahuacali-red text-white px-2 py-1 rounded-full text-xs font-medium">
                  {building.nombre}
                </div>
              </div>
            
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {building.nombre}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {building.descripcion}
                </p>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Building className="h-3 w-3" />
                      <span>{building.apartamentos} apts</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{building.residentes} residentes</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => handleNivelesSelect(building.id)}
                  className="w-full bg-tlahuacali-red hover:bg-tlahuacali-red/90 text-white text-sm"
                >
                  Ver Nivel
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop/Tablet: Use carousel */}
        <div className="hidden sm:block">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              skipSnaps: false,
              dragFree: false,
              containScroll: "trimSnaps",
              duration: 0, // Sin animación
            }}
            className="w-full max-w-7xl mx-auto"
          >
            <CarouselContent>
              {buildings.map((building) => (
                <CarouselItem key={building.id} className="md:basis-1/2 lg:basis-1/3">
                  <Card 
                    className="carousel-card bg-tlahuacali-cream hover:shadow-lg overflow-hidden mx-2"
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
                  
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                        {building.nombre}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
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
            <CarouselPrevious className="hidden sm:flex bg-tlahuacali-red text-white hover:bg-tlahuacali-red/90 border-tlahuacali-red" />
            <CarouselNext className="hidden sm:flex bg-tlahuacali-red text-white hover:bg-tlahuacali-red/90 border-tlahuacali-red" />
          </Carousel>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

