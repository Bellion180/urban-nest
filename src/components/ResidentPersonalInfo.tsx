import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Mail, Phone, Calendar, Users, MapPin, Accessibility } from 'lucide-react';
import Header from './Header';
import { Resident } from '@/types/resident';

const ResidentPersonalInfo = () => {
  const { residentId } = useParams();
  const navigate = useNavigate();
  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResidentData();
  }, [residentId]);

  const fetchResidentData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/residents`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const residents = await response.json();
        const foundResident = residents.find((r: Resident) => r.id === residentId);
        if (foundResident) {
          setResident(foundResident);
        } else {
          setError('Residente no encontrado');
        }
      } else {
        setError('Error al cargar información del residente');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar información del residente');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'No disponible';
    return new Date(date).toLocaleDateString('es-MX');
  };

  const calculateAge = (birthDate: Date | string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Cargando información...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !resident) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Información Personal
          </h1>
          <p className="text-muted-foreground">
            Detalles personales del residente
          </p>
        </div>

        {/* Foto de Perfil y Datos Básicos */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {resident.profilePhoto ? (
                    <img 
                      src={`http://localhost:3001${resident.profilePhoto}`}
                      alt={`${resident.nombre} ${resident.apellido}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-muted-foreground" />
                  )}
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {resident.nombre} {resident.apellido}
                </h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  <Badge variant={resident.estatus === 'ACTIVO' ? 'default' : 'destructive'}>
                    {resident.estatus}
                  </Badge>
                  {resident.discapacidad && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Accessibility className="w-3 h-3 mr-1" />
                      Con discapacidad
                    </Badge>
                  )}
                </div>
                
                <div className="grid gap-2 md:grid-cols-2 text-sm">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{resident.edificio} - Apt. {resident.apartamento}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{resident.edad ? `${resident.edad} años` : 'Edad no disponible'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Información de Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{resident.email || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                <p className="text-base">{resident.telefono || 'No disponible'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Datos Personales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</p>
                <p className="text-base">{formatDate(resident.fechaNacimiento)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Edad</p>
                <p className="text-base">
                  {resident.edad || calculateAge(resident.fechaNacimiento) || 'No disponible'} años
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Discapacidad</p>
                <Badge variant={resident.discapacidad ? "destructive" : "secondary"}>
                  {resident.discapacidad ? 'Sí' : 'No'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Información de Vivienda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Vivienda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Edificio</p>
                <p className="text-base">{resident.edificio}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Apartamento</p>
                <p className="text-base">{resident.apartamento}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Piso</p>
                <p className="text-base">{resident.piso}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">No. de Personas</p>
                <p className="text-base">{resident.noPersonas || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Personas con Discapacidad</p>
                <p className="text-base">{resident.noPersonasDiscapacitadas || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información de Registro */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Información de Registro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha de Registro</p>
                <p className="text-base">{formatDate(resident.registrationDate || resident.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <Badge variant={resident.estatus === 'ACTIVO' ? 'default' : 'destructive'}>
                  {resident.estatus}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Posee Llave</p>
                <Badge variant={resident.hasKey ? "default" : "secondary"}>
                  {resident.hasKey ? 'Sí' : 'No'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notas Adicionales */}
        {resident.informe && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Informe/Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{resident.informe}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ResidentPersonalInfo;
