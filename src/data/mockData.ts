import { Resident, User, Building } from '@/types/user';

export const buildings: Building[] = [
  {
    id: '1',
    nombre: 'Edificio A',
    descripcion: 'Torre principal con vista al jardín',
    imagen: '/lovable-uploads/building-a.jpg',
    apartamentos: 20,
    residentes: 45
  },
  {
    id: '2',
    nombre: 'Edificio B',
    descripcion: 'Torre norte con amenidades completas',
    imagen: '/lovable-uploads/building-b.jpg',
    apartamentos: 18,
    residentes: 38
  },
  {
    id: '3',
    nombre: 'Edificio C',
    descripcion: 'Torre sur con espacios amplios',
    imagen: '/lovable-uploads/building-c.jpg',
    apartamentos: 22,
    residentes: 52
  },
  {
    id: '4',
    nombre: 'Edificio D',
    descripcion: 'Torre este con área de coworking',
    imagen: '/lovable-uploads/building-a.jpg',
    apartamentos: 25,
    residentes: 58
  },
  {
    id: '5',
    nombre: 'Edificio E',
    descripcion: 'Torre oeste con gimnasio exclusivo',
    imagen: '/lovable-uploads/building-b.jpg',
    apartamentos: 16,
    residentes: 32
  },
  {
    id: '6',
    nombre: 'Edificio F',
    descripcion: 'Torre central con terraza panorámica',
    imagen: '/lovable-uploads/building-c.jpg',
    apartamentos: 24,
    residentes: 49
  },
  {
    id: '7',
    nombre: 'Edificio G',
    descripcion: 'Torre premium con piscina privada',
    imagen: '/lovable-uploads/building-a.jpg',
    apartamentos: 15,
    residentes: 30
  }
];

export const residents: Resident[] = [
  {
    id: '1',
    nombre: 'María Elena',
    apellido: 'González Pérez',
    apartamento: '101',
    edificio: '1',
    telefono: '555-0123',
    email: 'maria.gonzalez@email.com',
    fechaNacimiento: '1985-03-15',
    estadoCivil: 'Casada',
    profesion: 'Ingeniera',
    vehiculos: [
      {
        id: '1',
        marca: 'Toyota',
        modelo: 'Corolla',
        color: 'Blanco',
        placas: 'ABC-123',
        tipo: 'auto'
      }
    ],
    familiares: [
      {
        id: '1',
        nombre: 'Carlos',
        apellido: 'González',
        parentesco: 'Esposo',
        telefono: '555-0124'
      },
      {
        id: '2',
        nombre: 'Ana',
        apellido: 'González',
        parentesco: 'Hija',
        telefono: ''
      }
    ],
    foto: '/lovable-uploads/resident-1.jpg',
    estatus: 'activo',
    fechaIngreso: '2020-01-15',
    observaciones: 'Residente modelo, siempre cumple con los pagos'
  },
  {
    id: '2',
    nombre: 'Roberto',
    apellido: 'Martínez López',
    apartamento: '205',
    edificio: '1',
    telefono: '555-0234',
    email: 'roberto.martinez@email.com',
    fechaNacimiento: '1978-07-22',
    estadoCivil: 'Soltero',
    profesion: 'Contador',
    vehiculos: [
      {
        id: '2',
        marca: 'Honda',
        modelo: 'Civic',
        color: 'Azul',
        placas: 'DEF-456',
        tipo: 'auto'
      }
    ],
    familiares: [],
    foto: '/lovable-uploads/resident-2.jpg',
    estatus: 'activo',
    fechaIngreso: '2019-05-10'
  },
  {
    id: '3',
    nombre: 'Ana Sofía',
    apellido: 'Rodríguez Silva',
    apartamento: '302',
    edificio: '2',
    telefono: '555-0345',
    email: 'ana.rodriguez@email.com',
    fechaNacimiento: '1990-11-08',
    estadoCivil: 'Casada',
    profesion: 'Doctora',
    vehiculos: [
      {
        id: '3',
        marca: 'Nissan',
        modelo: 'Sentra',
        color: 'Rojo',
        placas: 'GHI-789',
        tipo: 'auto'
      }
    ],
    familiares: [
      {
        id: '3',
        nombre: 'Miguel',
        apellido: 'Rodríguez',
        parentesco: 'Esposo',
        telefono: '555-0346'
      }
    ],
    foto: '/lovable-uploads/resident-3.jpg',
    estatus: 'suspendido',
    fechaIngreso: '2021-03-20',
    observaciones: 'Suspendido por incumplimiento de pagos'
  },
  {
    id: '4',
    nombre: 'Luis Fernando',
    apellido: 'Hernández Castro',
    apartamento: '108',
    edificio: '3',
    telefono: '555-0456',
    email: 'luis.hernandez@email.com',
    fechaNacimiento: '1982-09-14',
    estadoCivil: 'Divorciado',
    profesion: 'Arquitecto',
    vehiculos: [
      {
        id: '4',
        marca: 'Ford',
        modelo: 'Focus',
        color: 'Negro',
        placas: 'JKL-012',
        tipo: 'auto'
      }
    ],
    familiares: [
      {
        id: '4',
        nombre: 'Sofía',
        apellido: 'Hernández',
        parentesco: 'Hija',
        telefono: ''
      }
    ],
    foto: '/lovable-uploads/resident-4.jpg',
    estatus: 'activo',
    fechaIngreso: '2018-12-01'
  }
];

export const users: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin'
  },
  {
    id: '2',
    username: 'maria.gonzalez',  
    password: 'user123',
    role: 'user',
    residentId: '1'
  },
  {
    id: '3',
    username: 'roberto.martinez',
    password: 'user123', 
    role: 'user',
    residentId: '2'
  },
  {
    id: '4',
    username: 'ana.rodriguez',
    password: 'user123',
    role: 'user', 
    residentId: '3'
  },
  {
    id: '5',
    username: 'luis.hernandez',
    password: 'user123',
    role: 'user',
    residentId: '4'
  }
];