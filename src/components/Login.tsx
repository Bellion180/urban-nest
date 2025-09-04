import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Login: Iniciando proceso de login con:', { email });
      
      await login(email, password);
      console.log('Login: Autenticación exitosa');
      
      toast({
        title: "Bienvenido",
        description: "Has iniciado sesión exitosamente",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login: Error de autenticación:', error);
      
      if (error.message && error.message.includes('Credenciales inválidas')) {
        toast({
          title: "Credenciales incorrectas",
          description: "El email o la contraseña son incorrectos. Por favor verifica tus datos.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error de autenticación",
          description: error.message || "No se pudo completar el inicio de sesión",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Header */}
        <div className="bg-tlahuacali-red text-white p-4 sm:p-6 rounded-t-lg text-center">
          <h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: 'Times New Roman' }}>TLAXILACALLI, A. C.</h1>
          <p className="text-xs sm:text-sm mt-1 opacity-90">Francisco Javier Mina No. 202<br/>Alcaldía Tláhuac.</p>
        </div>
        
        <Card className="rounded-t-none bg-tlahuacali-cream">
          <CardHeader className="text-center px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="text-lg sm:text-xl text-foreground">Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-white text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-tlahuacali-red hover:bg-tlahuacali-red/90 text-white text-sm sm:text-base py-2 sm:py-3 disabled:opacity-50"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => navigate('/forgot-password')}
                className="text-tlahuacali-red hover:text-tlahuacali-red/80 text-xs sm:text-sm p-0"
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </div>
            
            {/* Credentials Info */}
            <div className="mt-6 p-3 sm:p-4 bg-muted rounded-lg">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-2">
                Credenciales de acceso:
              </h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium block">Usuarios registrados:</span>
                  <div className="flex flex-col sm:flex-row sm:justify-between mt-1">
                    <span className="font-medium">Admin:</span>
                    <span>admin@urbannest.com / admin123</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="font-medium">Usuario:</span>
                    <span>user@urbannest.com / user123</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;