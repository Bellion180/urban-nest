// Servicios adaptados para la nueva estructura de base de datos
// Mantiene compatibilidad con la interfaz anterior pero usa las nuevas rutas

const API_BASE_URL = 'http://localhost:3001/api';

// ===== SERVICIOS DE COMPATIBILIDAD =====

// Función auxiliar para obtener token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Función auxiliar para peticiones autenticadas
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response;
};

// ===== SERVICIOS DE TORRES (antes Buildings) =====
export const torresService = {
  // Obtener todas las torres
  getAll: async () => {
    const response = await authenticatedFetch('/torres');
    return response.json();
  },

  // Crear nueva torre
  create: async (torreData: {
    letra: string;
    nivel?: string;
  }) => {
    const response = await authenticatedFetch('/torres', {
      method: 'POST',
      body: JSON.stringify(torreData),
    });
    return response.json();
  },

  // Crear departamento en una torre
  createDepartamento: async (torreId: string, departamentoData: {
    no_departamento: string;
  }) => {
    const response = await authenticatedFetch(`/torres/${torreId}/departamentos`, {
      method: 'POST',
      body: JSON.stringify(departamentoData),
    });
    return response.json();
  },

  // Obtener departamentos de una torre
  getDepartamentos: async (torreId: string) => {
    const response = await authenticatedFetch(`/torres/${torreId}/departamentos`);
    return response.json();
  },

  // Eliminar torre
  delete: async (id: string) => {
    const response = await authenticatedFetch(`/torres/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// ===== SERVICIOS DE COMPAÑEROS (antes Residents) =====
export const companerosService = {
  // Obtener todos los compañeros
  getAll: async () => {
    const response = await authenticatedFetch('/companeros');
    return response.json();
  },

  // Crear nuevo compañero
  create: async (companeroData: {
    nombre: string;
    apellidos: string;
    fecha_nacimiento?: string;
    no_personas?: number;
    no_des_per?: number;
    recibo_apoyo?: string;
    no_apoyo?: number;
    id_departamento: string;
  }) => {
    const response = await authenticatedFetch('/companeros', {
      method: 'POST',
      body: JSON.stringify(companeroData),
    });
    return response.json();
  },

  // Actualizar compañero
  update: async (id: string, companeroData: any) => {
    const response = await authenticatedFetch(`/companeros/${id}`, {
      method: 'PUT',
      body: JSON.stringify(companeroData),
    });
    return response.json();
  },

  // Eliminar compañero
  delete: async (id: string) => {
    const response = await authenticatedFetch(`/companeros/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Realizar pago
  makePayment: async (id: string, paymentData: {
    amount: number;
  }) => {
    const response = await authenticatedFetch(`/companeros/${id}/payment`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    return response.json();
  },
};

// ===== SERVICIOS DE COMPATIBILIDAD PARA MANTENER LA INTERFAZ ANTERIOR =====

// Mapear buildingService a torresService para compatibilidad
export const buildingService = {
  getAll: torresService.getAll,
  create: (buildingData: { name: string; description?: string }) => 
    torresService.create({ letra: buildingData.name, nivel: buildingData.description }),
  delete: torresService.delete,
  // Agregar métodos adicionales que mapeen a la nueva estructura
  addFloor: async (buildingId: string, floorData: { number: number; name?: string }) => {
    // En la nueva estructura, no hay pisos separados, solo departamentos
    // Este método se mantiene para compatibilidad pero no hace nada
    return { message: 'Floor concept not applicable in new structure' };
  },
  addApartment: async (buildingId: string, apartmentData: { number: string }) => {
    return torresService.createDepartamento(buildingId, { no_departamento: apartmentData.number });
  },
};

// Mapear residentService a companerosService para compatibilidad
export const residentService = {
  getAll: companerosService.getAll,
  create: (residentData: any) => {
    // Mapear campos de la interfaz anterior a la nueva
    const mappedData = {
      nombre: residentData.nombre,
      apellidos: residentData.apellido,
      fecha_nacimiento: residentData.fechaNacimiento,
      no_personas: residentData.noPersonas,
      no_des_per: residentData.noPersonasDiscapacitadas || (residentData.discapacidad ? 1 : 0),
      recibo_apoyo: residentData.recibo_apoyo || 'NO',
      no_apoyo: residentData.no_apoyo,
      id_departamento: residentData.apartmentId,
    };
    return companerosService.create(mappedData);
  },
  update: (id: string, residentData: any) => {
    // Mapear campos de la interfaz anterior a la nueva
    const mappedData = {
      nombre: residentData.nombre,
      apellidos: residentData.apellido,
      fecha_nacimiento: residentData.fechaNacimiento,
      no_personas: residentData.noPersonas,
      no_des_per: residentData.noPersonasDiscapacitadas,
      recibo_apoyo: residentData.recibo_apoyo,
      no_apoyo: residentData.no_apoyo,
      id_departamento: residentData.apartmentId,
    };
    return companerosService.update(id, mappedData);
  },
  delete: companerosService.delete,
  makePayment: companerosService.makePayment,
  
  // Métodos que no tienen equivalente directo en la nueva estructura
  updateWithDocuments: async (id: string, formData: FormData) => {
    // Los documentos no existen en la nueva estructura
    // Por ahora, extraer solo los datos del compañero y actualizar
    const companeroData: any = {};
    
    formData.forEach((value, key) => {
      if (key !== 'documents_curp' && key !== 'documents_ine' && 
          key !== 'documents_comprobanteDomicilio' && key !== 'documents_actaNacimiento') {
        if (key === 'apellido') {
          companeroData.apellidos = value;
        } else if (key === 'fechaNacimiento') {
          companeroData.fecha_nacimiento = value;
        } else if (key === 'noPersonas') {
          companeroData.no_personas = parseInt(value as string);
        } else if (key === 'noPersonasDiscapacitadas') {
          companeroData.no_des_per = parseInt(value as string);
        } else {
          companeroData[key] = value;
        }
      }
    });

    return companerosService.update(id, companeroData);
  },
  
  updateStatus: async (id: string, status: string) => {
    return companerosService.update(id, { estatus: status });
  },
};

// Mantener authService sin cambios (ya está bien definido en el archivo original)
export { authService } from './api';

// ===== SERVICIOS DE PAGOS =====
export const paymentService = {
  // Obtener pagos de un compañero
  getByResident: async (residentId: string) => {
    // En la nueva estructura, los pagos están en la tabla financieros
    // Este endpoint necesitaría ser implementado en el backend
    return [];
  },

  // Crear pago
  create: async (paymentData: {
    residentId: string;
    amount: number;
    type: string;
    description?: string;
  }) => {
    return companerosService.makePayment(paymentData.residentId, {
      amount: paymentData.amount
    });
  },
};
