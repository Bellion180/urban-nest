export interface Resident {
  id: string;
  nombre: string;
  apellido: string;
  edad?: number;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  profilePhoto?: string;
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