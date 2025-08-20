export interface Resident {
  id: string;
  nombre: string;
  apellido: string;
  apartamento: string;
  edificio: string;
  telefono: string;
  email: string;
  fechaNacimiento: string;
  estadoCivil: string;
  profesion: string;
  vehiculos: Vehicle[];
  familiares: Familiar[];
  foto: string;
  estatus: 'activo' | 'suspendido';
  fechaIngreso: string;
  observaciones?: string;
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