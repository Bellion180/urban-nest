// Archivo API principal que mantiene compatibilidad con la interfaz anterior
// pero redirige a los nuevos servicios para la nueva estructura de BD

const API_BASE_URL = 'http://localhost:3001/api';

// ===== UTILIDADES =====
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

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

// ===== SERVICIOS DE AUTENTICACIÓN =====
export const authService = {
  login: async (email: string, password: string) => {
    try {
      console.log('API: Enviando solicitud de login al servidor:', email);
      
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      console.log('API: Respuesta recibida:', response.status, response.statusText);
      
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

  verifyToken: async () => {
    const response = await authenticatedFetch('/auth/verify');
    return response.json();
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },
};

// ===== SERVICIOS DE EDIFICIOS/TORRES =====
export const buildingService = {
  // Obtener todas las torres (mapeado como edificios para compatibilidad)
  getAll: async () => {
    const response = await authenticatedFetch('/torres');
    return response.json();
  },

  // Obtener una torre específica por ID con sus niveles
  getById: async (id: string) => {
    const response = await authenticatedFetch(`/torres/details/${id}`);
    return response.json();
  },

  // Crear nueva torre (mapeado como edificio)
  create: async (buildingData: {
    name: string;
    description?: string;
    image?: File;
    floors?: Array<{
      name: string;
      number: number;
      apartments: string[];
    }>;
    floorImages?: (File | null)[];
  }) => {
    const formData = new FormData();
    formData.append('name', buildingData.name);
    formData.append('description', buildingData.description || '');
    
    if (buildingData.image) {
      formData.append('image', buildingData.image);
    }
    
    if (buildingData.floors) {
      formData.append('floors', JSON.stringify(buildingData.floors));
    }
    
    if (buildingData.floorImages) {
      buildingData.floorImages.forEach((floorImage, index) => {
        if (floorImage) {
          formData.append(`floorImage_${index}`, floorImage);
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/buildings`, {
      method: 'POST',
      headers: {
        ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Eliminar torre
  delete: async (id: string) => {
    const response = await authenticatedFetch(`/torres/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Agregar apartamento (crear departamento)
  addApartment: async (buildingId: string, apartmentData: { number: string }) => {
    const response = await authenticatedFetch(`/torres/${buildingId}/departamentos`, {
      method: 'POST',
      body: JSON.stringify({
        no_departamento: apartmentData.number
      }),
    });
    return response.json();
  },

  // Métodos mantenidos para compatibilidad
  addFloor: async () => ({ message: 'Floor concept not applicable in new structure' }),
  createWithImage: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/buildings`, {
      method: 'POST',
      headers: {
        ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
  getFloorImages: async (buildingId: string) => {
    const response = await authenticatedFetch(`/buildings/${buildingId}/pisos/imagenes`);
    return response.json();
  },

  uploadFloorImage: async (buildingId: string, floorNumber: number, imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/buildings/${buildingId}/pisos/${floorNumber}/image`, {
      method: 'POST',
      headers: {
        ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
  update: async (id: string, updateData: any) => {
    // No hay endpoint de actualización directo, devolver estructura mínima
    return { message: 'Update not implemented in new structure' };
  }
};

// ===== SERVICIOS DE NIVELES =====
export const floorService = {
  // Obtener niveles de una torre (mapeado como floors para compatibilidad)
  getByBuilding: async (buildingId: string) => {
    const response = await authenticatedFetch(`/niveles/torre/${buildingId}`);
    return response.json();
  },

  // Crear nuevo nivel
  create: async (buildingId: string, floorData: { number: number; name: string }) => {
    const response = await authenticatedFetch(`/niveles/torre/${buildingId}`, {
      method: 'POST',
      body: JSON.stringify({
        numero: floorData.number,
        nombre: floorData.name
      }),
    });
    return response.json();
  },

  // Eliminar nivel
  delete: async (floorId: string) => {
    const response = await authenticatedFetch(`/niveles/${floorId}`, {
      method: 'DELETE',
    });
    return response.json();
  }
};

// ===== SERVICIOS DE RESIDENTES/COMPAÑEROS =====
export const residentService = {
  // Obtener todos los compañeros (mapeado como residentes)
  getAll: async () => {
    const response = await authenticatedFetch('/companeros');
    return response.json();
  },

  // Crear nuevo compañero
  create: async (residentData: any) => {
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
    
    const response = await authenticatedFetch('/companeros', {
      method: 'POST',
      body: JSON.stringify(mappedData),
    });
    return response.json();
  },

  // Actualizar compañero
  update: async (id: string, residentData: any) => {
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
    
    const response = await authenticatedFetch(`/companeros/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mappedData),
    });
    return response.json();
  },

  // Actualizar con documentos (los documentos no existen en nueva estructura)
  updateWithDocuments: async (id: string, formData: FormData) => {
    console.log(`API: Making multipart request to /companeros/${id}`);
    
    const companeroData: any = {};
    
    formData.forEach((value, key) => {
      if (!key.startsWith('documents_')) {
        if (key === 'apellido') {
          companeroData.apellidos = value;
        } else if (key === 'fechaNacimiento') {
          companeroData.fecha_nacimiento = value;
        } else if (key === 'noPersonas') {
          companeroData.no_personas = parseInt(value as string);
        } else if (key === 'noPersonasDiscapacitadas') {
          companeroData.no_des_per = parseInt(value as string);
        } else if (key === 'nombre' || key === 'recibo_apoyo' || key === 'no_apoyo' || key === 'id_departamento') {
          companeroData[key] = value;
        }
      }
    });

    const response = await authenticatedFetch(`/companeros/${id}`, {
      method: 'PUT',
      body: JSON.stringify(companeroData),
    });

    console.log(`API: Response from /companeros/${id}:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      contentType: response.headers.get('content-type')
    });

    if (!response.ok) {
      let errorDetails;
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType && contentType.includes('application/json')) {
          errorDetails = await response.json();
        } else {
          const errorText = await response.text();
          errorDetails = { message: `Error ${response.status}: ${errorText}` };
        }
        console.error(`API: Error details from /companeros/${id}:`, errorDetails);
      } catch (parseError) {
        errorDetails = { message: `Error de red: ${response.status} ${response.statusText}` };
        console.error(`API: Could not parse error from /companeros/${id}:`, parseError);
      }
      
      throw new Error(errorDetails.message || errorDetails.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Eliminar compañero
  delete: async (id: string) => {
    const response = await authenticatedFetch(`/companeros/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Cambiar estatus
  updateStatus: async (id: string, status: string) => {
    const response = await authenticatedFetch(`/companeros/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ estatus: status }),
    });
    return response.json();
  },

  // Realizar pago
  makePayment: async (id: string, paymentData: { amount: number }) => {
    const response = await authenticatedFetch(`/companeros/${id}/payment`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    return response.json();
  },

  // Obtener residentes por edificio y nivel
  getByBuildingAndFloor: async (buildingId: string, floorNumber: string) => {
    const response = await authenticatedFetch(`/companeros/building/${buildingId}/floor/${floorNumber}`);
    return response.json();
  },

  // Métodos mantenidos para compatibilidad
  getById: async (id: string) => {
    // No hay endpoint específico, pero se puede obtener de la lista
    const residents = await residentService.getAll();
    return residents.find((r: any) => r.id === id);
  },

  createWithPhoto: async (formData: FormData) => {
    // Extraer datos y crear sin foto
    const residentData: any = {};
    const financiero: any = {};
    formData.forEach((value, key) => {
      if (key.startsWith('financiero.')) {
        const field = key.replace('financiero.', '');
        financiero[field] = value;
      } else if (key !== 'photo') {
        residentData[key] = value;
      }
    });
    if (Object.keys(financiero).length > 0) {
      residentData.financiero = financiero;
    }
    return residentService.create(residentData);
  },
};

// ===== SERVICIOS DE PAGOS =====
export const paymentService = {
  getByResident: async () => [],
  create: async (paymentData: {
    residentId: string;
    amount: number;
    type: string;
    description?: string;
  }) => {
    return residentService.makePayment(paymentData.residentId, {
      amount: paymentData.amount
    });
  },
};
