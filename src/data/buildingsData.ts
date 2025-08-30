// Datos centralizados de edificios con estructura completa
export interface BuildingData {
  id: string;
  name: string;
  description: string;
  image: string;
  floors: FloorData[];
}

export interface FloorData {
  id: string;
  name: string;
  apartments: string[];
}

// Datos de edificios sincronizados con el sistema
export const buildingsData: BuildingData[] = [
  {
    id: 'edificio-a',
    name: 'Edificio A',
    description: 'Torre principal con vista al jardín',
    image: '/lovable-uploads/building-a.jpg',
    floors: [
      {
        id: 'piso-1',
        name: 'Piso 1',
        apartments: ['101', '102', '103', '104', '105']
      },
      {
        id: 'piso-2',
        name: 'Piso 2',
        apartments: ['201', '202', '203', '204', '205']
      },
      {
        id: 'piso-3',
        name: 'Piso 3',
        apartments: ['301', '302', '303', '304', '305']
      },
      {
        id: 'piso-4',
        name: 'Piso 4',
        apartments: ['401', '402', '403', '404', '405']
      }
    ]
  },
  {
    id: 'edificio-b',
    name: 'Edificio B',
    description: 'Torre norte con amenidades completas',
    image: '/lovable-uploads/building-b.jpg',
    floors: [
      {
        id: 'piso-1',
        name: 'Piso 1',
        apartments: ['101', '102', '103', '104', '105', '106']
      },
      {
        id: 'piso-2',
        name: 'Piso 2',
        apartments: ['201', '202', '203', '204', '205', '206']
      },
      {
        id: 'piso-3',
        name: 'Piso 3',
        apartments: ['301', '302', '303', '304', '305', '306']
      }
    ]
  },
  {
    id: 'edificio-c',
    name: 'Edificio C',
    description: 'Torre sur con espacios amplios',
    image: '/lovable-uploads/building-c.jpg',
    floors: [
      {
        id: 'piso-1',
        name: 'Piso 1',
        apartments: ['101', '102', '103', '104']
      },
      {
        id: 'piso-2',
        name: 'Piso 2',
        apartments: ['201', '202', '203', '204']
      },
      {
        id: 'piso-3',
        name: 'Piso 3',
        apartments: ['301', '302', '303', '304']
      },
      {
        id: 'piso-4',
        name: 'Piso 4',
        apartments: ['401', '402', '403', '404']
      },
      {
        id: 'piso-5',
        name: 'Piso 5',
        apartments: ['501', '502', '503', '504']
      },
      {
        id: 'piso-6',
        name: 'Piso 6',
        apartments: ['601', '602']
      }
    ]
  },
  {
    id: 'edificio-d',
    name: 'Edificio D',
    description: 'Torre este con área de coworking',
    image: '/lovable-uploads/building-a.jpg',
    floors: [
      {
        id: 'piso-1',
        name: 'Piso 1',
        apartments: ['101', '102', '103', '104', '105']
      },
      {
        id: 'piso-2',
        name: 'Piso 2',
        apartments: ['201', '202', '203', '204', '205']
      },
      {
        id: 'piso-3',
        name: 'Piso 3',
        apartments: ['301', '302', '303', '304', '305']
      },
      {
        id: 'piso-4',
        name: 'Piso 4',
        apartments: ['401', '402', '403', '404', '405']
      },
      {
        id: 'piso-5',
        name: 'Piso 5',
        apartments: ['501', '502', '503', '504', '505']
      }
    ]
  },
  {
    id: 'edificio-e',
    name: 'Edificio E',
    description: 'Torre oeste con gimnasio exclusivo',
    image: '/lovable-uploads/building-b.jpg',
    floors: [
      {
        id: 'piso-1',
        name: 'Piso 1',
        apartments: ['101', '102', '103', '104']
      },
      {
        id: 'piso-2',
        name: 'Piso 2',
        apartments: ['201', '202', '203', '204']
      },
      {
        id: 'piso-3',
        name: 'Piso 3',
        apartments: ['301', '302', '303', '304']
      },
      {
        id: 'piso-4',
        name: 'Piso 4',
        apartments: ['401', '402', '403', '404']
      }
    ]
  },
  {
    id: 'edificio-g',
    name: 'Edificio G',
    description: 'Torre premium con piscina privada',
    image: '/lovable-uploads/building-a.jpg',
    floors: [
      {
        id: 'piso-1',
        name: 'Piso 1',
        apartments: ['101', '102', '103']
      },
      {
        id: 'piso-2',
        name: 'Piso 2',
        apartments: ['201', '202', '203']
      },
      {
        id: 'piso-3',
        name: 'Piso 3',
        apartments: ['301', '302', '303']
      },
      {
        id: 'piso-4',
        name: 'Piso 4',
        apartments: ['401', '402', '403']
      },
      {
        id: 'piso-5',
        name: 'Piso 5',
        apartments: ['501', '502', '503']
      }
    ]
  }
];

// Función helper para obtener el total de apartamentos
export const getTotalApartments = (building: BuildingData): number => {
  return building.floors.reduce((total, floor) => total + floor.apartments.length, 0);
};

// Función helper para obtener un edificio por ID
export const getBuildingById = (id: string): BuildingData | undefined => {
  return buildingsData.find(building => building.id === id);
};
