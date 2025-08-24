import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { residents as initialResidents } from '@/data/mockData';
import { 
  ArrowLeft, 
  Search, 
  Users, 
  UserCheck, 
  UserX,
  Eye,
  Settings
} from 'lucide-react';
import Header from './Header';
import { toast } from '@/hooks/use-toast';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [residents, setResidents] = useState(initialResidents);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResidents = residents.filter(resident =>
    resident.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.apartamento.includes(searchTerm) ||
    resident.edificio.includes(searchTerm)
  );

  const activeResidents = residents.filter(r => r.estatus === 'activo').length;
  const suspendedResidents = residents.filter(r => r.estatus === 'suspendido').length;

  const toggleResidentStatus = (residentId: string) => {
    setResidents(prev => prev.map(resident => {
      if (resident.id === residentId) {
        const newStatus = resident.estatus === 'activo' ? 'suspendido' : 'activo';
        toast({
          title: "Estatus actualizado",
          description: `${resident.nombre} ${resident.apellido} ahora está ${newStatus}`,
        });
        return { ...resident, estatus: newStatus };
      }
      return resident;
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Button>

            <Button 
              variant="default"
              onClick={() => navigate('/add-associate')}
              className="bg-tlahuacali-red hover:bg-tlahuacali-red/90 text-white"
            >
              <Users className="mr-2 h-4 w-4" />
              Agregar Residente
            </Button>
          </div>
          
          <h2 className="text-3xl font-bold text-foreground mb-2">Panel de Administración</h2>
          <p className="text-muted-foreground">Gestiona el estatus de los residentes</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-tlahuacali-cream">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Residentes</p>
                  <p className="text-3xl font-bold text-foreground">{residents.length}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-tlahuacali-cream">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Activos</p>
                  <p className="text-3xl font-bold text-success">{activeResidents}</p>
                </div>
                <UserCheck className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-tlahuacali-cream">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Suspendidos</p>
                  <p className="text-3xl font-bold text-destructive">{suspendedResidents}</p>
                </div>
                <UserX className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-tlahuacali-cream mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Buscar Residentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="Buscar por nombre, apellido, apartamento o edificio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white"
            />
          </CardContent>
        </Card>

        {/* Residents List */}
        <Card className="bg-tlahuacali-cream">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Gestión de Residentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredResidents.map((resident) => (
                <div 
                  key={resident.id} 
                  className="flex items-center justify-between p-4 bg-white rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <img 
                      src={resident.foto} 
                      alt={`${resident.nombre} ${resident.apellido}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    
                    <div>
                      <h3 className="font-medium text-foreground">
                        {resident.nombre} {resident.apellido}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Edificio {resident.edificio}, Apt. {resident.apartamento}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {resident.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={resident.estatus === 'activo' ? 'default' : 'destructive'}
                      className={resident.estatus === 'activo' 
                        ? 'bg-success text-white' 
                        : 'bg-destructive text-white'
                      }
                    >
                      {resident.estatus}
                    </Badge>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/resident/${resident.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    
                    <Button
                      variant={resident.estatus === 'activo' ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => toggleResidentStatus(resident.id)}
                      className={resident.estatus === 'activo' 
                        ? '' 
                        : 'bg-success hover:bg-success/90 text-white'
                      }
                    >
                      {resident.estatus === 'activo' ? (
                        <>
                          <UserX className="h-4 w-4 mr-1" />
                          Suspender
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          Activar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredResidents.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No se encontraron residentes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminPanel;