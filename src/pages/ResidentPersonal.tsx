import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { residentService } from '@/services/api';

const ResidentPersonal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resident, setResident] = useState<any>(null);

  useEffect(() => {
    const loadResident = async () => {
      if (!id) return;
      
      try {
        console.log('ResidentPersonal: Loading resident from API...', id);
        const data = await residentService.getById(id);
        console.log('ResidentPersonal: Loaded resident:', data);
        setResident(data);
      } catch (error) {
        console.error('ResidentPersonal: Error loading resident:', error);
      }
    };

    loadResident();
  }, [id]);

  if (!resident) {
    return <div>Residente no encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Información Personal - {resident.nombre} {resident.apellido}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start space-x-6">
                <img 
                  src={resident.foto} 
                  alt={`${resident.nombre} ${resident.apellido}`}
                  className="w-32 h-32 rounded-lg object-cover shadow-md"
                />
                <div className="flex-1 space-y-4">
                  {/* Información Personal Básica */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Nombre Completo</h3>
                      <p className="text-lg font-semibold">{resident.nombre} {resident.apellido}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</h3>
                      <p className="text-lg">15/03/1985</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Edad</h3>
                      <p className="text-lg">40 años</p>
                    </div>
                  </div>

                  {/* Información del Apartamento */}
                  <div className="bg-secondary/20 p-4 rounded-lg space-y-4">
                    <h3 className="font-semibold text-lg">Información del Apartamento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Número</span>
                        <p className="font-medium">{resident.apartamento}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Nivel</span>
                        <p className="font-medium">2</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Letra</span>
                        <p className="font-medium">B</p>
                      </div>
                    </div>
                  </div>

                  {/* Información sobre Discapacidad */}
                  <div className="bg-secondary/20 p-4 rounded-lg space-y-4">
                    <h3 className="font-semibold text-lg">Personas con Discapacidad</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Número de personas:</span>
                        <span className="font-medium">2</span>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Tipos de discapacidad:</h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>Motriz - Adulto Mayor</li>
                          <li>Visual - Parcial</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Información de Contacto */}
                  <div className="bg-secondary/20 p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold text-lg">Información de Contacto</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{resident.telefono}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>{resident.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ResidentPersonal;
