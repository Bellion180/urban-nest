import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Resident } from '@/types/user';
import { residentService } from '@/services/api';
import ResidentDetailModal from './ResidentDetailModal';

import { 
  ArrowLeft, 
  Search, 
  Users, 
  UserCheck, 
  UserX,
  Eye,
  Settings,
  Plus
} from 'lucide-react';
import Header from './Header';
import { toast } from '@/hooks/use-toast';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Load residents from API
  useEffect(() => {
    const loadResidents = async () => {
      try {
        console.log('AdminPanel: Loading residents from API...');
        const data = await residentService.getAll();
        console.log('AdminPanel: Loaded residents:', data);
        setResidents(data);
      } catch (error) {
        console.error('AdminPanel: Error loading residents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResidents();
  }, []);

  const filteredResidents = residents.filter(resident =>
    resident.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.apartment?.number?.includes(searchTerm) ||
    resident.building?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeResidents = residents.filter(r => r.estatus === 'ACTIVO').length;
  const suspendedResidents = residents.filter(r => r.estatus === 'SUSPENDIDO').length;

  const toggleResidentStatus = async (residentId: string) => {
    const resident = residents.find(r => r.id === residentId);
    if (!resident) return;
    
    const newStatus = resident.estatus === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO';
    
    try {
      // Llamar al API para actualizar en la base de datos
      await residentService.updateStatus(residentId, newStatus);
      
      // Actualizar el estado local si la API fue exitosa
      setResidents(prev => prev.map(r => {
        if (r.id === residentId) {
          return { ...r, estatus: newStatus };
        }
        return r;
      }));
      
      toast({
        title: "Estatus actualizado",
        description: `${resident.nombre} ${resident.apellido} ahora está ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estatus del residente",
        variant: "destructive",
      });
    }
  };

  const handleViewResident = (resident: Resident) => {
    setSelectedResident(resident);
    setIsDetailModalOpen(true);
  };

  const handlePhotoClick = (photo: string) => {
    // No hacer nada aquí - las fotos se manejan desde el modal de detalles
    console.log('Foto clickeada:', photo);
  };

  const handlePhotoUpdate = (residentId: string, newPhoto: string) => {
    setResidents(prev => prev.map(resident => {
      if (resident.id === residentId) {
        return { ...resident, profilePhoto: newPhoto };
      }
      return resident;
    }));
    
    if (selectedResident && selectedResident.id === residentId) {
      setSelectedResident({ ...selectedResident, profilePhoto: newPhoto });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Cargando residentes...</p>
          </div>
        ) : (
          <>
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="w-fit"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Volver al inicio</span>
              <span className="sm:hidden">Volver</span>
            </Button>

            <Button 
              variant="default"
              onClick={() => navigate('/add-associate')}
              className="bg-tlahuacali-red hover:bg-tlahuacali-red/90 text-white w-fit"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Agregar Residente</span>
              <span className="sm:hidden">Agregar</span>
            </Button>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Panel de Administración</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Gestiona el estatus de los residentes</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <Card className="bg-tlahuacali-cream">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Residentes</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{residents.length}</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-tlahuacali-cream">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Activos</p>
                  <p className="text-2xl sm:text-3xl font-bold text-success">{activeResidents}</p>
                </div>
                <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-tlahuacali-cream">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Suspendidos</p>
                  <p className="text-2xl sm:text-3xl font-bold text-destructive">{suspendedResidents}</p>
                </div>
                <UserX className="h-6 w-6 sm:h-8 sm:w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-tlahuacali-cream mb-6">
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Buscar Residentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nombre, apartamento o edificio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white text-sm sm:text-base"
              />
            </div>
          </CardContent>
        </Card>

        {/* Residents List */}
        <Card className="bg-tlahuacali-cream">
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Gestión de Residentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="space-y-3 sm:space-y-4">
              {filteredResidents.map((resident) => (
                <div 
                  key={resident.id} 
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white rounded-lg gap-3 sm:gap-4"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                    <div 
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-tlahuacali-red to-red-600 flex items-center justify-center relative"
                    >
                      {resident.profilePhoto ? (
                        <img 
                          src={`http://localhost:3001${resident.profilePhoto}`} 
                          alt={`${resident.nombre} ${resident.apellido}`}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePhotoClick(`http://localhost:3001${resident.profilePhoto}`);
                          }}
                          onError={(e) => {
                            console.log(`Error cargando foto: ${resident.profilePhoto}`);
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const initials = parent.querySelector('.card-initials');
                              if (initials) {
                                (initials as HTMLElement).style.display = 'flex';
                                (initials as HTMLElement).style.cursor = 'pointer';
                              }
                            }
                          }}
                        />
                      ) : null}
                      <span 
                        className={`card-initials absolute inset-0 flex items-center justify-center text-white font-bold text-xs sm:text-sm cursor-pointer ${
                          resident.profilePhoto ? 'hidden' : 'flex'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePhotoClick('/placeholder.svg');
                        }}
                      >
                        {(resident.nombre?.charAt(0) || '?').toUpperCase()}{(resident.apellido?.charAt(0) || '?').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
                        {resident.nombre} {resident.apellido}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {resident.building?.name ? 
                          `Torre ${resident.building.name} - Apt. ${resident.apartment?.number || 'N/A'}` :
                          'Sin ubicación asignada'
                        }
                      </p>
                      {resident.registrationDate && (
                        <p className="text-xs text-muted-foreground">
                          Registrado: {new Date(resident.registrationDate).toLocaleDateString('es-MX')}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant={resident.estatus === 'ACTIVO' ? 'default' : 'destructive'}
                          className={`text-xs ${resident.estatus === 'ACTIVO' 
                            ? 'bg-success text-white' 
                            : 'bg-destructive text-white'
                          }`}
                        >
                          {resident.estatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col lg:flex-row space-x-2 sm:space-x-0 sm:space-y-2 lg:space-y-0 lg:space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewResident(resident)}
                      className="flex-1 sm:flex-none text-xs sm:text-sm"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">Ver</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={resident.estatus === 'ACTIVO' ? 'destructive' : 'default'}
                      onClick={() => toggleResidentStatus(resident.id)}
                      className="flex-1 sm:flex-none text-xs sm:text-sm"
                    >
                      {resident.estatus === 'ACTIVO' ? (
                        <>
                          <UserX className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Suspender</span>
                          <span className="sm:hidden">Susp.</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Activar</span>
                          <span className="sm:hidden">Act.</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
              
              {filteredResidents.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">No se encontraron residentes</p>
                    {searchTerm && (
                      <p className="text-xs sm:text-sm mt-2">
                        Intenta con otros términos de búsqueda
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </>
        )}
      </main>

      {/* Modals */}
      {selectedResident && (
        <ResidentDetailModal
          resident={selectedResident}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onPhotoClick={handlePhotoClick}
        />
      )}
    </div>
  );
};

export default AdminPanel;
