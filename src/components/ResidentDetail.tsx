import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { residents } from '@/data/mockData';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Heart, 
  Briefcase, 
  Car,
  Users,
  User,
  FileText
} from 'lucide-react';
import Header from './Header';

const ResidentDetail = () => {
  const { residentId } = useParams();
  const navigate = useNavigate();
  
  const resident = residents.find(r => r.id === residentId);

  if (!resident) {
    return <div>Residente no encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="bg-tlahuacali-cream">
            <CardHeader className="text-center">
              <img 
                src={resident.foto} 
                alt={`${resident.nombre} ${resident.apellido}`}
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
              />
              <CardTitle className="text-xl">
                {resident.nombre} {resident.apellido}
              </CardTitle>
              <Badge 
                variant={resident.estatus === 'activo' ? 'default' : 'destructive'}
                className={resident.estatus === 'activo' 
                  ? 'bg-success text-white' 
                  : 'bg-destructive text-white'
                }
              >
                {resident.estatus.toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>Edificio {resident.edificio}, Apt. {resident.apartamento}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>{resident.telefono}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="truncate">{resident.email}</span>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="bg-tlahuacali-cream">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Información Personal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(resident.fechaNacimiento).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estado Civil</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span>{resident.estadoCivil}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Profesión</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{resident.profesion}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fecha de Ingreso</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(resident.fechaIngreso).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <div className="space-y-6">
            {/* Vehicles */}
            <Card className="bg-tlahuacali-cream">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Car className="h-5 w-5" />
                  <span>Vehículos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resident.vehiculos.length > 0 ? (
                  <div className="space-y-3">
                    {resident.vehiculos.map((vehicle) => (
                      <div key={vehicle.id} className="p-3 bg-white rounded-lg">
                        <p className="font-medium">{vehicle.marca} {vehicle.modelo}</p>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.color} - {vehicle.placas}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay vehículos registrados</p>
                )}
              </CardContent>
            </Card>

            {/* Family Members */}
            <Card className="bg-tlahuacali-cream">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Familiares</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resident.familiares.length > 0 ? (
                  <div className="space-y-3">
                    {resident.familiares.map((familiar) => (
                      <div key={familiar.id} className="p-3 bg-white rounded-lg">
                        <p className="font-medium">{familiar.nombre} {familiar.apellido}</p>
                        <p className="text-sm text-muted-foreground">{familiar.parentesco}</p>
                        {familiar.telefono && (
                          <p className="text-sm text-muted-foreground">{familiar.telefono}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay familiares registrados</p>
                )}
              </CardContent>
            </Card>

            {/* Observations */}
            {resident.observaciones && (
              <Card className="bg-tlahuacali-cream">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Observaciones</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{resident.observaciones}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResidentDetail;