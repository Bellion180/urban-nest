import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { residents } from '@/data/mockData';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';

const ResidentInvi = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resident, setResident] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/residents`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      })
        .then(res => res.json())
        .then(data => {
          const found = data.find((r: any) => r.id === id);
          setResident(found);
        });
    }
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
            <CardTitle>Información INVI - {resident.nombre} {resident.apellido}</CardTitle>
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
                  {/* Mensualidades */}
                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <span className="bg-primary/10 p-1.5 rounded">💳</span>
                      Mensualidades INVI
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Monto Mensual:</span>
                          <span className="font-semibold">$2,500.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Pagos Realizados:</span>
                          <span className="font-medium text-green-600">24/48</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Próximo Pago:</span>
                          <span className="font-medium">01/09/2025</span>
                        </div>
                      </div>
                      <div className="bg-background/50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Estado de Pagos</h4>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full rounded-full" style={{ width: '50%' }}></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">50% completado</p>
                      </div>
                    </div>
                  </div>

                  {/* Información de Contrato */}
                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <span className="bg-primary/10 p-1.5 rounded">📄</span>
                      Información de Contrato
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground block mb-1">Fecha de Inicio:</span>
                        <p className="font-medium">15/08/2023</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground block mb-1">Fecha de Término:</span>
                        <p className="font-medium">15/08/2027</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground block mb-1">Número de Contrato:</span>
                        <p className="font-medium">INVI-2023-1234</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground block mb-1">Estado:</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Activo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deuda */}
                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <span className="bg-primary/10 p-1.5 rounded">💰</span>
                      Estado de Deuda
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-muted-foreground block mb-1">Deuda Total Inicial:</span>
                          <p className="font-semibold text-xl">$120,000.00</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground block mb-1">Deuda Actual:</span>
                          <p className="font-semibold text-xl text-blue-600">$60,000.00</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground block mb-2">Progreso de Pago:</span>
                        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: '50%' }}></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">50% de la deuda liquidada</p>
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

export default ResidentInvi;
