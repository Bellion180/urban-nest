import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/api';

interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: 'ADMIN' | 'USER';
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Verificar si es un token de modo demo
        if (token.startsWith('demo_token_') || token.startsWith('emergency_token_')) {
          console.log('Detectado token de modo demo, recuperando usuario de localStorage');
          try {
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
              setCurrentUser(JSON.parse(savedUser) as User);
              console.log('Usuario demo restaurado desde localStorage');
            }
          } catch (e) {
            console.error('Error al cargar usuario demo:', e);
            authService.logout();
          }
        } else {
          // Token normal, verificar con el servidor
          try {
            console.log('Verificando token con el servidor...');
            const userData = await authService.verifyToken();
            setCurrentUser(userData.user);
            console.log('Token verificado correctamente');
          } catch (error) {
            console.error('Error al verificar token:', error);
            authService.logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('AuthContext: Intentando iniciar sesión con:', email);
      
      // Usuarios de prueba hardcodeados para emergencias (solo admin y user, resident ya no permitido)
      const demoUsers: Record<string, User> = {
        'admin': { id: 'demo_admin', email: 'admin', nombre: 'Administrador', apellido: '', role: 'ADMIN' },
        'user': { id: 'demo_user', email: 'user', nombre: 'Usuario', apellido: '', role: 'USER' }
        // Eliminado resident porque ya no se permite el inicio de sesión
      };
      
      // Verificar si es un usuario de prueba (solo admin y user)
      const isDemoUser = (email === 'admin' && password === 'admin123') || 
                        (email === 'user' && password === 'user123');
      
      // Para usuarios de prueba, intentamos primero autenticación normal y fallback a demo
      if (isDemoUser) {
        console.log('Detectado usuario de prueba:', email);
        try {
          console.log('Intentando autenticar con el servidor...');
          const response = await authService.login(email, password);
          console.log('Autenticación exitosa con el servidor para usuario de prueba');
          setCurrentUser(response.user);
          return true;
        } catch (error) {
          console.warn('Error al conectar con el servidor, activando modo demo');
          
          // Login de emergencia (modo demo)
          const demoUser = demoUsers[email];
          if (demoUser) {
            console.log('Iniciando sesión en modo demo con:', demoUser);
            setCurrentUser(demoUser);
            localStorage.setItem('authToken', `emergency_token_${Date.now()}`);
            localStorage.setItem('currentUser', JSON.stringify(demoUser));
            return true;
          }
          
          console.error('No se pudo iniciar sesión en modo demo');
          throw error;
        }
      } 
      // Para usuarios regulares (email no es 'admin', 'user' o 'resident')
      else {
        console.log('Iniciando sesión con usuario regular:', email);
        try {
          const response = await authService.login(email, password);
          console.log('Respuesta del servidor:', response);
          setCurrentUser(response.user);
          return true;
        } catch (error: any) {
          console.error('Error al autenticar usuario regular:', error.message);
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error final en proceso de login:', error);
      // No absorbemos el error aquí para que se pueda manejar en el componente de login
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    authService.logout();
  };

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'ADMIN',
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};