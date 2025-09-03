import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Building, Users, ArrowRight, Home, ArrowLeft } from 'lucide-react';
import { buildingService } from '@/services/api';
import Header from './Header';

interface Floor {
  id: string;
  number: number;
  name: string;
  apartments: {
    id: string;
    number: string;
    residents: any[];
  }[];
}

interface BuildingData {
  id: string;
  name: string;
  address?: string;
  description?: string;
  floors: Floor[];
}

export const SeleccionNivel = () => {
  const { buildingId } = useParams<{ buildingId: string }>();
  const navigate = useNavigate();
  const [selectedNivel, setSelectedNivel] = useState<string | null>(null);
  const [buildingData, setBuildingData] = useState<BuildingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [floorImages, setFloorImages] = useState<{[floorNumber: number]: string}>({});

  useEffect(() => {
    const fetchBuildingData = async () => {
      if (!buildingId) return;
      
      try {
        setLoading(true);
        const data = await buildingService.getById(buildingId);
        setBuildingData(data);
        
        // Cargar imágenes de pisos
        await loadFloorImages(buildingId);
        
        setError(null);
      } catch (err) {
        console.error('Error al obtener datos del edificio:', err);
        setError('Error al cargar los datos del edificio');
      } finally {
        setLoading(false);
      }
    };

    fetchBuildingData();
  }, [buildingId]);

  // Función para cargar imágenes de pisos
  const loadFloorImages = async (buildingId: string) => {
    try {
      console.log('Cargando imágenes de pisos para edificio:', buildingId);
      const data = await buildingService.getFloorImages(buildingId);
      console.log('Imágenes de pisos obtenidas:', data);
      
      const imagesMap: {[floorNumber: number]: string} = {};
      data.floorImages.forEach((floorImg: any) => {
        imagesMap[floorImg.pisoNumber] = `http://localhost:3001${floorImg.imageUrl}`;
      });
      
      setFloorImages(imagesMap);
    } catch (error) {
      console.error('Error al cargar imágenes de pisos:', error);
    }
  };

  const handleNivelSelect = (nivelId: string) => {
    setSelectedNivel(nivelId);
    console.log(`Nivel seleccionado: ${nivelId} del edificio: ${buildingId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleContinueToResidents = () => {
    if (buildingId) {
      navigate(`/building/${buildingId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tlahuacali-red mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando datos del edificio...</p>
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
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                Volver al Dashboard
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!buildingData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No se encontró el edificio</p>
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                Volver al Dashboard
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const floors = buildingData.floors || [];

  // Función para calcular el total de residentes en un piso
  const getTotalResidentsInFloor = (floor: Floor) => {
    return floor.apartments.reduce((total, apartment) => {
      return total + (apartment.residents?.length || 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={handleBackToDashboard}
              variant="outline"
              size="sm"
              className="border-tlahuacali-red text-tlahuacali-red hover:bg-tlahuacali-red hover:text-white text-sm sm:text-base"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Volver al Dashboard</span>
              <span className="sm:hidden">Volver</span>
            </Button>
          </div>
          
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Selección de Nivel - {buildingData?.name || 'Edificio'}
          </h2>
          <p className="text-muted-foreground">
            Navega entre los diferentes niveles del {buildingData?.name || 'edificio'}
          </p>
        </div>

        {/* Mobile: Stack cards vertically */}
        <div className="block sm:hidden space-y-4">
          {floors.map((floor) => (
            <Card 
              key={floor.id}
              className={`carousel-card bg-tlahuacali-cream hover:shadow-lg overflow-hidden cursor-pointer ${
                selectedNivel === floor.id ? 'ring-2 ring-tlahuacali-red' : ''
              }`}
              onClick={() => handleNivelSelect(floor.id)}
            >
              <div className="aspect-video relative">
                <img 
                  src={floorImages[floor.number] || "/lovable-uploads/building-a.jpg"} 
                  alt={`Nivel ${floor.number}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error(`Error cargando imagen del piso ${floor.number} (móvil)`);
                    e.currentTarget.src = "/lovable-uploads/building-a.jpg";
                  }}
                  onLoad={() => {
                    if (floorImages[floor.number]) {
                      console.log(`Imagen del piso ${floor.number} cargada exitosamente (móvil)`);
                    }
                  }}
                />
                <div className="absolute top-2 left-2 bg-tlahuacali-red text-white px-2 py-1 rounded-full text-xs font-medium">
                  Nivel {floor.number}
                </div>
              </div>
            
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {floor.name || `Piso ${floor.number}`}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {floor.number === 1 ? 'Planta baja' : `Piso número ${floor.number}`}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Building className="h-3 w-3" />
                      <span>{floor.apartments.length} apts</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{getTotalResidentsInFloor(floor)} residentes</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop/Tablet: Use carousel */}
        <div className="hidden sm:block relative px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              skipSnaps: false,
              dragFree: false,
              containScroll: "trimSnaps",
              duration: 0, // Sin animación
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {floors.map((floor) => (
                <CarouselItem key={floor.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card 
                    className={`carousel-card bg-tlahuacali-cream hover:shadow-lg overflow-hidden cursor-pointer ${
                      selectedNivel === floor.id ? 'ring-2 ring-tlahuacali-red' : ''
                    }`}
                    onClick={() => handleNivelSelect(floor.id)}
                  >
                    <div className="aspect-video relative">
                      <img 
                        src={floorImages[floor.number] || "/lovable-uploads/building-a.jpg"}
                        alt={floor.name || `Piso ${floor.number}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error(`Error cargando imagen del piso ${floor.number}`);
                          e.currentTarget.src = "/lovable-uploads/building-a.jpg";
                        }}
                        onLoad={() => {
                          if (floorImages[floor.number]) {
                            console.log(`Imagen del piso ${floor.number} cargada exitosamente`);
                          }
                        }}
                      />
                      <div className="absolute top-4 left-4 bg-tlahuacali-red text-white px-3 py-1 rounded-full text-sm font-medium">
                        Nivel {floor.number}
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Home className="h-5 w-5" />
                        {floor.name || `Piso ${floor.number}`}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {floor.number === 1 ? 'Planta baja del edificio' : `Piso número ${floor.number} del edificio`}
                      </p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Building className="h-4 w-4" />
                            <span>{floor.apartments.length} apts</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{getTotalResidentsInFloor(floor)} residentes</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        className={`w-full text-white transition-colors ${
                          selectedNivel === floor.id 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-tlahuacali-red hover:bg-tlahuacali-red/90'
                        }`}
                      >
                        {selectedNivel === floor.id ? 'Seleccionado' : 'Seleccionar Nivel'}
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

        {selectedNivel && (
          <div className="mt-8 space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                ✓ Nivel seleccionado: {floors.find(f => f.id === selectedNivel)?.name || `Piso ${floors.find(f => f.id === selectedNivel)?.number}`}
              </p>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleContinueToResidents}
                className="bg-tlahuacali-red hover:bg-tlahuacali-red/90 text-white"
              >
                Continuar a Residentes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
