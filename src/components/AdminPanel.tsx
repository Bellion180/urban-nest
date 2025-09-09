import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useEffect, useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Resident } from '@/types/user';
import ResidentDetailModal from './ResidentDetailModal';
import EditResidentModal from './EditResidentModal';
import SimplePhotoModal from './SimplePhotoModal';
import BuildingManagement from './BuildingManagement';
import UnassignedResidentsModal from './UnassignedResidentsModal';
import PaymentModal from './PaymentModal';
import { 
  ArrowLeft, 
  Search, 
  Users, 
  UserCheck, 
  UserX,
  Eye,
  Edit,
  Settings,
  Plus,
  Building,
  Loader2,
  Trash2,
  DollarSign
} from 'lucide-react';
import Header from './Header';
import { toast } from '@/hooks/use-toast';
import { residentService } from '@/services/api';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState('');
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [showUnassignedModal, setShowUnassignedModal] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const filteredResidents = residents.filter(resident =>
    resident.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.apartment?.number?.includes(searchTerm) ||
    resident.building?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeResidents = residents.filter(r => r.estatus === 'ACTIVO').length;
  const suspendedResidents = residents.filter(r => r.estatus === 'SUSPENDIDO').length;

  // Cargar residentes desde la API
  const loadResidents = async () => {
    setLoading(true);
    try {
      const data = await residentService.getAll();
      setResidents(data);
    } catch (error) {
      console.error('Error loading residents:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los residentes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResidents();
  }, []);

  const toggleResidentStatus = (residentId: string) => {
    if (!isAdmin) return;
    const resident = residents.find(r => r.id === residentId);
    if (!resident) return;
    const newStatus = resident.estatus === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO';
    fetch(`http://localhost:3001/api/residents/${residentId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ estatus: newStatus })
    })
      .then(res => res.json())
      .then(data => {
        toast({
          title: "Estatus actualizado",
          description: `${resident.nombre} ${resident.apellido} ahora está ${newStatus}`,
        });
        setResidents(prev => prev.map(r => r.id === residentId ? { ...r, estatus: newStatus } : r));
      })
      .catch(error => {
        console.error('Error updating status:', error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el estatus del residente",
          variant: "destructive"
        });
      });
  };

  const handleViewResident = (resident: Resident) => {
    setSelectedResident(resident);
    setIsDetailModalOpen(true);
  };

  const handleEditResident = (resident: Resident) => {
    setSelectedResident(resident);
    setIsEditModalOpen(true);
  };

  const handleUpdateResident = (updatedResident: Resident) => {
    setResidents(prev => prev.map(resident => 
      resident.id === updatedResident.id ? updatedResident : resident
    ));
  };

  const handleDeleteResident = async (residentId: string, residentName: string) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar al residente ${residentName}? Esta acción no se puede deshacer.`
    );
    
    if (!confirmed) return;

    try {
      await residentService.delete(residentId);
      
      // Actualizar la lista de residentes
      setResidents(prev => prev.filter(resident => resident.id !== residentId));
      
      toast({
        title: "Residente eliminado",
        description: `${residentName} ha sido eliminado correctamente.`,
      });
    } catch (error) {
      console.error('Error deleting resident:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el residente. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handlePhotoClick = (photo: string) => {
    setCurrentPhoto(photo);
    setIsPhotoModalOpen(true);
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

  const handlePayment = (resident: Resident) => {
    setSelectedResident(resident);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = () => {
    setIsPaymentModalOpen(false);
    setSelectedResident(null);
    // Recargar los residentes para obtener la información actualizada
    loadResidents();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
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

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {isAdmin && (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => setShowBuildingModal(true)}
                    className="border-tlahuacali-red text-tlahuacali-red hover:bg-tlahuacali-red hover:text-white w-fit"
                  >
                    <Building className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Gestionar Edificios</span>
                    <span className="sm:hidden">Edificios</span>
                  </Button>

                  <Button 
                    variant="outline"
                    onClick={() => setShowUnassignedModal(true)}
                    className="border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white w-fit"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Residentes Sin Edificio</span>
                    <span className="sm:hidden">Sin Edificio</span>
                  </Button>

                  <Button 
                    variant="default"
                    onClick={() => navigate('/add-resident')}
                    disabled={loading}
                    className="bg-tlahuacali-red hover:bg-tlahuacali-red/90 text-white w-fit"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Agregar Residente</span>
                    <span className="sm:hidden">Agregar</span>
                  </Button>
                </>
              )}
            </div>
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-tlahuacali-red" />
                <span className="ml-2 text-muted-foreground">Cargando residentes...</span>
              </div>
            ) : (
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
                              const initials = parent.querySelector('.admin-initials');
                              if (initials) {
                                (initials as HTMLElement).style.display = 'flex';
                                (initials as HTMLElement).style.cursor = 'pointer';
                              }
                            }
                          }}
                        />
                      ) : null}
                      <span 
                        className={`admin-initials absolute inset-0 flex items-center justify-center text-white font-bold text-xs sm:text-sm cursor-pointer ${
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
                        {resident.building?.name} - {resident.apartment?.floor?.name} - Apt. {resident.apartment?.number}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant={resident.estatus === 'ACTIVO' ? 'default' : 'destructive'}
                          className={`text-xs ${resident.estatus === 'ACTIVO' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                          }`}
                        >
                          {resident.estatus}
                        </Badge>
                        {resident.hasKey && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            🔑 Con llave
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col lg:flex-row space-x-1 sm:space-x-0 sm:space-y-1 lg:space-y-0 lg:space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewResident(resident)}
                      className="flex-1 sm:flex-none text-xs sm:text-sm"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">Ver</span>
                    </Button>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEditResident(resident)}
                        className="flex-1 sm:flex-none text-xs sm:text-sm"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Editar</span>
                        <span className="sm:hidden">Edit.</span>
                      </Button>
                    )}
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePayment(resident)}
                        className="flex-1 sm:flex-none text-xs sm:text-sm border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                      >
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Realizar Pago</span>
                        <span className="sm:hidden">Pago</span>
                      </Button>
                    )}
                    {isAdmin && (
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
                    )}
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteResident(resident.id, `${resident.nombre} ${resident.apellido}`)}
                        className="flex-1 sm:flex-none text-xs sm:text-sm border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Eliminar</span>
                        <span className="sm:hidden">Del.</span>
                      </Button>
                    )}
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
            )}

            {/* Empty state para cuando no hay residentes */}
            {!loading && residents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No hay residentes registrados</p>
                <p className="text-sm mt-2">
                  Haz clic en "Agregar Residente" para comenzar
                </p>
              </div>
            )}
          </CardContent>
        </Card>
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

      {selectedResident && (
        <EditResidentModal
          resident={selectedResident}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateResident}
        />
      )}

      {selectedResident && (
        <PaymentModal
          resident={selectedResident}
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentSuccess={handlePaymentComplete}
        />
      )}
      
      <SimplePhotoModal
        photo={currentPhoto}
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />

      <BuildingManagement
        isOpen={showBuildingModal}
        onClose={() => setShowBuildingModal(false)}
      />

      <UnassignedResidentsModal
        isOpen={showUnassignedModal}
        onClose={() => setShowUnassignedModal(false)}
        onResidentAssigned={() => {
          // Recargar residentes cuando se asigne uno
          loadResidents();
        }}
      />
    </div>
  );
};

export default AdminPanel;
