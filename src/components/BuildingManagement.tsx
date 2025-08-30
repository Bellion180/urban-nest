import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, Trash2, Edit3, X, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { buildingsData as initialBuildingsData, BuildingData, FloorData, getTotalApartments } from '@/data/buildingsData';

interface BuildingManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const BuildingManagement: React.FC<BuildingManagementProps> = ({ isOpen, onClose }) => {
  // Estado inicial con edificios existentes del sistema
  const [buildings, setBuildings] = useState<BuildingData[]>(initialBuildingsData);
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
    apartmentsPerFloor: 4
  });

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

  const saveEditing = () => {
    if (!editingBuilding) return;

    setBuildings(prev => prev.map(building => 
      building.id === editingBuilding.id 
        ? { ...building, name: editForm.name, description: editForm.description, floors: editForm.floors }
        : building
    ));

    toast({
      title: "Edificio actualizado",
      description: `${editForm.name} ha sido actualizado correctamente`
    });

    cancelEditing();
  };

  const addFloorToEdit = () => {
    const newFloorNumber = editForm.floors.length + 1;
    const newFloor: FloorData = {
      id: `piso-${newFloorNumber}`,
      name: `Piso ${newFloorNumber}`,
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

  const handleAddBuilding = () => {
    if (!newBuilding.name || !newBuilding.description || newBuilding.floors < 1 || newBuilding.apartmentsPerFloor < 1) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos correctamente",
        variant: "destructive"
      });
      return;
    }

    const floors: FloorData[] = [];
    for (let i = 1; i <= newBuilding.floors; i++) {
      const apartments: string[] = [];
      for (let j = 1; j <= newBuilding.apartmentsPerFloor; j++) {
        apartments.push(`${i}${j.toString().padStart(2, '0')}`);
      }
      floors.push({
        id: `piso-${i}`,
        name: `Piso ${i}`,
        apartments
      });
    }

    const building: BuildingData = {
      id: `edificio-${Date.now()}`,
      name: newBuilding.name,
      description: newBuilding.description,
      image: '/lovable-uploads/building-a.jpg',
      floors
    };

    setBuildings(prev => [...prev, building]);
    setNewBuilding({ name: '', description: '', floors: 1, apartmentsPerFloor: 4 });
    setShowAddForm(false);
    
    toast({
      title: "Edificio agregado",
      description: `${building.name} ha sido agregado correctamente`
    });
  };

  const handleDeleteBuilding = (buildingId: string) => {
    const building = buildings.find(b => b.id === buildingId);
    setBuildings(prev => prev.filter(b => b.id !== buildingId));
    
    toast({
      title: "Edificio eliminado",
      description: `${building?.name} ha sido eliminado`
    });
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
          {/* Add Building Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Edificios Registrados</h3>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-tlahuacali-red hover:bg-tlahuacali-red/90 text-white"
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
                      onChange={(e) => setNewBuilding(prev => ({ ...prev, floors: parseInt(e.target.value) || 1 }))}
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
                </div>
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={handleAddBuilding}
                    className="bg-tlahuacali-red hover:bg-tlahuacali-red/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Edificio
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={saveEditing}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelEditing}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditing(building)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBuilding(building.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
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
                      {building.floors.map((floor) => (
                        <div key={floor.id} className="flex justify-between items-center text-sm">
                          <span className="font-medium">{floor.name}:</span>
                          <span className="text-muted-foreground">
                            Dpto. {floor.apartments.join(', ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {buildings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay edificios registrados</p>
              <p className="text-sm">Haz clic en "Agregar Edificio" para comenzar</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuildingManagement;
