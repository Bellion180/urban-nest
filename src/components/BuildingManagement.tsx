import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, Trash2, Edit3, X, Save, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { buildingService } from '@/services/api';

// Tipos locales para el componente
interface FloorData {
  id: string;
  name: string;
  number?: number;
  apartments: string[];
}

interface BuildingData {
  id: string;
  name: string;
  description: string;
  image?: string;
  floors: FloorData[];
  totalApartments?: number;
  totalResidents?: number;
}

// Helper function
const getTotalApartments = (building: BuildingData) => 
  building.floors.reduce((total, floor) => total + floor.apartments.length, 0);

interface BuildingManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const BuildingManagement: React.FC<BuildingManagementProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';
  
  const [buildings, setBuildings] = useState<BuildingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [floorImages, setFloorImages] = useState<{[buildingId: string]: any[]}>({});
  const [showFloorImages, setShowFloorImages] = useState<{[buildingId: string]: boolean}>({});

  // Cargar edificios desde la API
  const loadBuildings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await buildingService.getAll();
      setBuildings(data);
    } catch (err) {
      setError('Error al cargar los edificios');
      console.error('Error loading buildings:', err);
      toast({
        title: "Error",
        description: "No se pudieron cargar los edificios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar imágenes de pisos para un edificio
  const loadFloorImages = async (buildingId: string) => {
    try {
      console.log('Cargando imágenes de pisos para edificio:', buildingId);
      const data = await buildingService.getFloorImages(buildingId);
      console.log('Datos recibidos de imágenes de pisos:', data);
      setFloorImages(prev => ({
        ...prev,
        [buildingId]: data.floorImages
      }));
    } catch (error) {
      console.error('Error loading floor images:', error);
    }
  };

  // Alternar visualización de imágenes de pisos
  const toggleFloorImages = async (buildingId: string) => {
    console.log('Alternando visualización de imágenes de pisos para:', buildingId);
    const isCurrentlyShown = showFloorImages[buildingId];
    console.log('Estado actual de mostrar imágenes:', isCurrentlyShown);
    setShowFloorImages(prev => ({
      ...prev,
      [buildingId]: !isCurrentlyShown
    }));

    // Si va a mostrar las imágenes y no las ha cargado, cargarlas
    if (!isCurrentlyShown && !floorImages[buildingId]) {
      console.log('Cargando imágenes de pisos...');
      await loadFloorImages(buildingId);
    } else {
      console.log('Imágenes ya cargadas o ocultando:', floorImages[buildingId]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadBuildings();
    }
  }, [isOpen]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<BuildingData | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    floors: FloorData[];
  }>({
    name: '',
    description: '',
    floors: []
  });
  const [newBuilding, setNewBuilding] = useState({
    name: '',
    description: '',
    floors: 1,
    apartmentsPerFloor: 4,
    image: null as File | null,
    floorImages: [] as (File | null)[],
  });

  // Función para actualizar imágenes de pisos
  const updateFloorImage = (floorIndex: number, file: File | null) => {
    setNewBuilding(prev => {
      const newFloorImages = [...prev.floorImages];
      newFloorImages[floorIndex] = file;
      return { ...prev, floorImages: newFloorImages };
    });
  };

  // Función para actualizar número de pisos y ajustar array de imágenes
  const updateFloorsCount = (count: number) => {
    setNewBuilding(prev => {
      const newFloorImages = new Array(count).fill(null);
      // Mantener las imágenes existentes si hay menos pisos
      for (let i = 0; i < Math.min(count, prev.floorImages.length); i++) {
        newFloorImages[i] = prev.floorImages[i];
      }
      return { ...prev, floors: count, floorImages: newFloorImages };
    });
  };

  // Funciones para manejar la edición
  const startEditing = (building: BuildingData) => {
    setEditingBuilding(building);
    setEditForm({
      name: building.name,
      description: building.description,
      floors: building.floors
    });
  };

  const cancelEditing = () => {
    setEditingBuilding(null);
    setEditForm({
      name: '',
      description: '',
      floors: []
    });
  };

  const saveEditing = async () => {
    if (!editingBuilding || !isAdmin) return;

    try {
      setLoading(true);
      
      // Validar que los campos requeridos estén presentes
      if (!editForm.name || !editForm.description) {
        throw new Error('Por favor complete todos los campos requeridos');
      }

      // Validar la estructura de los pisos
      if (!editForm.floors.every(floor => 
        floor.name && floor.number && Array.isArray(floor.apartments) && floor.apartments.length > 0
      )) {
        throw new Error('Todos los pisos deben tener nombre, número y al menos un apartamento');
      }

      // Actualizar el edificio con toda la información
      await buildingService.update(editingBuilding.id, {
        name: editForm.name,
        description: editForm.description,
        floors: editForm.floors.map(floor => ({
          id: floor.id.startsWith('temp-') ? undefined : floor.id,
          name: floor.name,
          number: floor.number,
          apartments: floor.apartments
        }))
      });

      toast({
        title: "Edificio actualizado",
        description: `${editForm.name} ha sido actualizado correctamente`
      });

      // Recargar edificios para mostrar los cambios
      await loadBuildings();
      cancelEditing();
    } catch (error) {
      console.error('Error updating building:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el edificio",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addFloorToEdit = () => {
    const newFloorNumber = editForm.floors.length + 1;
    const newFloor: FloorData = {
      id: `temp-piso-${Date.now()}`, // ID temporal para el frontend
      name: `Piso ${newFloorNumber}`,
      number: newFloorNumber,
      apartments: [`${newFloorNumber}01`, `${newFloorNumber}02`, `${newFloorNumber}03`, `${newFloorNumber}04`]
    };
    setEditForm(prev => ({
      ...prev,
      floors: [...prev.floors, newFloor]
    }));
  };

  const removeFloorFromEdit = (floorId: string) => {
    setEditForm(prev => ({
      ...prev,
      floors: prev.floors.filter(floor => floor.id !== floorId)
    }));
  };

  const updateFloorApartments = (floorId: string, apartments: string[]) => {
    setEditForm(prev => ({
      ...prev,
      floors: prev.floors.map(floor => 
        floor.id === floorId ? { ...floor, apartments } : floor
      )
    }));
  };

  const handleAddBuilding = async () => {
    if (!isAdmin) return;
    if (!newBuilding.name || !newBuilding.description || newBuilding.floors < 1 || newBuilding.apartmentsPerFloor < 1) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos correctamente",
        variant: "destructive"
      });
      return;
    }
    try {
      setLoading(true);
      // Crear estructura de pisos para enviar al backend
      const floors: FloorData[] = [];
      for (let i = 1; i <= newBuilding.floors; i++) {
        const apartments: string[] = [];
        for (let j = 1; j <= newBuilding.apartmentsPerFloor; j++) {
          apartments.push(`${i}${j.toString().padStart(2, '0')}`);
        }
        floors.push({
          id: `temp-piso-${i}`,
          name: `Piso ${i}`,
          number: i,
          apartments
        });
      }
      // Usar FormData para enviar imagen y datos
      const formData = new FormData();
      formData.append('name', newBuilding.name);
      formData.append('description', newBuilding.description);
      formData.append('floors', JSON.stringify(floors.map(floor => ({ name: floor.name, number: floor.number, apartments: floor.apartments }))));
      if (newBuilding.image) {
        formData.append('image', newBuilding.image);
      }
      // Enviar al backend
      const createdBuilding = await buildingService.createWithImage(formData);
      
      // Subir imágenes de pisos si las hay
      if (newBuilding.floorImages.some(img => img !== null)) {
        for (let i = 0; i < newBuilding.floorImages.length; i++) {
          const floorImage = newBuilding.floorImages[i];
          if (floorImage) {
            try {
              const pisoNumber = i + 1; // Los pisos empiezan en 1
              await buildingService.uploadFloorImage(createdBuilding.building.id, pisoNumber, floorImage);
              console.log(`Imagen del piso ${pisoNumber} subida correctamente`);
            } catch (floorError) {
              console.error(`Error subiendo imagen del piso ${i + 1}:`, floorError);
              toast({
                title: "Advertencia",
                description: `No se pudo subir la imagen del piso ${i + 1}`,
                variant: "destructive"
              });
            }
          }
        }
      }

      toast({
        title: "Edificio agregado",
        description: `${newBuilding.name} ha sido agregado correctamente`
      });
      await loadBuildings();
      setNewBuilding({ name: '', description: '', floors: 1, apartmentsPerFloor: 4, image: null, floorImages: [] });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error creating building:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el edificio",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBuilding = async (buildingId: string) => {
    if (!isAdmin) return;
    
    const building = buildings.find(b => b.id === buildingId);
    
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar el edificio "${building?.name}"?\n\n` +
      `Si hay residentes en este edificio, serán desasignados y podrán ser reasignados a otro edificio después.\n\n` +
      `Esta acción no se puede deshacer.`
    );
    
    if (!confirmed) return;
    
    try {
      setLoading(true);
      const result = await buildingService.delete(buildingId);
      
      let toastMessage = `${building?.name} ha sido eliminado`;
      
      if (result.desassignedResidents && result.desassignedResidents.length > 0) {
        toastMessage += `\n\n${result.desassignedResidents.length} residentes fueron desasignados:\n${result.desassignedResidents.join(', ')}`;
      }
      
      toast({
        title: "Edificio eliminado",
        description: toastMessage
      });

      // Recargar edificios
      await loadBuildings();
      
    } catch (error) {
      console.error('Error deleting building:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el edificio",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Gestión de Edificios
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-tlahuacali-red" />
              <span className="ml-2 text-muted-foreground">Cargando edificios...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
              <Button 
                variant="outline" 
                onClick={loadBuildings}
                className="mt-2"
              >
                Reintentar
              </Button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Add Building Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Edificios Registrados</h3>
                <Button
                  onClick={() => isAdmin && setShowAddForm(true)}
                  className={`bg-tlahuacali-red hover:bg-tlahuacali-red/90 text-white ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!isAdmin}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Edificio
                </Button>
              </div>

          {/* Add Building Form */}
          {showAddForm && (
            <Card className="border-tlahuacali-red/20 bg-tlahuacali-cream/10">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Nuevo Edificio</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Nombre del Edificio *</Label>
                    <Input
                      value={newBuilding.name}
                      onChange={(e) => setNewBuilding(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: Edificio H"
                    />
                  </div>
                  <div>
                    <Label>Descripción *</Label>
                    <Input
                      value={newBuilding.description}
                      onChange={(e) => setNewBuilding(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Ej: Torre moderna con..."
                    />
                  </div>
                  <div>
                    <Label>Número de Pisos *</Label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={newBuilding.floors}
                      onChange={(e) => updateFloorsCount(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label>Departamentos por Piso *</Label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={newBuilding.apartmentsPerFloor}
                      onChange={(e) => setNewBuilding(prev => ({ ...prev, apartmentsPerFloor: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div>
                    <Label>Foto del Edificio</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={e => setNewBuilding(prev => ({ ...prev, image: e.target.files?.[0] || null }))}
                    />
                  </div>
                </div>
                
                {/* Sección para imágenes de pisos */}
                {newBuilding.floors > 0 && (
                  <div className="mt-4 space-y-3">
                    <Label className="text-sm font-medium">Fotos de Pisos (Opcional)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Array.from({ length: newBuilding.floors }, (_, index) => (
                        <div key={index} className="border rounded p-3 space-y-2">
                          <Label className="text-sm">Piso {index + 1}</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => updateFloorImage(index, e.target.files?.[0] || null)}
                            className="text-sm"
                          />
                          {newBuilding.floorImages[index] && (
                            <p className="text-xs text-green-600">
                              ✓ {newBuilding.floorImages[index]?.name}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 mt-4">
                  {isAdmin && (
                    <Button
                      onClick={handleAddBuilding}
                      disabled={loading}
                      className="bg-tlahuacali-red hover:bg-tlahuacali-red/90 text-white"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Crear Edificio
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Buildings List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buildings.map((building) => (
              <Card key={building.id} className="bg-tlahuacali-cream/30">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      {editingBuilding?.id === building.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editForm.name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            className="font-semibold"
                          />
                          <Input
                            value={editForm.description}
                            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                            className="text-sm"
                          />
                        </div>
                      ) : (
                        <div>
                          <CardTitle className="text-lg">{building.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{building.description}</p>
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">
                          {editingBuilding?.id === building.id ? editForm.floors.length : building.floors.length} pisos
                        </Badge>
                        <Badge variant="secondary">
                          {editingBuilding?.id === building.id 
                            ? editForm.floors.reduce((total, floor) => total + floor.apartments.length, 0)
                            : getTotalApartments(building)} departamentos
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {editingBuilding?.id === building.id ? (
                        <>
                          {isAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={saveEditing}
                                disabled={loading}
                                className="text-green-600 hover:text-green-700"
                              >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelEditing}
                                disabled={loading}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          {isAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startEditing(building)}
                                disabled={loading}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteBuilding(building.id)}
                                disabled={loading}
                                className="text-red-600 hover:text-red-700"
                              >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {/* Imagen del edificio */}
                {building.image && (
                  <div className="px-6 pb-2">
                    <div className="aspect-video relative overflow-hidden rounded-lg">
                      <img 
                        src={`http://localhost:3001${building.image}`} 
                        alt={building.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
                
                <CardContent>
                  {editingBuilding?.id === building.id ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Pisos y Departamentos:</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addFloorToEdit}
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Piso
                        </Button>
                      </div>
                      {editForm.floors.map((floor, index) => (
                        <div key={floor.id} className="border rounded p-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm">{floor.name}</Label>
                            {editForm.floors.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFloorFromEdit(floor.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <Input
                            value={floor.apartments.join(', ')}
                            onChange={(e) => {
                              const apartmentList = e.target.value.split(',').map(apt => apt.trim()).filter(Boolean);
                              updateFloorApartments(floor.id, apartmentList);
                            }}
                            placeholder="101, 102, 103..."
                            className="text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">Pisos y Departamentos:</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleFloorImages(building.id)}
                          className="text-xs"
                        >
                          {showFloorImages[building.id] ? 'Ocultar' : 'Ver'} Fotos
                        </Button>
                      </div>
                      
                      {building.floors.map((floor) => (
                        <div key={floor.id} className="flex justify-between items-center text-sm">
                          <span className="font-medium">{floor.name}:</span>
                          <span className="text-muted-foreground">
                            Dpto. {floor.apartments.join(', ')}
                          </span>
                        </div>
                      ))}
                      
                      {/* Mostrar imágenes de pisos */}
                      {showFloorImages[building.id] && floorImages[building.id] && (
                        <div className="mt-3 space-y-2">
                          <Label className="text-sm font-medium">Fotos de Pisos:</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {floorImages[building.id].map((floorImg: any) => {
                              console.log('Renderizando imagen de piso:', floorImg);
                              return (
                                <div key={floorImg.pisoNumber} className="border rounded p-2">
                                  <p className="text-xs font-medium mb-1">{floorImg.pisoName}</p>
                                  <img 
                                    src={`http://localhost:3001${floorImg.imageUrl}`}
                                    alt={`Piso ${floorImg.pisoNumber}`}
                                    className="w-full h-20 object-cover rounded"
                                    onError={(e) => {
                                      console.error('Error cargando imagen:', floorImg.imageUrl);
                                      e.currentTarget.src = '/placeholder.svg';
                                    }}
                                    onLoad={() => {
                                      console.log('Imagen cargada exitosamente:', floorImg.imageUrl);
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                          {floorImages[building.id].length === 0 && (
                            <p className="text-xs text-muted-foreground">No hay fotos de pisos disponibles</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {buildings.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay edificios registrados</p>
              <p className="text-sm">Haz clic en "Agregar Edificio" para comenzar</p>
            </div>
          )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuildingManagement;
