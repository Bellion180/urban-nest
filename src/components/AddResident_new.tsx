import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, Plus, User, DollarSign, FileText, X } from 'lucide-react';
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
    // Información personal
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    edad: '',
    noPersonas: '',
    noPersonasDiscapacitadas: '',
    discapacidad: false,
    
    // Información financiera
    deudaActual: '',
    pagosRealizados: '',
    fechasPagos: [''], // Array de fechas de pagos
    
    // Información INVI
    idInvi: '',
    mensualidades: '',
    fechaContrato: '',
    deuda: '',
    
    // Información Tlaxilacalli
    numero: '', // Antes era idCompanero
    exp: '',
    estacionamiento: false,
    montoEstacionamiento: '',
    apoyoRenta: false
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Si se desmarca la discapacidad, limpiar el número de personas discapacitadas
      if (field === 'discapacidad' && !value) {
        newData.noPersonasDiscapacitadas = '';
      }

      // Si se desmarca estacionamiento, limpiar el monto
      if (field === 'estacionamiento' && !value) {
        newData.montoEstacionamiento = '';
      }
      
      return newData;
    });
  };

  // Función para manejar fechas de pagos múltiples
  const handlePaymentDateChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      fechasPagos: prev.fechasPagos.map((fecha, i) => 
        i === index ? value : fecha
      )
    }));
  };

  const addPaymentDate = () => {
    setFormData(prev => ({
      ...prev,
      fechasPagos: [...prev.fechasPagos, '']
    }));
  };

  const removePaymentDate = (index: number) => {
    if (formData.fechasPagos.length > 1) {
      setFormData(prev => ({
        ...prev,
        fechasPagos: prev.fechasPagos.filter((_, i) => i !== index)
      }));
    }
  };

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

  const getFloorsForBuilding = () => {
    const building = buildings.find(b => b.id === selectedBuilding);
    return building?.floors || [];
  };

  const getApartmentsForFloor = () => {
    const building = buildings.find(b => b.id === selectedBuilding);
    const floor = building?.floors.find(f => f.id === selectedFloor);
    return floor?.apartments || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBuilding || !selectedFloor || !selectedApartment) {
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
        // Información personal
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email || undefined,
        telefono: formData.telefono || undefined,
        fechaNacimiento: formData.fechaNacimiento || undefined,
        edad: formData.edad ? parseInt(formData.edad) : undefined,
        noPersonas: formData.noPersonas ? parseInt(formData.noPersonas) : undefined,
        noPersonasDiscapacitadas: formData.noPersonasDiscapacitadas ? parseInt(formData.noPersonasDiscapacitadas) : 0,
        discapacidad: formData.discapacidad,
        
        // Información financiera
        deudaActual: formData.deudaActual ? parseFloat(formData.deudaActual) : 0,
        pagosRealizados: formData.pagosRealizados ? parseFloat(formData.pagosRealizados) : 0,
        fechasPagos: formData.fechasPagos.filter(fecha => fecha !== ''), // Solo fechas no vacías
        
        // Información de ubicación
        apartmentNumber: selectedApartment,
        buildingId: selectedBuilding,
        floorNumber: floorNumber,
        profilePhoto: profilePhoto || undefined,
        
        // Información INVI
        inviInfo: {
          idInvi: formData.idInvi || undefined,
          mensualidades: formData.mensualidades ? parseInt(formData.mensualidades) : undefined,
          fechaContrato: formData.fechaContrato || undefined,
          deuda: formData.deuda ? parseFloat(formData.deuda) : 0,
        },

        // Información Tlaxilacalli
        tlaxilacalliInfo: {
          numero: formData.numero || undefined,
          exp: formData.exp || undefined,
          estacionamiento: formData.estacionamiento,
          montoEstacionamiento: formData.montoEstacionamiento ? parseFloat(formData.montoEstacionamiento) : 0,
          apoyoRenta: formData.apoyoRenta
        }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/admin')}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
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
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="personal" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Personal
                    </TabsTrigger>
                    <TabsTrigger value="financiera" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Financiera
                    </TabsTrigger>
                    <TabsTrigger value="invi" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      INVI
                    </TabsTrigger>
                    <TabsTrigger value="tlaxilacalli" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Tlaxilacalli
                    </TabsTrigger>
                  </TabsList>

                  {/* Información Personal */}
                  <TabsContent value="personal" className="space-y-6">
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

                      <div className="space-y-2">
                        <Label htmlFor="edad">Edad</Label>
                        <Input 
                          id="edad" 
                          type="number"
                          placeholder="Edad" 
                          value={formData.edad}
                          onChange={(e) => handleInputChange('edad', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="noPersonas">Número de Personas</Label>
                        <Input 
                          id="noPersonas" 
                          type="number"
                          placeholder="Personas en el apartamento" 
                          value={formData.noPersonas}
                          onChange={(e) => handleInputChange('noPersonas', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="discapacidad">¿Hay personas con discapacidad?</Label>
                        <Select 
                          value={formData.discapacidad ? 'true' : 'false'}
                          onValueChange={(value) => handleInputChange('discapacidad', value === 'true')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="false">No</SelectItem>
                            <SelectItem value="true">Sí</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.discapacidad && (
                        <div className="space-y-2">
                          <Label htmlFor="noPersonasDiscapacitadas">Número de Personas con Discapacidad</Label>
                          <Input 
                            id="noPersonasDiscapacitadas" 
                            type="number"
                            min="1"
                            max={formData.noPersonas || undefined}
                            placeholder="Cantidad de personas con discapacidad" 
                            value={formData.noPersonasDiscapacitadas}
                            onChange={(e) => handleInputChange('noPersonasDiscapacitadas', e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Debe ser menor o igual al número total de personas
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Foto de Perfil */}
                    <div className="space-y-2">
                      <Label htmlFor="profilePhoto">Foto de Perfil</Label>
                      <Input 
                        id="profilePhoto" 
   