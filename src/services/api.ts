const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Función para obtener el token de autenticación
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Función para hacer peticiones autenticadas
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error de red' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response;
};

// ===== SERVICIOS DE AUTENTICACIÓN =====
export const authService = {
  // Iniciar sesión
  login: async (email: string, password: string) => {
    try {
      console.log('API: Enviando solicitud de login al servidor:', email);
      
      // Validar los datos antes de enviar
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }
      
      // Hacer la solicitud de login
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',  // Incluir cookies en la solicitud
      });
      
      console.log('API: Respuesta recibida:', response.status, response.statusText);
      
      // Manejar respuesta no exitosa
      if (!response.ok) {
        let errorMessage = `Error HTTP: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('API: Error detallado del servidor:', errorData);
        } catch (parseError) {
          console.error('API: No se pudo parsear respuesta de error:', parseError);
        }
        throw new Error(errorMessage);
      }

      // Parsear respuesta exitosa
      let data;
      try {
        data = await response.json();
        console.log('API: Datos de login recibidos:', { 
          ...data, 
          user: data.user ? { ...data.user, role: data.user.role } : null,
          token: data.token ? '[TOKEN PRESENTE]' : 'No token' 
        });
      } catch (parseError) {
        console.error('API: Error al parsear respuesta exitosa:', parseError);
        throw new Error('Error al procesar respuesta del servidor');
      }
      
      // Guardar token en localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        if (data.user) {
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        }
      } else {
        console.warn('API: No se recibió token del servidor');
        throw new Error('Autenticación incompleta: no se recibió token');
      }

      return data;
    } catch (error) {
      console.error('API: Error durante el login:', error);
      throw error;
    }
  },

  // Registrar usuario
  register: async (userData: {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    role?: 'ADMIN' | 'USER';
  }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al registrar usuario');
    }

    return response.json();
  },

  // Verificar token
  verifyToken: async () => {
    const response = await authenticatedFetch('/auth/verify');
    return response.json();
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('authToken');
  },
};

// ===== SERVICIOS DE EDIFICIOS =====
interface Floor {
  id?: string;
  name: string;
  number: number;
  apartments: string[];
}

interface BuildingUpdate {
  name?: string;
  description?: string;
  image?: string;
  floors?: Floor[];
}

export const buildingService = {
  // Obtener todos los edificios
  getAll: async () => {
    const response = await authenticatedFetch('/buildings');
    return response.json();
  },

  // Obtener edificio por ID con pisos y apartamentos
  getById: async (id: string) => {
    const response = await authenticatedFetch(`/buildings/${id}`);
    return response.json();
  },

  // Actualizar edificio
  update: async (id: string, updateData: BuildingUpdate) => {
    const response = await authenticatedFetch(`/buildings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return response.json();
  },

  // Crear edificio
  create: async (buildingData: {
    name: string;
    address?: string;
    description?: string;
    floors?: Array<{
      name: string;
      number: number;
      apartments: string[];
    }>;
  }) => {
    const response = await authenticatedFetch('/buildings', {
      method: 'POST',
      body: JSON.stringify(buildingData),
    });
    return response.json();
  },


  // Eliminar edificio
  delete: async (id: string) => {
    const response = await authenticatedFetch(`/buildings/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Agregar piso
  addFloor: async (buildingId: string, floorData: {
    number: number;
    name?: string;
  }) => {
    const response = await authenticatedFetch(`/buildings/${buildingId}/floors`, {
      method: 'POST',
      body: JSON.stringify(floorData),
    });
    return response.json();
  },

  // Agregar apartamento
  addApartment: async (floorId: string, apartmentData: {
    number: string;
    area?: number;
    bedrooms?: number;
    bathrooms?: number;
  }) => {
    const response = await authenticatedFetch(`/buildings/floors/${floorId}/apartments`, {
      method: 'POST',
      body: JSON.stringify(apartmentData),
    });
    return response.json();
  },

  // Crear edificio con imagen
  createWithImage: async (formData: FormData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/buildings`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error de red' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Subir imagen de piso
  uploadFloorImage: async (buildingId: string, pisoNumber: number, imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/buildings/${buildingId}/pisos/${pisoNumber}/image`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error de red' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Obtener imágenes de pisos de un edificio
  getFloorImages: async (buildingId: string) => {
    const response = await authenticatedFetch(`/buildings/${buildingId}/pisos/imagenes`);
    return response.json();
  },
};

// ===== SERVICIOS DE RESIDENTES =====
export const residentService = {
  // Obtener todos los residentes
  getAll: async () => {
    const response = await authenticatedFetch('/residents');
    return response.json();
  },

  // Obtener residente por ID
  getById: async (id: string) => {
    const response = await authenticatedFetch(`/residents/${id}`);
    return response.json();
  },

  // Obtener residentes por edificio y piso
  getByFloor: async (buildingId: string, floorNumber: string) => {
    console.log(`API: Obteniendo residentes del edificio ${buildingId}, piso ${floorNumber}`);
    const response = await authenticatedFetch(`/residents/by-floor/${buildingId}/${floorNumber}`);
    const residents = await response.json();
    console.log(`API: Residentes obtenidos:`, residents);
    return residents;
  },

  // Crear residente con foto de perfil
  createWithPhoto: async (residentData: {
    nombre: string;
    apellido: string;
    email?: string;
    telefono?: string;
    fechaNacimiento?: string;
    apartmentNumber: string;
    buildingId: string;
    floorNumber: string;
    profilePhoto?: File;
  }) => {
    const formData = new FormData();
    
    // Agregar todos los campos al FormData
    Object.entries(residentData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'profilePhoto' && value instanceof File) {
          formData.append('profilePhoto', value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/residents`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // No establecer Content-Type para FormData - el navegador lo hace automáticamente
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error de red' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Crear residente
  create: async (residentData: {
    nombre: string;
    apellido: string;
    email?: string;
    telefono?: string;
    fechaNacimiento?: string;
    profesion?: string;
    estadoCivil?: string;
    numeroEmergencia?: string;
    apartmentNumber: string;
    buildingId: string;
    floorNumber: number;
    vehiculos?: string;
    mascotas?: string;
    observaciones?: string;
    cuotaMantenimiento?: number;
    photo?: File;
  }) => {
    const formData = new FormData();
    
    // Agregar todos los campos al FormData
    Object.entries(residentData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'photo' && value instanceof File) {
          formData.append('photo', value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await authenticatedFetch('/residents', {
      method: 'POST',
      headers: {
        // No establecer Content-Type para FormData
      },
      body: formData,
    });
    return response.json();
  },

  // Actualizar residente
  update: async (id: string, residentData: any) => {
    const response = await authenticatedFetch(`/residents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(residentData),
    });
    return response.json();
  },

  // Eliminar residente
  delete: async (id: string) => {
    const response = await authenticatedFetch(`/residents/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// ===== SERVICIOS DE PAGOS =====
export const paymentService = {
  // Obtener pagos de un residente
  getByResident: async (residentId: string) => {
    const response = await authenticatedFetch(`/payments/resident/${residentId}`);
    return response.json();
  },

  // Crear pago
  create: async (paymentData: {
    residentId: string;
    amount: number;
    type: 'MANTENIMIENTO' | 'MULTA' | 'OTRO';
    description?: string;
    date?: string;
  }) => {
    const response = await authenticatedFetch('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    return response.json();
  },

  // Obtener estadísticas de pagos
  getStats: async () => {
    const response = await authenticatedFetch('/payments/stats');
    return response.json();
  },
};

export default {
  authService,
  buildingService,
  residentService,
  paymentService,
};
