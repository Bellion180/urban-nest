import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, ArrowLeft } from 'lucide-react';
import Header from './Header';

interface Nivel {
  id_nivel: number;
  numero_nivel: number;
  descripcion: string;
  id_torre: string;
}

interface BuildingData {
  id: string;
  name: string;
  address?: string;
  description?: string;
  niveles: Nivel[];
}

export const SeleccionNivel = () => {
  const { buildingId } = useParams<{ buildingId: string }>();
  const navigate = useNavigate();
  const [buildingData, setBuildingData] = useState<BuildingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuildingData = async () => {
      if (!buildingId) return;
      
      try {
        setLoading(true);
        console.log('Cargando datos del edificio:', buildingId);
        
        // Usar el endpoint de detalles para obtener el edificio con niveles
        const response = await fetch(`http://localhost:3001/api/torres/details/${buildingId}`);
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const building = await response.json();
        console.log('Datos del edificio obtenidos:', building);
        
        if (building) {
          setBuildingData(building);
        } else {
          setError('Edificio no encontrado');
        }
        
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

  const handleNivelSelect = (nivelId: number, floorNumber: number) => {
    console.log(`Nivel seleccionado: ${nivelId} del edificio: ${buildingId}, piso: ${floorNumber}`);
    
    // Navegar directamente a los residentes del piso
    if (buildingId) {
      navigate(`/building/${buildingId}/floor/${floorNumber}/residents`);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
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
                Volver al inicio
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
                Volver al inicio
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const niveles = buildingData.niveles || [];

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
              <span className="hidden sm:inline">Volver al inicio</span>
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

        {/* Grid de niveles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {niveles.map((nivel) => (
            <Card 
              key={nivel.id_nivel}
              className="bg-tlahuacali-cream hover:shadow-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handleNivelSelect(nivel.id_nivel, nivel.numero_nivel)}
            >
              <div className="aspect-video relative">
                <img 
                  src={`/edificios/${buildingId}/nivel-${nivel.numero_nivel}.png`}
                  alt={`Nivel ${nivel.numero_nivel}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log(`Usando imagen por defecto para nivel ${nivel.numero_nivel}`);
                    e.currentTarget.src = "/lovable-uploads/building-a.jpg";
                  }}
                />
                <div className="absolute top-2 left-2 bg-tlahuacali-red text-white px-2 py-1 rounded-full text-xs font-medium">
                  Nivel {nivel.numero_nivel}
                </div>
              </div>
            
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {nivel.descripcion || `Piso ${nivel.numero_nivel}`}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {nivel.numero_nivel === 1 ? 'Planta baja' : `Piso número ${nivel.numero_nivel}`}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Building className="h-3 w-3" />
                      <span>Departamentos</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>Residentes</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {niveles.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No hay niveles disponibles
            </h3>
            <p className="text-muted-foreground">
              Este edificio no tiene niveles configurados aún.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
