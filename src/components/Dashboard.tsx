import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, ArrowRight, Loader2 } from 'lucide-react';
import Header from './Header';
import { buildingService } from '@/services/api';

interface BuildingData {
  id: string;
  name: string;
  description: string;
  image: string;
  floors?: {
    id: string;
    name: string;
    number: number;
    apartments: Array<string>;
    _count?: {
      residents: number;
    };
  }[];
  totalApartments?: number;
  totalResidents?: number;
  totalFloors?: number;
  _count?: {
    residents: number;
  };
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
      
      // Verificar si hay token de autenticación
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('Dashboard: No hay token de autenticación');
        setError('No se encontró token de autenticación. Por favor, inicie sesión nuevamente.');
        return;
      }
      
      const buildingsData = await buildingService.getAll();
      console.log('Dashboard: Edificios recibidos:', buildingsData);
      console.log('Dashboard: Tipo de datos recibidos:', typeof buildingsData);
      console.log('Dashboard: Es array?', Array.isArray(buildingsData));
      
      if (!buildingsData) {
        console.log('Dashboard: No se recibieron datos');
        setBuildings([]);
        return;
      }
      
      if (!Array.isArray(buildingsData)) {
        console.error('Dashboard: Los datos no son un array:', buildingsData);
        throw new Error('Datos de edificios inválidos recibidos del servidor');
      }
      
      console.log(`Dashboard: Se encontraron ${buildingsData.length} edificios`);
      setBuildings(buildingsData);
    } catch (error: any) {
      console.error('Dashboard: Error al obtener edificios:', error);
      setError(`Error al cargar los edificios: ${error.message}`);
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

  // Logs para debugging en render
  console.log('Dashboard RENDER: buildings state:', buildings);
  console.log('Dashboard RENDER: buildings length:', buildings.length);
  console.log('Dashboard RENDER: loading state:', loading);
  console.log('Dashboard RENDER: error state:', error);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Bienvenido</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Selecciona un edificio para ver los residentes
            </p>
          </div>
        </div>

        {/* Mensaje cuando no hay edificios */}
        {!loading && !error && buildings.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No hay edificios disponibles
            </h3>
            <p className="text-muted-foreground mb-4">
              No se encontraron edificios en el sistema.
            </p>
            <Button onClick={fetchBuildings} variant="outline">
              Actualizar
            </Button>
          </div>
        )}

        {/* Mostrar edificios solo si hay datos */}
        {!loading && !error && buildings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buildings.map((building) => (
              <Card 
                key={building.id}
                className="bg-tlahuacali-cream hover:shadow-lg overflow-hidden"
              >
                <div className="aspect-video relative">
                  <img 
                    src={building.image ? `http://localhost:3001${building.image}` : `/placeholder.svg`} 
                    alt={`Torre ${building.name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      const currentSrc = img.src;
                      
                      if (!currentSrc.includes('placeholder.svg')) {
                        console.log(`Error cargando imagen: ${currentSrc}, usando placeholder`);
                        img.src = `/placeholder.svg`;
                      }
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-tlahuacali-red text-white px-2 py-1 rounded-full text-xs font-medium">
                    Torre {building.name}
                  </div>
                </div>
              
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Torre {building.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {building.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4 text-tlahuacali-red" />
                        <span className="font-medium">
                          {building.floors?.length || building.totalFloors || 0} niveles
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-tlahuacali-red" />
                        <span className="font-medium">
                          {building._count?.residents || building.totalResidents || 0} residentes
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleNivelesSelect(building.id)}
                    className="w-full bg-tlahuacali-red hover:bg-tlahuacali-red/90 text-white text-sm"
                  >
                    Ver Niveles
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
