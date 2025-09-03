import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import Header from './Header';
import { toast } from '@/hooks/use-toast';
import { buildingService, residentService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface Building {
  id: string;
  name: string;
  floors: Array<{
    id: string;
    name: string;
    apartments: string[];
  }>;
}

const AddResident = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [loading, setLoading] = useState(false);
  const [loadingBuildings, setLoadingBuildings] = useState(true);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  const [selectedApartment, setSelectedApartment] = useState<string>('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fechaNacimiento: ''
  });

  // Cargar edificios al montar el componente
  useEffect(() => {
    const loadBuildings = async () => {
      try {
        const data = await buildingService.getAll();
        setBuildings(data);
      } catch (error) {
        console.error('Error loading buildings:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los edificios",
          variant: "destructive"
        });
      } finally {
        setLoadingBuildings(false);
      }
    };

    loadBuildings();
  }, []);

  // Obtener pisos del edificio seleccionado
  const getFloorsForBuilding = () => {
    const building = buildings.find(b => b.id === selectedBuilding);
    return building?.floors || [];
  };

  // Obtener apartamentos del piso seleccionado
  const getApartmentsForFloor = () => {
    const floors = getFloorsForBuilding();
    const floor = floors.find(f => f.id === selectedFloor);
    return floor?.apartments || [];
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast({
        title: "Error",
        description: "Solo los administradores pueden agregar residentes",
        variant: "destructive"
      });
      return;
    }

    if (!selectedApartment) {
      toast({
        title: "Error",
        description: "Por favor selecciona un apartamento",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Encontrar el edificio y piso seleccionados
      const building = buildings.find(b => b.id === selectedBuilding);
      const floor = building?.floors.find(f => f.id === selectedFloor);
      
      if (!building || !floor) {
        throw new Error('No se pudo encontrar el edificio o piso seleccionado');
      }

      // Obtener el número del piso del nombre (ej: "Piso 1" -> "1")
      const floorNumber = floor.name?.match(/\d+/)?.[0] || '1';

      // Preparar los datos para el servicio
      const residentData = {
        ...formData,
        apartmentNumber: selectedApartment,
        buildingId: selectedBuilding,
        floorNumber: floorNumber,
        profilePhoto: profilePhoto || undefined
      };

      // Crear el residente usando el servicio
      await residentService.createWithPhoto(residentData);

      toast({
        title: "Éxito",
        description: "Residente agregado correctamente",
      });
      
      navigate('/admin');
    } catch (error) {
      console.error('Error creating resident:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo agregar el residente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin')}
            disabled={loading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Panel
          </Button>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Plus className="h-6 w-6" />
              Agregar Nuevo Residente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingBuildings ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-tlahuacali-red" />
                <span className="ml-2">Cargando edificios...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información Personal */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Información Personal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input 
                        id="nombre" 
                        placeholder="Nombre del residente" 
                        value={formData.nombre}
                        onChange={(e) => handleInputChange('nombre', e.target.value)}
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apellido">Apellidos *</Label>
                      <Input 
                        id="apellido" 
                        placeholder="Apellidos del residente" 
                        value={formData.apellido}
                        onChange={(e) => handleInputChange('apellido', e.target.value)}
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="Correo electrónico" 
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input 
                        id="telefono" 
                        placeholder="Número de teléfono" 
                        value={formData.telefono}
                        onChange={(e) => handleInputChange('telefono', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                      <Input 
                        id="fechaNacimiento" 
                        type="date" 
                        value={formData.fechaNacimiento}
                        onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                      />
                    </div>

                  </div>

                  {/* Foto de Perfil */}
                  <div className="space-y-2">
                    <Label htmlFor="profilePhoto">Foto de Perfil</Label>
                    <Input 
                      id="profilePhoto" 
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                    {profilePhoto && (
                      <p className="text-sm text-green-600">
                        ✓ {profilePhoto.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ubicación */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Ubicación</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edificio">Edificio *</Label>
                      <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar edificio" />
                        </SelectTrigger>
                        <SelectContent>
                          {buildings.map((building) => (
                            <SelectItem key={building.id} value={building.id}>
                              {building.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="piso">Piso *</Label>
                      <Select 
                        value={selectedFloor} 
                        onValueChange={setSelectedFloor}
                        disabled={!selectedBuilding}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar piso" />
                        </SelectTrigger>
                        <SelectContent>
                          {getFloorsForBuilding().map((floor) => (
                            <SelectItem key={floor.id} value={floor.id}>
                              {floor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apartamento">Apartamento *</Label>
                      <Select 
                        value={selectedApartment} 
                        onValueChange={setSelectedApartment}
                        disabled={!selectedFloor}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar apartamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {getApartmentsForFloor().map((apartment) => (
                            <SelectItem key={apartment} value={apartment}>
                              {apartment}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-4 pt-6">
                  {isAdmin && (
                    <Button 
                      type="submit" 
                      disabled={loading || !selectedApartment}
                      className="bg-tlahuacali-red hover:bg-tlahuacali-red/90"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Agregando...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Agregar Residente
                        </>
                      )}
                    </Button>
                  )}
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/admin')}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </div>

                {!isAdmin && (
                  <div className="text-center py-4 text-red-600">
                    Solo los administradores pueden agregar residentes
                  </div>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AddResident;
