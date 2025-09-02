import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { residents } from '@/data/mockData';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';

const ResidentFinancial = () => {
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
            <CardTitle>Información Financiera - {resident.nombre} {resident.apellido}</CardTitle>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Veladas */}
                    <div className="bg-secondary/20 p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        <span className="bg-primary/10 p-1.5 rounded">🌙</span>
                        Veladas
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Pendientes:</span>
                          <span className="font-medium">2</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Completadas:</span>
                          <span className="font-medium text-green-600">8</span>
                        </div>
                      </div>
                    </div>

                    {/* Aportaciones */}
                    <div className="bg-secondary/20 p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        <span className="bg-primary/10 p-1.5 rounded">💰</span>
                        Aportaciones
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span className="font-medium">$5,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Último pago:</span>
                          <span className="font-medium">15/08/2025</span>
                        </div>
                      </div>
                    </div>

                    {/* Faenas */}
                    <div className="bg-secondary/20 p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        <span className="bg-primary/10 p-1.5 rounded">🛠️</span>
                        Faenas
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Participación:</span>
                          <span className="font-medium">6/8</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Próxima faena:</span>
                          <span className="font-medium">28/08/2025</span>
                        </div>
                      </div>
                    </div>

                    {/* Salidas */}
                    <div className="bg-secondary/20 p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        <span className="bg-primary/10 p-1.5 rounded">🚶</span>
                        Salidas
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Registradas:</span>
                          <span className="font-medium">4</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Última salida:</span>
                          <span className="font-medium">10/08/2025</span>
                        </div>
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

export default ResidentFinancial;
