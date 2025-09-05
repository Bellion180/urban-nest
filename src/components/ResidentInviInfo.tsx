import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building, Calendar, CreditCard, Users, DollarSign } from 'lucide-react';
import Header from './Header';
import { Resident } from '@/types/resident';

const ResidentInviInfo = () => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'No disponible';
    return new Date(date).toLocaleDateString('es-MX');
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

  const inviInfo = resident.inviInfo;

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
            Información INVI
          </h1>
          <p className="text-muted-foreground">
            {resident.nombre} {resident.apellido} - Apt. {resident.apartamento}
          </p>
        </div>

        {inviInfo ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* ID INVI */}
            <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <CreditCard className="h-5 w-5" />
                  ID INVI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {inviInfo.idInvi || 'No asignado'}
                </div>
                <p className="text-sm text-blue-600/70 dark:text-blue-400/70 mt-1">
                  Identificador único del INVI
                </p>
              </CardContent>
            </Card>

            {/* Mensualidades */}
            <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Calendar className="h-5 w-5" />
                  Mensualidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {inviInfo.mensualidades || 0}
                </div>
                <p className="text-sm text-green-600/70 dark:text-green-400/70 mt-1">
                  Número de mensualidades
                </p>
              </CardContent>
            </Card>

            {/* Deuda INVI */}
            <Card className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <DollarSign className="h-5 w-5" />
                  Deuda INVI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(inviInfo.deuda || 0)}
                </div>
                <p className="text-sm text-red-600/70 dark:text-red-400/70 mt-1">
                  Deuda pendiente con INVI
                </p>
              </CardContent>
            </Card>

            {/* Fecha de Contrato */}
            <Card className="bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800 md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <Calendar className="h-5 w-5" />
                  Fecha de Contrato
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {formatDate(inviInfo.fechaContrato)}
                </div>
                <p className="text-sm text-purple-600/70 dark:text-purple-400/70 mt-1">
                  Fecha de firma del contrato INVI
                </p>
              </CardContent>
            </Card>

            {/* ID Compañero */}
            <Card className="bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <Users className="h-5 w-5" />
                  ID Compañero
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {inviInfo.idCompanero || 'No asignado'}
                </div>
                <p className="text-sm text-orange-600/70 dark:text-orange-400/70 mt-1">
                  Identificador del compañero
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Building className="h-5 w-5" />
                Sin Información INVI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Este residente no tiene información INVI registrada en el sistema.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                La información INVI puede ser agregada al editar el residente desde el panel de administración.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Información del Residente */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Información del Residente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
                <p className="text-base">{resident.nombre} {resident.apellido}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Edificio</p>
                <p className="text-base">{resident.edificio}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Apartamento</p>
                <p className="text-base">{resident.apartamento}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <Badge variant={resident.estatus === 'ACTIVO' ? 'default' : 'destructive'}>
                  {resident.estatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {inviInfo && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Resumen INVI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Estado del crédito INVI:</strong>
                </p>
                <div className="space-y-1 text-sm">
                  <p>• ID: {inviInfo.idInvi || 'No asignado'}</p>
                  <p>• Mensualidades pagadas: {inviInfo.mensualidades || 0}</p>
                  <p>• Deuda pendiente: {formatCurrency(inviInfo.deuda || 0)}</p>
                  <p>• Contrato firmado: {formatDate(inviInfo.fechaContrato)}</p>
                  {inviInfo.idCompanero && (
                    <p>• Compañero: {inviInfo.idCompanero}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ResidentInviInfo;
