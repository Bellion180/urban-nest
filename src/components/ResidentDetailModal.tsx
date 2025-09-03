import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Resident } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  DollarSign, 
  FileText, 
  Camera,
  Mail,
  Phone,
  Calendar,
  Heart,
  Briefcase,
  Car,
  Users,
  MapPin
} from 'lucide-react';

interface ResidentDetailModalProps {
  resident: Resident | null;
  isOpen: boolean;
  onClose: () => void;
  onPhotoClick: (photo: string) => void;
}

const ResidentDetailModal: React.FC<ResidentDetailModalProps> = ({ 
  resident, 
  isOpen, 
  onClose, 
  onPhotoClick 
}) => {
  const { isAdmin } = useAuth();
  
  if (!resident) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Detalles del Residente</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-3' : 'grid-cols-1'}`}>
              <TabsTrigger value="personal" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Información Personal</span>
              </TabsTrigger>
              {isAdmin && (
                <>
                  <TabsTrigger value="financial" className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Información Financiera</span>
                  </TabsTrigger>
                  <TabsTrigger value="invi" className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Información INVI</span>
                  </TabsTrigger>
                </>
              )}
            </TabsList>
            
            {/* Información Personal */}
            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Foto y datos básicos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Datos Básicos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col items-center space-y-3">
                      <div 
                        className="relative cursor-pointer group"
                        onClick={() => onPhotoClick(resident.profilePhoto || '/placeholder.svg')}
                      >
                        <img 
                          src={resident.profilePhoto ? `http://localhost:3001${resident.profilePhoto}` : '/placeholder.svg'} 
                          alt={`${resident.nombre} ${resident.apellido}`}
                          className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 group-hover:border-blue-500 transition-colors"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold text-lg">{resident.nombre} {resident.apellido}</h3>
                        <Badge 
                          variant={resident.estatus === 'ACTIVO' ? 'default' : 'destructive'}
                          className={resident.estatus === 'ACTIVO' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                          }
                        >
                          {resident.estatus}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {resident.building?.name} - {resident.apartment?.floor?.name} - Apt. {resident.apartment?.number}
                        </span>
                      </div>
                      
                      {resident.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{resident.email}</span>
                        </div>
                      )}
                      
                      {resident.telefono && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{resident.telefono}</span>
                        </div>
                      )}
                      
                      {resident.fechaNacimiento && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Nacimiento: {new Date(resident.fechaNacimiento).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {resident.edad && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Edad: {resident.edad} años</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Registro: {new Date(resident.registrationDate).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          resident.hasKey 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {resident.hasKey ? '🔑 Tiene llave' : '🚫 Sin llave'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Información Adicional */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Información Adicional</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Deuda Actual</span>
                      <span className={`font-medium ${resident.deudaActual > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${resident.deudaActual.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pagos Realizados</span>
                      <span className="font-medium text-green-600">
                        ${resident.pagosRealizados.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Estado de Llaves</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        resident.hasKey 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {resident.hasKey ? 'Entregada' : 'Pendiente'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Historial de Pagos */}
              {resident.payments && resident.payments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span>Últimos Pagos</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {resident.payments.map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{payment.type.replace('_', ' ')}</div>
                            {payment.description && (
                              <div className="text-sm text-muted-foreground">{payment.description}</div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {new Date(payment.date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            ${payment.amount.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Observaciones */}
              {resident.informe && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informe</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{resident.informe}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Información Financiera - Solo para Administradores */}
            {isAdmin && (
              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Estado de Cuenta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="font-medium">Saldo Actual</span>
                        <span className="text-lg font-bold text-green-600">$15,450.00</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium">Mantenimiento Mensual</span>
                        <span className="text-lg font-bold text-blue-600">$2,800.00</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="font-medium">Último Pago</span>
                        <span className="text-lg font-bold text-orange-600">15/Jan/2024</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Historial de Pagos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm border-b pb-2">
                          <span>Enero 2024</span>
                          <span className="text-green-600 font-medium">$2,800.00</span>
                        </div>
                        <div className="flex justify-between text-sm border-b pb-2">
                          <span>Diciembre 2023</span>
                          <span className="text-green-600 font-medium">$2,800.00</span>
                        </div>
                        <div className="flex justify-between text-sm border-b pb-2">
                          <span>Noviembre 2023</span>
                          <span className="text-green-600 font-medium">$2,800.00</span>
                        </div>
                        <div className="flex justify-between text-sm border-b pb-2">
                          <span>Octubre 2023</span>
                          <span className="text-red-600 font-medium">Pendiente</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cargos Adicionales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm border-b pb-2">
                        <span>Estacionamiento adicional</span>
                        <span className="font-medium">$500.00/mes</span>
                      </div>
                      <div className="flex justify-between text-sm border-b pb-2">
                        <span>Uso de amenidades</span>
                        <span className="font-medium">$200.00/mes</span>
                      </div>
                      <div className="flex justify-between text-sm border-b pb-2">
                        <span>Mascotas</span>
                        <span className="font-medium">$150.00/mes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            
            {/* Información INVI - Solo para Administradores */}
            {isAdmin && (
              <TabsContent value="invi" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información INVI</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium">Número de Expediente:</span>
                          <span>INVI-{resident.id}-2024</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="font-medium">Programa:</span>
                          <span>Vivienda Social Urbana</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="font-medium">Fecha de Asignación:</span>
                          <span>{new Date(resident.registrationDate).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="font-medium">Tipo de Beneficio:</span>
                          <span>Subsidio Habitacional</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="font-medium">Estado del Crédito:</span>
                          <Badge variant="default" className="bg-success text-white">
                            Al Corriente
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Documentos INVI</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">Contrato de Arrendamiento</span>
                          <Button variant="outline" size="sm">Ver</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">Acreditación INVI</span>
                          <Button variant="outline" size="sm">Ver</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">Comprobante de Ingresos</span>
                          <Button variant="outline" size="sm">Ver</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">Historial Crediticio</span>
                          <Button variant="outline" size="sm">Ver</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Detalles del Crédito</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">$580,000</div>
                        <div className="text-sm text-blue-800">Monto del Crédito</div>
                      </div>
                      
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">$245,000</div>
                        <div className="text-sm text-green-800">Pagado</div>
                      </div>
                      
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">$335,000</div>
                        <div className="text-sm text-orange-800">Saldo Pendiente</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResidentDetailModal;
