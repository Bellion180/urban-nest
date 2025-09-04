import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeft, UserCheck, Phone, Mail, Building, Home } from 'lucide-react';
import { residentService, buildingService } from '@/services/api';
import Header from './Header';
import ResidentDetailModal from './ResidentDetailModal';
import SimplePhotoModal from './SimplePhotoModal';

interface Resident {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  email: string;
  telefono: string;
  profilePhoto?: string;
  estatus: string;
  hasKey: boolean;
  apartamento: string;
  piso: string;
  pisoNumero: number;
  deudaActual: number;
  pagosRealizados?: number;
  noPersonas?: number;
  discapacidad?: string;
  informe?: string;
}

interface BuildingData {
  id: string;
  name: string;
  description?: string;
}

export const FloorResidents = () => {
  const { buildingId, floorNumber } = useParams<{ buildingId: string; floorNumber: string }>();
  const navigate = useNavigate();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [buildingData, setBuildingData] = useState<BuildingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      if (!buildingId || !floorNumber) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Cargar datos del edificio y residentes en paralelo
        const [buildingResponse, residentsResponse] = await Promise.all([
          buildingService.getById(buildingId),
          residentService.getByFloor(buildingId, floorNumber)
        ]);
        
        setBuildingData(buildingResponse);
        setResidents(residentsResponse);
        
        console.log('Datos cargados:', { building: buildingResponse, residents: residentsResponse });
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [buildingId, floorNumber]);

  const handleBack = () => {
    navigate(`/building/${buildingId}/niveles`);
  };

  const handleResidentClick = (resident: Resident) => {
    // Convertir el formato del residente para que coincida con lo que espera el modal
    const formattedResident = {
      id: resident.id,
      nombre: resident.nombre,
      apellido: resident.apellido,
      edad: resident.edad,
      email: resident.email,
      telefono: resident.telefono,
      profilePhoto: resident.profilePhoto,
      estatus: resident.estatus,
      hasKey: resident.hasKey,
      apartamento: resident.apartamento,
      piso: resident.piso,
      pisoNumero: resident.pisoNumero,
      deudaActual: resident.deudaActual,
      pagosRealizados: resident.pagosRealizados || 0,
      noPersonas: resident.noPersonas,
      discapacidad: resident.discapacidad,
      informe: resident.informe,
      edificio: buildingData?.name || 'Sin nombre'
    };
    
    setSelectedResident(formattedResident);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedResident(null);
  };

  const handlePhotoClick = (photo: string) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tlahuacali-red mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando residentes...</p>
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
              <Button onClick={handleBack} variant="outline">
                Volver
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
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={handleBack}
              variant="outline"
              size="sm"
              className="border-tlahuacali-red text-tlahuacali-red hover:bg-tlahuacali-red hover:text-white text-sm sm:text-base"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Volver a Niveles</span>
              <span className="sm:hidden">Volver</span>
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Users className="h-6 w-6 sm:h-8 w-8" />
                Residentes del Piso {floorNumber}
              </h2>
              <p className="text-muted-foreground">
                {buildingData?.name} - Haz clic en una credencial para ver más detalles
              </p>
            </div>
            <div className="text-sm bg-tlahuacali-red text-white px-3 py-1 rounded-full font-medium">
              {residents.length} {residents.length === 1 ? 'residente' : 'residentes'}
            </div>
          </div>
        </div>

        {residents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border shadow-sm">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-2">No hay residentes registrados</h4>
            <p className="text-muted-foreground">No se encontraron residentes en el piso {floorNumber}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {residents.map((resident) => (
              <Card 
                key={resident.id} 
                className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105"
                onClick={() => handleResidentClick(resident)}
              >
                {/* Header de la credencial */}
                <div className="bg-gradient-to-r from-tlahuacali-red to-red-600 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold">CREDENCIAL DE RESIDENTE</h4>
                      <p className="text-red-100 text-xs">{buildingData?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Apt. {resident.apartamento}</p>
                      <p className="text-xs text-red-100">Piso {floorNumber}</p>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Información Principal */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="relative">
                      {resident.profilePhoto ? (
                        <img
                          src={`http://localhost:3001${resident.profilePhoto}`}
                          alt={`${resident.nombre} ${resident.apellido}`}
                          className="w-16 h-16 rounded-full object-cover border-3 border-tlahuacali-red shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-tlahuacali-red to-red-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                          {resident.nombre.charAt(0)}{resident.apellido.charAt(0)}
                        </div>
                      )}
                      {resident.hasKey && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                          <UserCheck className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h5 className="text-lg font-bold text-foreground mb-1 leading-tight">
                        {resident.nombre} {resident.apellido}
                      </h5>
                      <p className="text-muted-foreground text-sm mb-2">{resident.edad} años</p>
                      
                      <div className="flex flex-wrap items-center gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          resident.estatus === 'ACTIVO' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : resident.estatus === 'INACTIVO'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          {resident.estatus}
                        </span>
                        
                        {resident.hasKey && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            Con Acceso
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Información de Contacto Compacta */}
                  <div className="space-y-1 mb-4">
                    {resident.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{resident.email}</span>
                      </div>
                    )}
                    {resident.telefono && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span>{resident.telefono}</span>
                      </div>
                    )}
                  </div>

                  {/* Información Financiera Compacta */}
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-muted-foreground">Deuda:</span>
                        <span className={`ml-1 font-medium ${resident.deudaActual > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${resident.deudaActual || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pagos:</span>
                        <span className="ml-1 font-medium text-foreground">
                          {resident.pagosRealizados || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Indicador de clic */}
                  <div className="mt-3 text-center">
                    <p className="text-xs text-muted-foreground">Haz clic para ver más detalles</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Modal de detalles del residente */}
      {showModal && selectedResident && (
        <ResidentDetailModal
          resident={selectedResident}
          isOpen={showModal}
          onClose={handleCloseModal}
          onPhotoClick={handlePhotoClick}
        />
      )}

      {/* Modal de foto */}
      {showPhotoModal && (
        <SimplePhotoModal
          photo={selectedPhoto}
          isOpen={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
        />
      )}
    </div>
  );
};

export default FloorResidents;
