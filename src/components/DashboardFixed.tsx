import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, ArrowRight, Loader2 } from 'lucide-react';
import Header from './Header';
import { buildingService, residentService } from '@/services/api';
import ResidentDetailModal from './ResidentDetailModal';

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

interface Resident {
  id_companero: number;
  nombre: string;
  apellidos: string;
  telefono?: string;
  email?: string;
  estatus: string;
  departamento?: {
    no_departamento: string;
    torre: {
      letra: string;
    };
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState<BuildingData[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchBuildings();
    fetchRecentResidents();
  }, []);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Dashboard: Obteniendo edificios de la API...');
      
      const buildingsData = await buildingService.getAll();
      console.log('Dashboard: Edificios recibidos:', buildingsData);
      
      if (!buildingsData || !Array.isArray(buildingsData)) {
        throw new Error('Datos de edificios inválidos recibidos del servidor');
      }
      
      setBuildings(buildingsData);
    } catch (error: any) {
      console.error('Dashboard: Error al obtener edificios:', error);
      setError(`Error al cargar los edificios: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentResidents = async () => {
    try {
      console.log('Dashboard: Obteniendo residentes recientes...');
      const residentsData = await residentService.getAll();
      console.log('Dashboard: Residentes recibidos:', residentsData);
      
      if (!residentsData || !Array.isArray(residentsData)) {
        console.warn('Dashboard: Datos de residentes inválidos, usando array vacío');
        setResidents([]);
        return;
      }
      
      // Tomar solo los primeros 6 residentes para el dashboard
      setResidents(residentsData.slice(0, 6));
    } catch (error) {
      console.error('Dashboard: Error al obtener residentes:', error);
      // No mostrar error para residentes, simplemente usar array vacío
      setResidents([]);
    }
  };

  const handleResidentClick = (resident: Resident) => {
    setSelectedResident(resident);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedResident(null);
  };

  const handlePhotoClick = (photo: string) => {
    // Función para manejar click en foto del modal
    console.log('Foto clickeada:', photo);
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
  console.log('Dashboard RENDER: residents state:', residents);
  console.log('Dashboard RENDER: loading state:', loading);
  console.log('Dashboard RENDER: error state:', error);

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
                    src={building.image ? `http://localhost:3001${building.image}` : `/edificios/image-1757376060873-181390284.jpg`} 
                    alt={building.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Si no encuentra la imagen específica, usa imágenes locales o placeholder
                      const img = e.target as HTMLImageElement;
                      const currentSrc = img.src;
                      
                      if (!currentSrc.includes('placeholder.svg') && !currentSrc.includes('/edificios/')) {
                        // Intentar con imágenes locales
                        img.src = `/edificios/image-1757376060873-181390284.jpg`;
                      } else if (currentSrc.includes('/edificios/') && !currentSrc.includes('placeholder.svg')) {
                        // Si falló la imagen local, usar placeholder
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
                    <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Building className="h-3 w-3" />
                        <span>{building.floors?.length || 0} niveles</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{building._count?.residents || 0} residentes</span>
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

        {/* Sección de Residentes Recientes */}
        {residents.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                Residentes Recientes
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Haz clic en un residente para ver su información detallada
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {residents.map((resident) => (
                <Card 
                  key={resident.id_companero}
                  className="bg-tlahuacali-cream hover:shadow-lg cursor-pointer transition-all duration-200 hover:scale-105"
                  onClick={() => handleResidentClick(resident)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-tlahuacali-red rounded-full flex items-center justify-center text-white font-semibold">
                        {resident.nombre.charAt(0)}{resident.apellidos.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate">
                          {resident.nombre} {resident.apellidos}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {resident.departamento ? 
                            `Torre ${resident.departamento.torre.letra} - Depto ${resident.departamento.no_departamento}` :
                            'Sin departamento asignado'
                          }
                        </p>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            resident.estatus === 'ACTIVO' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {resident.estatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal de Detalles del Residente */}
      <ResidentDetailModal
        resident={selectedResident}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPhotoClick={handlePhotoClick}
      />
    </div>
  );
};

export default Dashboard;
