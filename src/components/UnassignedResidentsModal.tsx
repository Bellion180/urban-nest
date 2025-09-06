import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Building, Home, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { residentService, buildingService } from '@/services/api';

interface UnassignedResident {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  estatus: 'ACTIVO' | 'SUSPENDIDO' | 'INACTIVO';
  deudaActual: number;
  pagosRealizados: number;
}

interface Building {
  id: string;
  name: string;
  floors: {
    id: string;
    name: string;
    number: number;
    apartments: {
      id: string;
      number: string;
    }[];
  }[];
}

interface UnassignedResidentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResidentAssigned?: () => void;
}

const UnassignedResidentsModal: React.FC<UnassignedResidentsModalProps> = ({ 
  isOpen, 
  onClose, 
  onResidentAssigned 
}) => {
  const [unassignedResidents, setUnassignedResidents] = useState<UnassignedResident[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [selectedAssignments, setSelectedAssignments] = useState<{
    [residentId: string]: { buildingId: string; apartmentId: string }
  }>({});

  // Cargar datos
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [residentsData, buildingsData] = await Promise.all([
        residentService.getUnassigned(),
        buildingService.getAll()
      ]);
      
      setUnassignedResidents(residentsData);
      setBuildings(buildingsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignResident = async (residentId: string) => {
    const assignment = selectedAssignments[residentId];
    if (!assignment) {
      toast({
        title: "Error",
        description: "Selecciona un edificio y apartamento",
        variant: "destructive"
      });
      return;
    }

    setAssigning(residentId);
    try {
      await residentService.assignBuilding(residentId, assignment.buildingId, assignment.apartmentId);
      
      const resident = unassignedResidents.find(r => r.id === residentId);
      const building = buildings.find(b => b.id === assignment.buildingId);
      const apartment = building?.floors
        .flatMap(f => f.apartments)
        .find(a => a.id === assignment.apartmentId);

      toast({
        title: "Residente asignado",
        description: `${resident?.nombre} ${resident?.apellido} fue asignado a ${building?.name} - Apt. ${apartment?.number}`
      });

      // Recargar datos
      await loadData();
      
      // Limpiar asignación
      setSelectedAssignments(prev => {
        const updated = { ...prev };
        delete updated[residentId];
        return updated;
      });

      // Notificar al componente padre
      onResidentAssigned?.();
      
    } catch (error) {
      console.error('Error assigning resident:', error);
      toast({
        title: "Error",
        description: "No se pudo asignar el residente",
        variant: "destructive"
      });
    } finally {
      setAssigning(null);
    }
  };

  const getAvailableApartments = (buildingId: string) => {
    const building = buildings.find(b => b.id === buildingId);
    return building?.floors.flatMap(floor => 
      floor.apartments.map(apt => ({
        id: apt.id,
        number: apt.number,
        floorName: floor.name
      }))
    ) || [];
  };

  const handleBuildingChange = (residentId: string, buildingId: string) => {
    setSelectedAssignments(prev => ({
      ...prev,
      [residentId]: { buildingId, apartmentId: '' }
    }));
  };

  const handleApartmentChange = (residentId: string, apartmentId: string) => {
    setSelectedAssignments(prev => ({
      ...prev,
      [residentId]: { 
        ...prev[residentId], 
        apartmentId 
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Residentes Sin Edificio Asignado
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-tlahuacali-red" />
            <span className="ml-2">Cargando residentes...</span>
          </div>
        ) : unassignedResidents.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No hay residentes sin edificio asignado</p>
            <p className="text-sm text-muted-foreground mt-2">
              Todos los residentes están asignados a un edificio
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Se encontraron <strong>{unassignedResidents.length}</strong> residentes sin edificio asignado.
                Selecciona un edificio y apartamento para cada uno:
              </p>
            </div>

            {unassignedResidents.map((resident) => (
              <Card key={resident.id} className="border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {resident.nombre} {resident.apellido}
                    </div>
                    <Badge variant={resident.estatus === 'ACTIVO' ? 'default' : 'destructive'}>
                      {resident.estatus}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm"><strong>Email:</strong> {resident.email}</p>
                      <p className="text-sm"><strong>Teléfono:</strong> {resident.telefono}</p>
                    </div>
                    <div>
                      <p className="text-sm"><strong>Deuda:</strong> ${resident.deudaActual || 0}</p>
                      <p className="text-sm"><strong>Pagos:</strong> ${resident.pagosRealizados || 0}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    {/* Selector de Edificio */}
                    <div>
                      <label className="text-sm font-medium mb-1 block">Edificio</label>
                      <Select
                        value={selectedAssignments[resident.id]?.buildingId || ''}
                        onValueChange={(value) => handleBuildingChange(resident.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar edificio" />
                        </SelectTrigger>
                        <SelectContent>
                          {buildings.map((building) => (
                            <SelectItem key={building.id} value={building.id}>
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                {building.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Selector de Apartamento */}
                    <div>
                      <label className="text-sm font-medium mb-1 block">Apartamento</label>
                      <Select
                        value={selectedAssignments[resident.id]?.apartmentId || ''}
                        onValueChange={(value) => handleApartmentChange(resident.id, value)}
                        disabled={!selectedAssignments[resident.id]?.buildingId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar apartamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableApartments(selectedAssignments[resident.id]?.buildingId || '').map((apartment) => (
                            <SelectItem key={apartment.id} value={apartment.id}>
                              <div className="flex items-center gap-2">
                                <Home className="h-4 w-4" />
                                {apartment.floorName} - Apt. {apartment.number}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Botón de Asignar */}
                    <Button
                      onClick={() => handleAssignResident(resident.id)}
                      disabled={
                        !selectedAssignments[resident.id]?.buildingId || 
                        !selectedAssignments[resident.id]?.apartmentId ||
                        assigning === resident.id
                      }
                      className="bg-tlahuacali-red hover:bg-tlahuacali-red/90"
                    >
                      {assigning === resident.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Asignando...
                        </>
                      ) : (
                        'Asignar'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnassignedResidentsModal;
