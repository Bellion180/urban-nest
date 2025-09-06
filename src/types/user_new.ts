// Tipos para la nueva estructura de base de datos

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'RESIDENT';
  createdAt: string;
  updatedAt: string;
}

export interface Torres {
  id_torre: string;
  letra: string;
  nivel?: string;
  createdAt: string;
  updatedAt: string;
  departamentos?: Departamentos[];
}

export interface Departamentos {
  id_departamento: string;
  no_departamento: string;
  id_torre: string;
  createdAt: string;
  updatedAt: string;
  torre?: Torres;
  companeros?: Companeros[];
}

export interface Companeros {
  id_companero: string;
  nombre: string;
  apellidos: string;
  fecha_nacimiento?: string;
  no_personas?: number;
  no_des_per?: number;
  recibo_apoyo?: string;
  no_apoyo?: number;
  id_departamento?: string;
  estatus: 'ACTIVO' | 'SUSPENDIDO' | 'INACTIVO';
  createdAt: string;
  updatedAt: string;
  createdById: string;
  
  // Relaciones
  departamento?: Departamentos;
  createdBy?: User;
  info_financiero?: Info_Financiero;
  financieros?: Financieros[];
}

export interface Info_Financiero {
  id_flux: string;
  excelente?: string;
  aport?: string;
  deuda?: string;
  estacionamiento?: string;
  aportacion?: string;
  aportacion_deuda?: string;
  apoyo_renta?: string;
  comentarios?: string;
  id_companeros: string;
  createdAt: string;
  updatedAt: string;
  companero?: Companeros;
}

export interface Financieros {
  id_financieros: string;
  validez?: string;
  aportaciones?: string;
  facturas?: string;
  salidas?: string;
  id_companeros: string;
  createdAt: string;
  updatedAt: string;
  companero?: Companeros;
}

// Tipos para compatibilidad con componentes existentes
export interface Resident extends Companeros {
  // Mapeo de campos para compatibilidad
  id: string; // -> id_companero
  apellido: string; // -> apellidos
  fechaNacimiento?: string; // -> fecha_nacimiento
  noPersonas?: number; // -> no_personas
  noPersonasDiscapacitadas?: number; // -> no_des_per
  buildingId?: string; // -> departamento.id_torre
  apartmentId?: string; // -> id_departamento
  
  // Información financiera mapeada
  deudaActual?: number;
  pagosRealizados?: number;
  
  // Campos que ya no existen en la nueva estructura pero se mantienen para compatibilidad
  edad?: number;
  email?: string;
  telefono?: string;
  profilePhoto?: string;
  documentoCurp?: string;
  documentoComprobanteDomicilio?: string;
  documentoActaNacimiento?: string;
  documentoIne?: string;
  hasKey?: boolean;
  registrationDate?: string;
  informe?: string;
  discapacidad?: boolean;
  
  // Información INVI mapeada desde info_financiero
  inviInfo?: {
    idInvi?: string;
    mensualidades?: string;
    deuda?: number;
    fechaContrato?: string;
    idCompanero?: string;
  };
  
  // Relaciones mapeadas
  building?: {
    id: string;
    name: string;
  };
  apartment?: {
    id: string;
    number: string;
    floor?: {
      id: string;
      name: string;
      number: number;
    };
  };
}

export interface Building extends Torres {
  // Mapeo para compatibilidad
  id: string; // -> id_torre
  name: string; // -> letra
  description?: string; // -> nivel
  image?: string;
  floors?: Floor[];
}

export interface Floor {
  id: string;
  name: string;
  number: number;
  buildingId: string;
  apartments?: string[];
}

export interface Payment {
  id: string;
  amount: number;
  type: 'PAGO_MENSUALIDAD' | 'PAGO_MANTENIMIENTO' | 'OTROS';
  description?: string;
  date: string;
  residentId: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos para formularios
export interface CreateCompaneroData {
  nombre: string;
  apellidos: string;
  fecha_nacimiento?: string;
  no_personas?: number;
  no_des_per?: number;
  recibo_apoyo?: string;
  no_apoyo?: number;
  id_departamento: string;
  createdById: string;
}

export interface CreateTorreData {
  letra: string;
  nivel?: string;
}

export interface CreateDepartamentoData {
  no_departamento: string;
  id_torre: string;
}
