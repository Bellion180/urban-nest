import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Building, Users, ArrowRight, Home, ArrowLeft } from 'lucide-react';
import { buildings } from '@/data/mockData';
import Header from './Header';

interface Nivel {
  id: string;
  numero: number;
  nombre: string;
  descripcion: string;
  apartamentos: number;
  residentes: number;
  imagen: string;
}

const niveles: Nivel[] = [
  {
    id: '1',
    numero: 1,
    nombre: 'Planta Baja',
    descripcion: 'Acceso principal y áreas comunes',
    apartamentos: 4,
    residentes: 8,
    imagen: '/lovable-uploads/building-a.jpg'
  },
  {
    id: '2',
    numero: 2,
    nombre: 'Primer Piso',
    descripcion: 'Apartamentos con vista al jardín',
    apartamentos: 6,
    residentes: 12,
    imagen: '/lovable-uploads/building-b.jpg'
  },
  {
    id: '3',
    numero: 3,
    nombre: 'Segundo Piso',
    descripcion: 'Apartamentos con balcón',
    apartamentos: 6,
    residentes: 15,
    imagen: '/lovable-uploads/building-c.jpg'
  },
  {
    id: '4',
    numero: 4,
    nombre: 'Tercer Piso',
    descripcion: 'Apartamentos premium',
    apartamentos: 4,
    residentes: 10,
    imagen: '/lovable-uploads/building-a.jpg'
  }

];

export const SeleccionNivel = () => {
  const { buildingId } = useParams<{ buildingId: string }>();
  const navigate = useNavigate();
  const [selectedNivel, setSelectedNivel] = useState<string | null>(null);

  const currentBuilding = buildings.find(b => b.id === buildingId);

  const handleNivelSelect = (nivelId: string) => {
    setSelectedNivel(nivelId);
    // Aquí puedes agregar la lógica para navegar o realizar alguna acción
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={handleBackToDashboard}
              variant="outline"
              size="sm"
              className="border-tlahuacali-red text-tlahuacali-red hover:bg-tlahuacali-red hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Button>
          </div>
          
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Selección de Nivel - {currentBuilding?.nombre || 'Edificio'}
          </h2>
          <p className="text-muted-foreground">
            Navega entre los diferentes niveles del {currentBuilding?.nombre || 'edificio'}
          </p>
        </div>

        <div className="relative px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {niveles.map((nivel) => (
                <CarouselItem key={nivel.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card 
                    className={`bg-tlahuacali-cream hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer ${
                      selectedNivel === nivel.id ? 'ring-2 ring-tlahuacali-red' : ''
                    }`}
                    onClick={() => handleNivelSelect(nivel.id)}
                  >
                    <div className="aspect-video relative">
                      <img 
                        src={nivel.imagen} 
                        alt={nivel.nombre}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-tlahuacali-red text-white px-3 py-1 rounded-full text-sm font-medium">
                        Nivel {nivel.numero}
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Home className="h-5 w-5" />
                        {nivel.nombre}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {nivel.descripcion}
                      </p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Building className="h-4 w-4" />
                            <span>{nivel.apartamentos} apts</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{nivel.residentes} residentes</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        className={`w-full text-white transition-colors ${
                          selectedNivel === nivel.id 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-tlahuacali-red hover:bg-tlahuacali-red/90'
                        }`}
                      >
                        {selectedNivel === nivel.id ? 'Seleccionado' : 'Seleccionar Nivel'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="bg-tlahuacali-red text-white hover:bg-tlahuacali-red/90" />
            <CarouselNext className="bg-tlahuacali-red text-white hover:bg-tlahuacali-red/90" />
          </Carousel>
        </div>

        {selectedNivel && (
          <div className="mt-8 space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                ✓ Nivel seleccionado: {niveles.find(n => n.id === selectedNivel)?.nombre}
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
