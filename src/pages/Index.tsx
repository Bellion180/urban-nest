import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-tlahuacali-red">
          TLAHUACALI
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-6">
          Sistema de Administración Residencial
        </p>
        <div className="animate-pulse">
          <div className="h-2 bg-tlahuacali-red/20 rounded-full">
            <div className="h-2 bg-tlahuacali-red rounded-full animate-[loading_2s_ease-in-out_infinite]" 
                 style={{
                   animation: 'loading 2s ease-in-out infinite',
                 }}>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">Cargando...</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
