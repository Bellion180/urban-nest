import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { residentService, buildingService } from '@/services/api';
import { Resident } from '@/types/user';
import { 
  User, 
  DollarSign, 
  FileText, 
  Save, 
  X,
  Loader2,
  Calendar,
  Phone,
  Mail,
  Home,
  Users as UsersIcon,
  Upload,
  File
} from 'lucide-react';

interface EditResidentModalProps {
  resident: Resident;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedResident: Resident) => void;
}

const EditResidentModal = ({ resident, isOpen, onClose, onUpdate }: EditResidentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Información personal
    nombre: '',
    apellido: '',
    edad: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    noPersonas: '',
    noPersonasDiscapacitadas: '',
    discapacidad: false,
    
    // Información financiera
    deudaActual: '',
    pagosRealizados: '',
    
    // Información INVI
    informe: '',
    idInvi: '',
    mensualidades: '',
    deudaInvi: '',
    fechaContrato: '',
    idCompanero: ''
  });

  // Estados para documentos
  const [documentFiles, setDocumentFiles] = useState({
    curp: null as File | null,
    comprobanteDomicilio: null as File | null,
    actaNacimiento: null as File | null,
    ine: null as File | null
  });

  const [currentDocuments, setCurrentDocuments] = useState({
    curp: '',
    comprobanteDomicilio: '',
    actaNacimiento: '',
    ine: ''
  });

  const [documentsToRemove, setDocumentsToRemove] = useState<string[]>([]);

  // Estados para edificios, pisos y apartamentos
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  const [selectedApartment, setSelectedApartment] = useState<string>('');
  const [loadingBuildings, setLoadingBuildings] = useState(false);

  // Cargar datos del residente cuando se abre el modal
  useEffect(() => {
    if (resident && isOpen) {
      setFormData({
        nombre: resident.nombre || '',
        apellido: resident.apellido || '',
        edad: resident.edad?.toString() || '',
        email: resident.email || '',
        telefono: resident.telefono || '',
        fechaNacimiento: resident.fechaNacimiento ? new Date(resident.fechaNacimiento).toISOString().split('T')[0] : '',
        noPersonas: resident.noPersonas?.toString() || '',
        noPersonasDiscapacitadas: resident.noPersonasDiscapacitadas?.toString() || '0',
        discapacidad: resident.discapacidad || false,
        deudaActual: resident.deudaActual?.toString() || '0',
        pagosRealizados: resident.pagosRealizados?.toString() || '0',
        informe: resident.informe || '',
        idInvi: resident.inviInfo?.idInvi || '',
        mensualidades: resident.inviInfo?.mensualidades || '',
        deudaInvi: resident.inviInfo?.deuda?.toString() || '',
        fechaContrato: resident.inviInfo?.fechaContrato ? new Date(resident.inviInfo.fechaContrato).toISOString().split('T')[0] : '',
        idCompanero: resident.inviInfo?.idCompanero || ''
      });

      // Cargar documentos actuales
      setCurrentDocuments({
        curp: resident.documentoCurp || '',
        comprobanteDomicilio: resident.documentoComprobanteDomicilio || '',
        actaNacimiento: resident.documentoActaNacimiento || '',
        ine: resident.documentoIne || ''
      });

      // Limpiar archivos seleccionados
      setDocumentFiles({
        curp: null,
        comprobanteDomicilio: null,
        actaNacimiento: null,
        ine: null
      });

      // Limpiar documentos marcados para eliminación
      setDocumentsToRemove([]);

      // Inicializar selecciones de edificio
      if (resident.buildingId) {
        setSelectedBuilding(resident.buildingId);
      }
      if (resident.apartment?.floor?.id) {
        setSelectedFloor(resident.apartment.floor.id);
      }
      if (resident.apartmentId) {
        setSelectedApartment(resident.apartmentId);
      }
    }
  }, [resident, isOpen]);

  // Cargar edificios
  useEffect(() => {
    const loadBuildings = async () => {
      try {
        setLoadingBuildings(true);
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

    if (isOpen) {
      loadBuildings();
    }
  }, [isOpen]);

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

  const handleDocumentChange = (documentType: keyof typeof documentFiles, file: File | null) => {
    setDocumentFiles(prev => ({
      ...prev,
      [documentType]: file
    }));
  };

  const handleBuildingChange = (buildingId: string) => {
    setSelectedBuilding(buildingId);
    setSelectedFloor('');
    setSelectedApartment('');
  };

  const handleFloorChange = (floorId: string) => {
    setSelectedFloor(floorId);
    setSelectedApartment('');
  };

  const handleApartmentChange = (apartmentId: string) => {
    setSelectedApartment(apartmentId);
  };

  const handleRemoveDocument = (documentType: keyof typeof currentDocuments) => {
    // Marcar el documento para eliminación
    setDocumentsToRemove(prev => {
      if (!prev.includes(documentType)) {
        return [...prev, documentType];
      }
      return prev;
    });
    
    // Limpiar el documento de la vista actual
    setCurrentDocuments(prev => ({
      ...prev,
      [documentType]: ''
    }));
    
    // También limpiar cualquier archivo seleccionado para este tipo
    setDocumentFiles(prev => ({
      ...prev,
      [documentType]: null
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Preparar datos para enviar
      const updateData: any = {
        ...formData,
        edad: formData.edad ? parseInt(formData.edad) : null,
        noPersonas: formData.noPersonas ? parseInt(formData.noPersonas) : null,
        noPersonasDiscapacitadas: formData.noPersonasDiscapacitadas ? parseInt(formData.noPersonasDiscapacitadas) : 0,
        deudaActual: formData.deudaActual ? parseFloat(formData.deudaActual) : 0,
        pagosRealizados: formData.pagosRealizados ? parseFloat(formData.pagosRealizados) : 0,
        fechaNacimiento: formData.fechaNacimiento || null,
        // Estructurar información INVI
        inviInfo: {
          idInvi: formData.idInvi,
          mensualidades: formData.mensualidades,
          deuda: formData.deudaInvi ? parseFloat(formData.deudaInvi) : 0,
          fechaContrato: formData.fechaContrato || null,
          idCompanero: formData.idCompanero || null
        }
      };

      // Agregar información de ubicación si se ha modificado
      if (selectedBuilding && selectedBuilding !== resident.buildingId) {
        updateData.buildingId = selectedBuilding;
      }
      if (selectedApartment && selectedApartment !== resident.apartmentId) {
        updateData.apartmentId = selectedApartment;
        // Obtener información del piso seleccionado
        const building = buildings.find(b => b.id === selectedBuilding);
        const floor = building?.floors.find((f: any) => f.id === selectedFloor);
        if (floor) {
          updateData.floorNumber = floor.number?.toString() || floor.name?.match(/\d+/)?.[0] || '1';
        }
      }

      // Remover campos INVI individuales del objeto principal
      delete updateData.idInvi;
      delete updateData.mensualidades;
      delete updateData.deudaInvi;
      delete updateData.fechaContrato;
      delete updateData.idCompanero;

      // Si hay documentos para eliminar, enviar con el endpoint normal
      const hasDocumentsToRemove = documentsToRemove.length > 0;
      
      if (hasDocumentsToRemove) {
        // Agregar lista de documentos a eliminar a los datos de actualización
        const updateDataWithDocs = {
          ...updateData,
          removeDocuments: JSON.stringify(documentsToRemove)
        };
        
        // Usar el endpoint normal PUT que funciona
        const updatedResident = await residentService.update(resident.id, updateDataWithDocs);
        
        toast({
          title: "Residente actualizado",
          description: `Los datos de ${formData.nombre} ${formData.apellido} han sido actualizados correctamente.`,
        });

        onUpdate(updatedResident.resident || updatedResident);
      } else {
        // Si solo hay archivos de documentos para actualizar, usamos FormData
        const hasDocuments = Object.values(documentFiles).some(file => file !== null);
        
        if (hasDocuments) {
          const formDataToSend = new FormData();
          
          // Agregar todos los campos del formulario
          Object.entries(updateData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              if (key === 'inviInfo') {
                // Serializar objeto INVI como JSON
                formDataToSend.append(key, JSON.stringify(value));
              } else {
                formDataToSend.append(key, value.toString());
              }
            }
          });

          // Agregar documentos si existen
          Object.entries(documentFiles).forEach(([docType, file]) => {
            if (file) {
              formDataToSend.append(`documents_${docType}`, file);
            }
          });

          // Actualizar con documentos usando el endpoint normal (que también maneja FormData)
          const updatedResident = await residentService.updateWithDocuments(resident.id, formDataToSend);
          
          toast({
            title: "Residente actualizado",
            description: `Los datos y documentos de ${formData.nombre} ${formData.apellido} han sido actualizados correctamente.`,
          });

          onUpdate(updatedResident.resident || updatedResident);
        } else {
          // Actualizar solo los datos básicos
          const updatedResident = await residentService.update(resident.id, updateData);
          
          toast({
            title: "Residente actualizado",
            description: `Los datos de ${formData.nombre} ${formData.apellido} han sido actualizados correctamente.`,
          });

          onUpdate(updatedResident.resident || updatedResident);
        }
      }
      
      onClose();
      
    } catch (error) {
      console.error('Error updating resident:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la información del residente. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Editar Información de {resident?.nombre} {resident?.apellido}
          </DialogTitle>
        </DialogHeader>

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
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <File className="h-4 w-4" />
              Documentos
            </TabsTrigger>
          </TabsList>

          {/* Información Personal */}
          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      placeholder="Nombre del residente"
                    />
                  </div>
                  <div>
                    <Label htmlFor="apellido">Apellido *</Label>
                    <Input
                      id="apellido"
                      value={formData.apellido}
                      onChange={(e) => handleInputChange('apellido', e.target.value)}
                      placeholder="Apellido del residente"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edad">Edad</Label>
                    <Input
                      id="edad"
                      type="number"
                      value={formData.edad}
                      onChange={(e) => handleInputChange('edad', e.target.value)}
                      placeholder="Edad"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                    <Input
                      id="fechaNacimiento"
                      type="date"
                      value={formData.fechaNacimiento}
                      onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => handleInputChange('telefono', e.target.value)}
                      placeholder="Número de teléfono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="noPersonas">Número de Personas</Label>
                    <Input
                      id="noPersonas"
                      type="number"
                      value={formData.noPersonas}
                      onChange={(e) => handleInputChange('noPersonas', e.target.value)}
                      placeholder="Personas en el apartamento"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="discapacidad"
                      checked={formData.discapacidad}
                      onChange={(e) => handleInputChange('discapacidad', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="discapacidad">¿Hay personas con discapacidad?</Label>
                  </div>
                  {formData.discapacidad && (
                    <div>
                      <Label htmlFor="noPersonasDiscapacitadas">Número de Personas con Discapacidad</Label>
                      <Input
                        id="noPersonasDiscapacitadas"
                        type="number"
                        min="1"
                        max={formData.noPersonas || undefined}
                        value={formData.noPersonasDiscapacitadas}
                        onChange={(e) => handleInputChange('noPersonasDiscapacitadas', e.target.value)}
                        placeholder="Cantidad de personas con discapacidad"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Debe ser menor o igual al número total de personas
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ubicación del Residente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="building">Edificio</Label>
                    <Select 
                      value={selectedBuilding} 
                      onValueChange={handleBuildingChange}
                      disabled={loadingBuildings}
                    >
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
                  <div>
                    <Label htmlFor="floor">Piso</Label>
                    <Select 
                      value={selectedFloor} 
                      onValueChange={handleFloorChange}
                      disabled={!selectedBuilding}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar piso" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedBuilding && buildings
                          .find(b => b.id === selectedBuilding)?.floors
                          .map((floor: any) => (
                            <SelectItem key={floor.id} value={floor.id}>
                              {floor.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="apartment">Apartamento</Label>
                    <Select 
                      value={selectedApartment} 
                      onValueChange={handleApartmentChange}
                      disabled={!selectedFloor}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar apartamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedFloor && buildings
                          .find(b => b.id === selectedBuilding)?.floors
                          .find((f: any) => f.id === selectedFloor)?.apartments
                          .map((apt: string) => (
                            <SelectItem key={apt} value={apt}>
                              {apt}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Información Financiera */}
          <TabsContent value="financiera" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Información Financiera
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deudaActual">Deuda Actual</Label>
                    <Input
                      id="deudaActual"
                      type="number"
                      step="0.01"
                      value={formData.deudaActual}
                      onChange={(e) => handleInputChange('deudaActual', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pagosRealizados">Pagos Realizados</Label>
                    <Input
                      id="pagosRealizados"
                      type="number"
                      step="0.01"
                      value={formData.pagosRealizados}
                      onChange={(e) => handleInputChange('pagosRealizados', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Información del Apartamento</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Edificio:</span> {resident?.building?.name || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Apartamento:</span> {resident?.apartment?.number || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Piso:</span> {resident?.apartment?.floor?.name || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Estatus:</span> 
                      <Badge variant={resident?.estatus === 'ACTIVO' ? 'default' : 'destructive'} className="ml-2">
                        {resident?.estatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Información INVI */}
          <TabsContent value="invi" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Información INVI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ID INVI */}
                  <div>
                    <Label htmlFor="idInvi">ID INVI</Label>
                    <Input
                      id="idInvi"
                      value={formData.idInvi}
                      onChange={(e) => handleInputChange('idInvi', e.target.value)}
                      placeholder="Ej: INVI-2024-001234"
                      className="mt-2"
                    />
                  </div>

                  {/* Mensualidades */}
                  <div>
                    <Label htmlFor="mensualidades">Mensualidades</Label>
                    <Input
                      id="mensualidades"
                      value={formData.mensualidades}
                      onChange={(e) => handleInputChange('mensualidades', e.target.value)}
                      placeholder="Ej: 360 meses"
                      className="mt-2"
                    />
                  </div>

                  {/* Deuda INVI */}
                  <div>
                    <Label htmlFor="deudaInvi">Deuda INVI</Label>
                    <Input
                      id="deudaInvi"
                      type="number"
                      step="0.01"
                      value={formData.deudaInvi}
                      onChange={(e) => handleInputChange('deudaInvi', e.target.value)}
                      placeholder="0.00"
                      className="mt-2"
                    />
                  </div>

                  {/* Fecha de Contrato */}
                  <div>
                    <Label htmlFor="fechaContrato">Fecha de Contrato</Label>
                    <Input
                      id="fechaContrato"
                      type="date"
                      value={formData.fechaContrato}
                      onChange={(e) => handleInputChange('fechaContrato', e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  {/* ID Compañero */}
                  <div className="md:col-span-2">
                    <Label htmlFor="idCompanero">ID Compañero (Opcional)</Label>
                    <Input
                      id="idCompanero"
                      value={formData.idCompanero}
                      onChange={(e) => handleInputChange('idCompanero', e.target.value)}
                      placeholder="ID del compañero en el crédito INVI"
                      className="mt-2"
                    />
                  </div>
                </div>

                <Separator />

                {/* Informe INVI */}
                <div>
                  <Label htmlFor="informe">Informe INVI</Label>
                  <Textarea
                    id="informe"
                    value={formData.informe}
                    onChange={(e) => handleInputChange('informe', e.target.value)}
                    placeholder="Información adicional del INVI..."
                    rows={4}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentos */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  Documentos del Residente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CURP */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">CURP</h4>
                    {currentDocuments.curp ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm text-green-700">Documento actual disponible</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`http://localhost:3001${currentDocuments.curp}`, '_blank')}
                          >
                            Ver
                          </Button>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveDocument('curp')}
                          className="w-full"
                        >
                          Eliminar documento actual
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mb-2">No hay documento disponible</p>
                    )}
                    <div className="mt-3">
                      <Label htmlFor="curp-file">Subir nuevo documento CURP</Label>
                      <Input
                        id="curp-file"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleDocumentChange('curp', e.target.files?.[0] || null)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Comprobante de Domicilio */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Comprobante de Domicilio</h4>
                    {currentDocuments.comprobanteDomicilio ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm text-green-700">Documento actual disponible</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`http://localhost:3001${currentDocuments.comprobanteDomicilio}`, '_blank')}
                          >
                            Ver
                          </Button>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveDocument('comprobanteDomicilio')}
                          className="w-full"
                        >
                          Eliminar documento actual
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mb-2">No hay documento disponible</p>
                    )}
                    <div className="mt-3">
                      <Label htmlFor="comprobante-file">Subir nuevo comprobante</Label>
                      <Input
                        id="comprobante-file"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleDocumentChange('comprobanteDomicilio', e.target.files?.[0] || null)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Acta de Nacimiento */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Acta de Nacimiento</h4>
                    {currentDocuments.actaNacimiento ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm text-green-700">Documento actual disponible</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`http://localhost:3001${currentDocuments.actaNacimiento}`, '_blank')}
                          >
                            Ver
                          </Button>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveDocument('actaNacimiento')}
                          className="w-full"
                        >
                          Eliminar documento actual
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mb-2">No hay documento disponible</p>
                    )}
                    <div className="mt-3">
                      <Label htmlFor="acta-file">Subir nueva acta</Label>
                      <Input
                        id="acta-file"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleDocumentChange('actaNacimiento', e.target.files?.[0] || null)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* INE */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">INE</h4>
                    {currentDocuments.ine ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm text-green-700">Documento actual disponible</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`http://localhost:3001${currentDocuments.ine}`, '_blank')}
                          >
                            Ver
                          </Button>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveDocument('ine')}
                          className="w-full"
                        >
                          Eliminar documento actual
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mb-2">No hay documento disponible</p>
                    )}
                    <div className="mt-3">
                      <Label htmlFor="ine-file">Subir nueva INE</Label>
                      <Input
                        id="ine-file"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleDocumentChange('ine', e.target.files?.[0] || null)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Información de archivos seleccionados */}
                {Object.values(documentFiles).some(file => file !== null) && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-800 mb-2">Documentos seleccionados para actualizar:</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {documentFiles.curp && <li>• CURP: {documentFiles.curp.name}</li>}
                      {documentFiles.comprobanteDomicilio && <li>• Comprobante de Domicilio: {documentFiles.comprobanteDomicilio.name}</li>}
                      {documentFiles.actaNacimiento && <li>• Acta de Nacimiento: {documentFiles.actaNacimiento.name}</li>}
                      {documentFiles.ine && <li>• INE: {documentFiles.ine.name}</li>}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditResidentModal;
