import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, Plus, User, DollarSign, FileText, Upload } from 'lucide-react';
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
    number: number;
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
  
  // Estados para documentos PDF
  const [documents, setDocuments] = useState({
    curp: null as File | null,
    comprobanteDomicilio: null as File | null,
    actaNacimiento: null as File | null,
    ine: null as File | null,
  });

  // Función para manejar cambios de documentos
  const handleDocumentChange = (documentType: keyof typeof documents, file: File | null) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: file
    }));
  };

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
    
    // Información INVI
    idInvi: '',
    mensualidades: '',
    fechaContrato: '',
    deuda: '',
    idCompanero: ''
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
      
      return newData;
    });
  };

  // Funciones para manejar las selecciones
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
        
        // Información de ubicación
        apartmentNumber: selectedApartment,
        buildingId: selectedBuilding,
        floorNumber: floorNumber,
        profilePhoto: profilePhoto || undefined,
        
        // Documentos PDF
        documents: documents,
        
        // Información INVI
        inviInfo: {
          idInvi: formData.idInvi || undefined,
          mensualidades: formData.mensualidades ? parseInt(formData.mensualidades) : undefined,
          fechaContrato: formData.fechaContrato || undefined,
          deuda: formData.deuda ? parseFloat(formData.deuda) : 0,
          idCompanero: formData.idCompanero || undefined
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
                    <TabsTrigger value="documentos" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Documentos
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
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      {profilePhoto && (
                        <p className="text-sm text-green-600">
                          Archivo seleccionado: {profilePhoto.name}
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  {/* Información Financiera */}
                  <TabsContent value="financiera" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="deudaActual">Deuda Actual ($)</Label>
                        <Input 
                          id="deudaActual" 
                          type="number"
                          step="0.01"
                          placeholder="0.00" 
                          value={formData.deudaActual}
                          onChange={(e) => handleInputChange('deudaActual', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pagosRealizados">Pagos Realizados ($)</Label>
                        <Input 
                          id="pagosRealizados" 
                          type="number"
                          step="0.01"
                          placeholder="0.00" 
                          value={formData.pagosRealizados}
                          onChange={(e) => handleInputChange('pagosRealizados', e.target.value)}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Información INVI */}
                  <TabsContent value="invi" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="idInvi">ID INVI</Label>
                        <Input 
                          id="idInvi" 
                          placeholder="Identificador INVI" 
                          value={formData.idInvi}
                          onChange={(e) => handleInputChange('idInvi', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mensualidades">Mensualidades</Label>
                        <Input 
                          id="mensualidades" 
                          type="number"
                          placeholder="Número de mensualidades" 
                          value={formData.mensualidades}
                          onChange={(e) => handleInputChange('mensualidades', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fechaContrato">Fecha de Contrato</Label>
                        <Input 
                          id="fechaContrato" 
                          type="date" 
                          value={formData.fechaContrato}
                          onChange={(e) => handleInputChange('fechaContrato', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deuda">Deuda INVI ($)</Label>
                        <Input 
                          id="deuda" 
                          type="number"
                          step="0.01"
                          placeholder="0.00" 
                          value={formData.deuda}
                          onChange={(e) => handleInputChange('deuda', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="idCompanero">ID Compañero</Label>
                        <Input 
                          id="idCompanero" 
                          placeholder="ID del compañero" 
                          value={formData.idCompanero}
                          onChange={(e) => handleInputChange('idCompanero', e.target.value)}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Documentos PDF */}
                  <TabsContent value="documentos" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* CURP */}
                      <div className="space-y-2">
                        <Label htmlFor="curp">CURP (PDF)</Label>
                        <Input 
                          id="curp" 
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleDocumentChange('curp', e.target.files?.[0] || null)}
                          className="cursor-pointer"
                        />
                        {documents.curp && (
                          <p className="text-sm text-green-600">
                            Archivo seleccionado: {documents.curp.name}
                          </p>
                        )}
                      </div>

                      {/* Comprobante de Domicilio */}
                      <div className="space-y-2">
                        <Label htmlFor="comprobanteDomicilio">Comprobante de Domicilio (PDF)</Label>
                        <Input 
                          id="comprobanteDomicilio" 
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleDocumentChange('comprobanteDomicilio', e.target.files?.[0] || null)}
                          className="cursor-pointer"
                        />
                        {documents.comprobanteDomicilio && (
                          <p className="text-sm text-green-600">
                            Archivo seleccionado: {documents.comprobanteDomicilio.name}
                          </p>
                        )}
                      </div>

                      {/* Acta de Nacimiento */}
                      <div className="space-y-2">
                        <Label htmlFor="actaNacimiento">Acta de Nacimiento (PDF)</Label>
                        <Input 
                          id="actaNacimiento" 
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleDocumentChange('actaNacimiento', e.target.files?.[0] || null)}
                          className="cursor-pointer"
                        />
                        {documents.actaNacimiento && (
                          <p className="text-sm text-green-600">
                            Archivo seleccionado: {documents.actaNacimiento.name}
                          </p>
                        )}
                      </div>

                      {/* INE */}
                      <div className="space-y-2">
                        <Label htmlFor="ine">INE (PDF)</Label>
                        <Input 
                          id="ine" 
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleDocumentChange('ine', e.target.files?.[0] || null)}
                          className="cursor-pointer"
                        />
                        {documents.ine && (
                          <p className="text-sm text-green-600">
                            Archivo seleccionado: {documents.ine.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Información sobre documentos</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Solo se aceptan archivos en formato PDF</li>
                        <li>• Los documentos se guardarán de forma segura</li>
                        <li>• Todos los documentos son opcionales durante el registro</li>
                        <li>• Pueden agregarse o actualizarse posteriormente</li>
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Selección de Ubicación */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Ubicación</h3>
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
