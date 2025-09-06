export interface InviInfo {
  id: string;
  idInvi?: string | null;
  mensualidades?: number | null;
  fechaContrato?: Date | null;
  deuda: number;
  idCompanero?: string | null;
  residentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resident {
  id: string;
  nombre: string;
  apellido: string;
  edad?: number | null;
  email?: string | null;
  telefono?: string | null;
  fechaNacimiento?: Date | null;
  noPersonas?: number | null;
  discapacidad: boolean;
  noPersonasDiscapacitadas?: number | null;
  profilePhoto?: string | null;
  estatus: string;
  hasKey?: boolean;
  registrationDate?: Date | null;
  deudaActual: number;
  pagosRealizados: number;
  informe?: string | null;
  edificio?: string;
  apartamento?: string;
  piso?: string;
  pisoNumero?: number;
  buildingId: string;
  apartmentId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  recentPayments?: any[];
  inviInfo?: InviInfo | null;
}

export interface ResidentFormData {
  nombre: string;
  apellido: string;
  edad?: number;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  noPersonas?: number;
  discapacidad: boolean;
  noPersonasDiscapacitadas?: number;
  deudaActual?: number;
  pagosRealizados?: number;
  buildingId: string;
  apartmentNumber: string;
  floorNumber: string;
  inviInfo?: {
    idInvi?: string;
    mensualidades?: number;
    fechaContrato?: string;
    deuda?: number;
    idCompanero?: string;
  };
}
