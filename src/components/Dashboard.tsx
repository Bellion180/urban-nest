import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, ArrowRight, Loader2 } from 'lucide-react';
import Header from './Header';
import api from '@/services/api';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface BuildingData {
  id: string;
  name: string;
  description: string;
  image: string;
  floors: {
    id: string;
    name: string;
    number: number;
    apartments: Array<string>;
  }[];
  totalApartments: number;
  totalResidents: number;
  totalFloors?: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState<BuildingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Dashboard: Obteniendo edificios de la API...');
      
      const buildingsData = await api.buildingService.getAll();
      console.log('Dashboard: Edificios recibidos:', buildingsData);
      
      setBuildings(buildingsData);
    } catch (error) {
      console.error('Dashboard: Error al obtener edificios:', error);
      setError('Error al cargar los edificios');
    } finally {
      setLoading(false);
    }
  };



  const handleNivelesSelect = (buildingId: string) => {
    navigate(`/building/${buildingId}/niveles`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Cargando edificios...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchBuildings} variant="outline">
                Reintentar
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
                  src={building.image} 
                  alt={building.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-tlahuacali-red text-white px-2 py-1 rounded-full text-xs font-medium">
                  {building.name}
                </div>
              </div>
            
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {building.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {building.description}
                </p>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Building className="h-3 w-3" />
                      <span>{building.floors.length} pisos</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{building.totalResidents} residentes</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-4">
                  <div className="flex items-center space-x-1">
                    <span>Pisos disponibles:</span>
                    <span className="font-medium">{building.floors.map(f => f.number).join(', ')}</span>
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
                        src={building.image} 
                        alt={building.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-tlahuacali-red text-white px-3 py-1 rounded-full text-sm font-medium">
                        {building.name}
                      </div>
                    </div>
                  
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                        {building.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {building.description}
                      </p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Building className="h-4 w-4" />
                            <span>{building.floors.length} pisos</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{building.totalResidents} residentes</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        <div className="flex items-center space-x-1">
                          <span>Pisos disponibles:</span>
                          <span className="font-medium">{building.floors.map(f => f.number).join(', ')}</span>
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

