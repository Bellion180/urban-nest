import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import Header from './Header';
import { Resident } from '@/types/resident';

const ResidentFinancialInfo = () => {
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

  const balance = resident.pagosRealizados - resident.deudaActual;
  const isPositiveBalance = balance >= 0;

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
            Información Financiera
          </h1>
          <p className="text-muted-foreground">
            {resident.nombre} {resident.apellido} - Apt. {resident.apartamento}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Deuda Actual */}
          <Card className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <TrendingDown className="h-5 w-5" />
                Deuda Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(resident.deudaActual)}
              </div>
              <p className="text-sm text-red-600/70 dark:text-red-400/70 mt-1">
                Monto pendiente de pago
              </p>
            </CardContent>
          </Card>

          {/* Pagos Realizados */}
          <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <TrendingUp className="h-5 w-5" />
                Pagos Realizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(resident.pagosRealizados)}
              </div>
              <p className="text-sm text-green-600/70 dark:text-green-400/70 mt-1">
                Total pagado hasta la fecha
              </p>
            </CardContent>
          </Card>

          {/* Balance */}
          <Card className={`${isPositiveBalance 
            ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' 
            : 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800'
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center gap-2 ${isPositiveBalance 
                ? 'text-blue-700 dark:text-blue-300' 
                : 'text-orange-700 dark:text-orange-300'
              }`}>
                <DollarSign className="h-5 w-5" />
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isPositiveBalance 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-orange-600 dark:text-orange-400'
              }`}>
                {formatCurrency(Math.abs(balance))}
              </div>
              <Badge 
                variant={isPositiveBalance ? "default" : "destructive"}
                className="mt-2"
              >
                {isPositiveBalance ? 'A favor' : 'Debe'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Historial de Pagos Recientes */}
        {resident.recentPayments && resident.recentPayments.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Historial de Pagos Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resident.recentPayments.map((payment: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium">{payment.description || 'Pago de mantenimiento'}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.date ? new Date(payment.date).toLocaleDateString('es-MX') : 'Fecha no disponible'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(payment.amount || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información Adicional */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
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
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <Badge variant={resident.estatus === 'ACTIVO' ? 'default' : 'destructive'}>
                  {resident.estatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ResidentFinancialInfo;
