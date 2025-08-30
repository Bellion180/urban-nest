import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, User, Camera, X } from 'lucide-react';
import Header from './Header';
import { toast } from '@/hooks/use-toast';
import { buildingsData } from '@/data/buildingsData';

const AddAssociate = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    edad: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    departamento: '',
    edificio: '',
    piso: '',
    noPersonas: '',
    discapacidad: '',
    deuda: '',
    pagos: '',
    informe: '',
    profilePhoto: null as File | null,
    profilePhotoPreview: null as string | null
  });

  // Estados para los selectores en cascada
  const [selectedBuilding, setSelectedBuilding] = useState<typeof buildingsData[0] | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<typeof buildingsData[0]['floors'][0] | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({ 
          title: "Error", 
          description: "Por favor selecciona un archivo de imagen válido",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({ 
          title: "Error", 
          description: "La imagen debe ser menor a 5MB",
          variant: "destructive"
        });
        return;
      }

      setForm(prev => ({
        ...prev,
        profilePhoto: file,
        profilePhotoPreview: URL.createObjectURL(file)
      }));
    }
  };

  const removePhoto = () => {
    if (form.profilePhotoPreview) {
      URL.revokeObjectURL(form.profilePhotoPreview);
    }
    setForm(prev => ({
      ...prev,
      profilePhoto: null,
      profilePhotoPreview: null
    }));
  };

  // Funciones para manejar los selectores en cascada
  const handleBuildingChange = (buildingId: string) => {
    const building = buildingsData.find(b => b.id === buildingId);
    setSelectedBuilding(building || null);
    setSelectedFloor(null);
    setForm(prev => ({
      ...prev,
      edificio: building?.name || '',
      piso: '',
      departamento: ''
    }));
  };

  const handleFloorChange = (floorId: string) => {
    const floor = selectedBuilding?.floors.find(f => f.id === floorId);
    setSelectedFloor(floor || null);
    setForm(prev => ({
      ...prev,
      piso: floor?.name || '',
      departamento: ''
    }));
  };

  const handleDepartmentChange = (apartment: string) => {
    setForm(prev => ({
      ...prev,
      departamento: apartment
    }));
  };

  const isStepValid = () => {
    if (step === 1) {
      return form.nombre && form.apellido && form.edad && form.fechaNacimiento && form.noPersonas;
    }
    if (step === 2) {
      return form.departamento && form.edificio && form.piso;
    }
    if (step === 3) {
      return form.deuda && form.pagos;
    }
    if (step === 4) {
      return form.informe;
    }
    return false;
  };

  // Validar si todo el formulario está completo
  const isFormComplete = () => {
    return (
      form.nombre && form.apellido && form.edad && form.fechaNacimiento && form.noPersonas &&
      form.departamento && form.edificio && form.piso &&
      form.deuda && form.pagos &&
      form.informe
    );
  };

  const handleNext = () => {
    if (isStepValid()) setStep(step + 1);
    else toast({ title: "Completa los campos requeridos" });
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStepValid()) {
      toast({ title: "Socio registrado correctamente" });
      
      // Clean up URL object if exists
      if (form.profilePhotoPreview) {
        URL.revokeObjectURL(form.profilePhotoPreview);
      }
      
      navigate('/admin');
    } else {
      toast({ title: "Completa los campos requeridos" });
    }
  };

  // Títulos dinámicos por paso
  const stepTitles = [
    '',
    'Información del socio',
    'Departamentos',
    'Financieros',
    'Informe',
  ];

  // Estilos para flechas: solo color azul cuando están activas
  const arrowBase = 'transition-all duration-300 ease-in-out';
  const arrowActive = 'text-primary';
  const arrowInactive = 'opacity-40';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6 flex flex-col items-center">
        <div className="mb-6 w-full">
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
        </div>
        <div className="flex items-center justify-center w-full">
          {/* Flecha izquierda */}
          <Button
            variant="ghost"
            className={`rounded-full mr-2 ${arrowBase} ${step > 1 ? arrowActive : arrowInactive}`}
            onClick={handleBack}
            disabled={step === 1}
            style={{ minWidth: 70, minHeight: 70 }}
            aria-label="Anterior"
          >
            <ArrowLeft size={48} />
          </Button>
          {/* Card central */}
          <Card className="bg-tlahuacali-cream w-full max-w-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold">
                {stepTitles[step]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div className="flex flex-col items-center md:row-span-4 space-y-3">
                      {/* Photo Upload Section */}
                      <div className="relative">
                        {form.profilePhotoPreview ? (
                          <div className="relative">
                            <img
                              src={form.profilePhotoPreview}
                              alt="Vista previa"
                              className="w-32 h-32 rounded-full object-cover border-4 border-tlahuacali-red/20"
                            />
                            <button
                              type="button"
                              onClick={removePhoto}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                            <Camera className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-center gap-2">
                        <label
                          htmlFor="photo-upload"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-tlahuacali-red text-white rounded-md hover:bg-tlahuacali-red/90 cursor-pointer transition-colors text-sm"
                        >
                          <Camera className="h-4 w-4" />
                          {form.profilePhotoPreview ? 'Cambiar Foto' : 'Subir Foto'}
                        </label>
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                        <p className="text-xs text-gray-500 text-center">
                          JPG, PNG, GIF (máx. 5MB)
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label>Nombres *</Label>
                      <Input name="nombre" value={form.nombre} onChange={handleChange} required />
                    </div>
                    <div>
                      <Label>Apellidos *</Label>
                      <Input name="apellido" value={form.apellido} onChange={handleChange} required />
                    </div>
                    <div>
                      <Label>Edad *</Label>
                      <Input name="edad" type="number" value={form.edad} onChange={handleChange} required />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input name="email" type="email" value={form.email} onChange={handleChange} />
                    </div>
                    <div>
                      <Label>Teléfono</Label>
                      <Input name="telefono" type="tel" value={form.telefono} onChange={handleChange} />
                    </div>
                    <div>
                      <Label>Fecha nacimiento *</Label>
                      <Input name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={handleChange} required />
                    </div>
                    <div>
                      <Label>N.o Personas *</Label>
                      <Input name="noPersonas" type="number" value={form.noPersonas} onChange={handleChange} required />
                    </div>
                    <div>
                      <Label>¿Cuentas con personas con discapacidad?</Label>
                      <div className="flex gap-4 mt-1">
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name="discapacidad"
                            value="si"
                            checked={form.discapacidad === 'si'}
                            onChange={handleChange}
                          />
                          Sí
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name="discapacidad"
                            value="no"
                            checked={form.discapacidad === 'no'}
                            onChange={handleChange}
                          />
                          No
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Edificio *</Label>
                      <Select value={selectedBuilding?.id || ''} onValueChange={handleBuildingChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar edificio" />
                        </SelectTrigger>
                        <SelectContent>
                          {buildingsData.map((building) => (
                            <SelectItem key={building.id} value={building.id}>
                              {building.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Piso *</Label>
                      <Select 
                        value={selectedFloor?.id || ''} 
                        onValueChange={handleFloorChange}
                        disabled={!selectedBuilding}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar piso" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedBuilding?.floors.map((floor) => (
                            <SelectItem key={floor.id} value={floor.id}>
                              {floor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label>Departamento *</Label>
                      <Select 
                        value={form.departamento} 
                        onValueChange={handleDepartmentChange}
                        disabled={!selectedFloor}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedFloor?.apartments.map((apartment) => (
                            <SelectItem key={apartment} value={apartment}>
                              Departamento {apartment}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Deuda actual *</Label>
                      <Input name="deuda" type="number" value={form.deuda} onChange={handleChange} required />
                    </div>
                    <div>
                      <Label>Pagos realizados *</Label>
                      <Input name="pagos" type="number" value={form.pagos} onChange={handleChange} required />
                    </div>
                  </div>
                )}
                {step === 4 && (
                  <div>
                    <Label>Informe *</Label>
                    <textarea
                      name="informe"
                      value={form.informe}
                      onChange={handleChange}
                      required
                      className="w-full border rounded p-2"
                      rows={4}
                    />
                  </div>
                )}
                <div className="flex justify-center mt-4">
                  {step === 4 && (
                    <Button type="submit" disabled={!isFormComplete()}>
                      Agregar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
          {/* Flecha derecha */}
          <Button
            variant="ghost"
            className={`rounded-full ml-2 ${arrowBase} ${step < 4 && isStepValid() ? arrowActive : arrowInactive}`}
            onClick={handleNext}
            disabled={step === 4 || !isStepValid()}
            style={{ minWidth: 70, minHeight: 70 }}
            aria-label="Siguiente"
          >
            <ArrowRight size={48} />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AddAssociate;