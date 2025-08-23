import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { buildings } from '@/data/mockData';
import { ArrowLeft } from 'lucide-react';
import Header from './Header';
import { toast } from '@/hooks/use-toast';

const AddResident = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para agregar el residente
    toast({
      title: "Éxito",
      description: "Residente agregado correctamente",
    });
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Panel
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Agregar Nuevo Residente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="nombre" className="text-sm font-medium">Nombre</label>
                <Input id="nombre" placeholder="Nombre del residente" required />
              </div>

              <div className="space-y-2">
                <label htmlFor="apellido" className="text-sm font-medium">Apellidos</label>
                <Input id="apellido" placeholder="Apellidos del residente" required />
              </div>

              <div className="space-y-2">
                <label htmlFor="edificio" className="text-sm font-medium">Edificio</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar edificio" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((building) => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="apartamento" className="text-sm font-medium">Apartamento</label>
                <Input id="apartamento" placeholder="Número de apartamento" required />
              </div>

              <div className="space-y-2">
                <label htmlFor="telefono" className="text-sm font-medium">Teléfono</label>
                <Input id="telefono" placeholder="Número de teléfono" required />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input id="email" type="email" placeholder="Correo electrónico" required />
              </div>

            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AddResident;
