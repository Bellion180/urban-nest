export interface Resident {
  id: string;
  nombre: string;
  apellido: string;
  edad?: number;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  profilePhoto?: string;
  documentoCurp?: string;
  documentoComprobanteDomicilio?: string;
  documentoActaNacimiento?: string;
  documentoIne?: string;
  estatus: 'ACTIVO' | 'SUSPENDIDO' | 'INACTIVO';
  hasKey: boolean;
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
  buildingId: string;
  apartmentId: string;
  deudaActual: number;
  pagosRealizados: number;
  informe?: string;
  createdById: string;
  noPersonas?: number; // Número de personas en el apartamento
  discapacidad?: boolean; // Si es una persona con discapacidad
  noPersonasDiscapacitadas?: number; // Número de personas con discapacidad en el apartamento
  
  // Información INVI
  inviInfo?: {
    idInvi: string;
    mensualidades: string;
    deuda: number;
    fechaContrato: string;
    idCompanero?: string;
  };
  
  // Relaciones incluidas
  building?: {
    id: string;
    name: string;
  };
  apartment?: {
    id: string;
    number: string;
    floor: {
      id: string;
      name: string;
      number: number;
    };
  };
  payments?: Array<{
    id: string;
    amount: number;
    type: string;
    description?: string;
    date: string;
  }>;
  financieros?: Financieros; // Nuevo campo agregado
}

export interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  color: string;
  placas: string;
  tipo: 'auto' | 'moto' | 'otro';
}

export interface Familiar {
  id: string;
  nombre: string;
  apellido: string;
  parentesco: string;
  telefono?: string;
  foto?: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  residentId?: string;
}

export interface Building {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  apartamentos: number;
  residentes: number;
}