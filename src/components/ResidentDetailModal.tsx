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
  resident: Resident | null | any;
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
  
  // Debug: Logs para documentos
  console.log('🔍 ResidentDetailModal - Datos del residente recibidos:', resident);
  console.log('🔍 ResidentDetailModal - Tipo de objeto:', typeof resident);
  console.log('🔍 ResidentDetailModal - Claves del objeto:', resident ? Object.keys(resident) : 'No hay claves');
  console.log('🔍 ResidentDetailModal - Campos de documentos:');
  console.log('  - documentoCurp:', resident?.documentoCurp);
  console.log('  - documentoComprobanteDomicilio:', resident?.documentoComprobanteDomicilio);
  console.log('  - documentoActaNacimiento:', resident?.documentoActaNacimiento);
  console.log('  - documentoIne:', resident?.documentoIne);
  console.log('🔍 ResidentDetailModal - Información financiera:');
  console.log('  - deudaActual:', resident?.deudaActual);
  console.log('  - pagosRealizados:', resident?.pagosRealizados);
  console.log('  - inviInfo:', resident?.inviInfo);
  console.log('🔍 ResidentDetailModal - Información personal adicional:');
  console.log('  - no_personas:', resident?.no_personas);
  console.log('  - no_des_per:', resident?.no_des_per);
  console.log('  - recibo_apoyo:', resident?.recibo_apoyo);
  console.log('  - payments:', resident?.payments);
  
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
            <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : 'grid-cols-2'}`}>
              <TabsTrigger value="personal" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Información Personal</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Documentos</span>
              </TabsTrigger>
              {isAdmin && (
                <>
                  <TabsTrigger value="financial" className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Información Financiera</span>
                  </TabsTrigger>
                  <TabsTrigger value="invi" className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4" />
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
                        <div className="w-32 h-32 rounded-full border-4 border-gray-200 group-hover:border-blue-500 transition-colors overflow-hidden bg-gradient-to-br from-tlahuacali-red to-red-600 flex items-center justify-center">
                          {resident.profilePhoto ? (
                            <img 
                              src={`http://localhost:3001${resident.profilePhoto}`} 
                              alt={`${resident.nombre} ${resident.apellido}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.log(`Error cargando foto en modal: ${resident.profilePhoto}`);
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  const initials = parent.querySelector('.modal-initials');
                                  if (initials) {
                                    (initials as HTMLElement).style.display = 'flex';
                                  }
                                }
                              }}
                            />
                          ) : null}
                          <span 
                            className={`modal-initials absolute inset-0 flex items-center justify-center text-white font-bold text-2xl ${
                              resident.profilePhoto ? 'hidden' : 'flex'
                            }`}
                          >
                            {(resident.nombre?.charAt(0) || '?').toUpperCase()}{(resident.apellido?.charAt(0) || '?').toUpperCase()}
                          </span>
                        </div>
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
                      {/* Ubicación */}
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-tlahuacali-red" />
                        <span className="text-sm">
                          {resident.edificio && resident.apartamento ? 
                            `Torre ${resident.edificio} - Piso ${resident.piso} - Apt. ${resident.apartamento}` :
                            resident.building?.name ? 
                              `${resident.building.name} - ${resident.apartment?.floor?.name} - Apt. ${resident.apartment?.number}` :
                              'Sin ubicación asignada'
                          }
                        </span>
                      </div>
                      
                      {/* Contacto */}
                      {resident.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-tlahuacali-red" />
                          <span className="text-sm">{resident.email}</span>
                        </div>
                      )}
                      
                      {resident.telefono && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-tlahuacali-red" />
                          <span className="text-sm">{resident.telefono}</span>
                        </div>
                      )}
                      
                      {/* Información Personal */}
                      {(resident.fechaNacimiento || resident.fecha_nacimiento) && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-tlahuacali-red" />
                          <span className="text-sm">
                            Nacimiento: {new Date(resident.fechaNacimiento || resident.fecha_nacimiento).toLocaleDateString('es-MX')}
                          </span>
                        </div>
                      )}
                      
                      {resident.edad && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-tlahuacali-red" />
                          <span className="text-sm">Edad: {resident.edad} años</span>
                        </div>
                      )}
                      
                      {/* Información del Hogar */}
                      {(resident.noPersonas || resident.no_personas) && (
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-tlahuacali-red" />
                          <span className="text-sm">
                            Personas en el hogar: {resident.noPersonas || resident.no_personas}
                          </span>
                        </div>
                      )}
                      
                      {(resident.no_des_per || resident.noPersonasDiscapacitadas) && (
                        <div className="flex items-center space-x-2">
                          <Heart className="h-4 w-4 text-tlahuacali-red" />
                          <span className="text-sm">
                            Personas con discapacidad: {resident.no_des_per || resident.noPersonasDiscapacitadas || 0}
                          </span>
                        </div>
                      )}
                      
                      {/* Apoyo */}
                      {resident.recibo_apoyo && (
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-4 w-4 text-tlahuacali-red" />
                          <span className="text-sm">
                            Recibe apoyo: {resident.recibo_apoyo}
                            {resident.no_apoyo && ` (Número: ${resident.no_apoyo})`}
                          </span>
                        </div>
                      )}
                      
                      {/* Fecha de Registro */}
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-tlahuacali-red" />
                        <span className="text-sm">
                          Fecha de Registro: {new Date(resident.registrationDate || resident.createdAt).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                      
                      {/* ID del Residente para referencia */}
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-tlahuacali-red" />
                        <span className="text-sm">
                          ID de Registro: {resident.id || resident.id_companero}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Información de Vivienda y Estado */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Car className="h-5 w-5" />
                      <span>Estado y Vivienda</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Estado del Residente</span>
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
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Ubicación</span>
                      <span className="text-sm font-medium">
                        {resident.building?.name ? 
                          `${resident.building.name}` :
                          'Sin asignar'
                        }
                      </span>
                    </div>
                    
                    {resident.apartment && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Piso</span>
                          <span className="text-sm font-medium">{resident.apartment.floor?.name}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Apartamento</span>
                          <span className="text-sm font-medium">{resident.apartment.number}</span>
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Fecha de Registro</span>
                      <span className="text-sm font-medium">
                        {new Date(resident.registrationDate).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
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
            
            {/* Documentos */}
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Documentos del Residente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CURP */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">CURP</h4>
                        {resident.documentoCurp ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`http://localhost:3001${resident.documentoCurp}`, '_blank')}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Ver Documento
                          </Button>
                        ) : (
                          <span className="text-gray-500 text-sm">No disponible</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Comprobante de Domicilio */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Comprobante de Domicilio</h4>
                        {resident.documentoComprobanteDomicilio ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`http://localhost:3001${resident.documentoComprobanteDomicilio}`, '_blank')}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Ver Documento
                          </Button>
                        ) : (
                          <span className="text-gray-500 text-sm">No disponible</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Acta de Nacimiento */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Acta de Nacimiento</h4>
                        {resident.documentoActaNacimiento ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`http://localhost:3001${resident.documentoActaNacimiento}`, '_blank')}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Ver Documento
                          </Button>
                        ) : (
                          <span className="text-gray-500 text-sm">No disponible</span>
                        )}
                      </div>
                    </div>
                    
                    {/* INE */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">INE</h4>
                        {resident.documentoIne ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`http://localhost:3001${resident.documentoIne}`, '_blank')}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Ver Documento
                          </Button>
                        ) : (
                          <span className="text-gray-500 text-sm">No disponible</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Información Financiera - Solo para Administradores */}
            {isAdmin && (
              <TabsContent value="financial" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estado de Cuenta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Estado Financiero */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <span className="font-medium">Deuda Actual</span>
                          <span className={`text-lg font-bold ${(resident.deudaActual || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${(resident.deudaActual || 0).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="font-medium">Total Pagos Realizados</span>
                          <span className="text-lg font-bold text-green-600">
                            ${(resident.pagosRealizados || 0).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span className="font-medium">Deuda INVI</span>
                          <span className={`text-lg font-bold ${(resident.inviInfo?.deuda || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${(resident.inviInfo?.deuda || 0).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                          <span className="font-medium">Estado General</span>
                          <span className={`text-lg font-bold ${
                            (resident.deudaActual + (resident.inviInfo?.deuda || 0)) > 0 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            {(resident.deudaActual + (resident.inviInfo?.deuda || 0)) > 0 ? 'Con Adeudo' : 'Al Corriente'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Historial de Pagos */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Historial de Pagos</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {resident.payments && resident.payments.length > 0 ? (
                            resident.payments.slice(0, 5).map((payment, index) => (
                              <div key={payment.id || index} className="flex justify-between text-sm border-b pb-2">
                                <div>
                                  <span className="block">{new Date(payment.date).toLocaleDateString('es-MX')}</span>
                                  <span className="text-xs text-muted-foreground">{payment.description || payment.type}</span>
                                </div>
                                <span className="text-green-600 font-medium">
                                  ${(payment.amount || 0).toLocaleString()}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-muted-foreground text-center py-4">
                              No hay pagos registrados
                            </div>
                          )}
                          
                          {resident.payments && resident.payments.length > 5 && (
                            <div className="text-sm text-muted-foreground text-center pt-2">
                              Y {resident.payments.length - 5} pagos más...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            
            {/* Información INVI - Solo para Administradores */}
            {isAdmin && (
              <TabsContent value="invi" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información INVI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Información General */}
                      <div className="space-y-4">
                        <h3 className="text-md font-semibold text-gray-700 border-b pb-2">Datos Generales</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">ID INVI:</span>
                            <span className="text-gray-800">{resident.inviInfo?.idInvi || 'No asignado'}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">ID Compañero:</span>
                            <span className="text-gray-800">{resident.id || resident.id_companero || 'No disponible'}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Mensualidades:</span>
                            <span className="text-gray-800">{resident.inviInfo?.mensualidades || 'No especificado'}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Fecha de Contrato:</span>
                            <span className="text-gray-800">
                              {resident.inviInfo?.fechaContrato ? 
                                new Date(resident.inviInfo.fechaContrato).toLocaleDateString('es-MX') : 
                                'No registrada'
                              }
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Fecha de Registro Inicial:</span>
                            <span className="font-semibold">{resident.inviInfo?.idInvi || 'No asignado'}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Mensualidades:</span>
                            <span className="font-semibold">{resident.inviInfo?.mensualidades || 'No especificado'}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">ID Compañero:</span>
                            <span className="font-semibold">{resident.inviInfo?.idCompanero || 'No asignado'}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Información Financiera INVI */}
                      <div className="space-y-4">
                        <h3 className="text-md font-semibold text-gray-700 border-b pb-2">Estado Financiero</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Deuda INVI:</span>
                            <span className={`text-lg font-bold ${(resident.inviInfo?.deuda || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              ${(resident.inviInfo?.deuda || 0).toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Estado:</span>
                            <Badge variant="default" className={
                              (resident.inviInfo?.deuda || 0) > 0 
                                ? 'bg-red-500 text-white' 
                                : 'bg-green-500 text-white'
                            }>
                              {(resident.inviInfo?.deuda || 0) > 0 ? 'Con Adeudo' : 'Al Corriente'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Información de Fechas */}
                      <div className="space-y-4">
                        <h3 className="text-md font-semibold text-gray-700 border-b pb-2">Fechas Importantes</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Fecha de Contrato:</span>
                            <span className="font-semibold">
                              {resident.inviInfo?.fechaContrato 
                                ? new Date(resident.inviInfo.fechaContrato).toLocaleDateString('es-MX')
                                : 'No especificada'
                              }
                            </span>
                          </div>
                        </div>
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
