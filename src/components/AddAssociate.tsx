import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, User } from 'lucide-react';
import Header from './Header';
import { toast } from '@/hooks/use-toast';

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
    apartamento: '',
    noPersonas: '',
    discapacidad: '',
    deuda: '',
    pagos: '',
    informe: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isStepValid = () => {
    if (step === 1) {
      return form.nombre && form.apellido && form.edad && form.fechaNacimiento && form.noPersonas;
    }
    if (step === 2) {
      return form.departamento && form.edificio && form.piso && form.apartamento;
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
      form.departamento && form.edificio && form.piso && form.apartamento &&
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
      navigate('/dashboard');
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="flex flex-col items-center md:row-span-3">
                      <div className="rounded-full bg-gray-200 w-16 h-16 flex items-center justify-center mb-2">
                        <User size={40} className="text-gray-400" />
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
                      <Label>Departamento *</Label>
                      <Input name="departamento" value={form.departamento} onChange={handleChange} required />
                    </div>
                    <div>
                      <Label>Edificio *</Label>
                      <Input name="edificio" value={form.edificio} onChange={handleChange} required />
                    </div>
                    <div>
                      <Label>Piso *</Label>
                      <Input name="piso" value={form.piso} onChange={handleChange} required />
                    </div>
                    <div>
                      <Label>Apartamento *</Label>
                      <Input name="apartamento" value={form.apartamento} onChange={handleChange} required />
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