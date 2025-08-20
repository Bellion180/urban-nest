import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (login(username, password)) {
      toast({
        title: "Bienvenido",
        description: "Has iniciado sesión exitosamente",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Error",
        description: "Usuario o contraseña incorrectos",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="bg-tlahuacali-red text-white p-4 rounded-t-lg text-center">
          <h1 className="text-2xl font-bold">TLAHUACALI</h1>
        </div>
        
        <Card className="rounded-t-none bg-tlahuacali-cream">
          <CardHeader className="text-center">
            <CardTitle className="text-foreground">Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-white"
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
                    className="pl-10 bg-white"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-tlahuacali-red hover:bg-tlahuacali-red/90 text-white"
              >
                Acceder
              </Button>
            </form>
            
            <div className="mt-6 text-sm text-muted-foreground">
              <p className="text-center">Usuarios de prueba:</p>
              <p className="text-center">Admin: admin / admin123</p>
              <p className="text-center">Usuario: maria.gonzalez / user123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;