import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PasswordRecovery = () => {
  const [step, setStep] = useState<'code' | 'newPassword'>('code');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar código (en un caso real, esto se verificaría con el backend)
    if (code === '123456') {
      setStep('newPassword');
      toast({
        title: "Código verificado",
        description: "Ahora puedes cambiar tu contraseña",
      });
    } else {
      toast({
        title: "Error",
        description: "Código incorrecto",
        variant: "destructive",
      });
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    // Aquí iría la lógica para cambiar la contraseña
    toast({
      title: "Contraseña cambiada",
      description: "Tu contraseña ha sido actualizada exitosamente",
    });
    
    // Redirigir al login después de 2 segundos
    setTimeout(() => {
      navigate('/login');
    }, 2000);
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
            <CardTitle className="text-foreground">
              {step === 'code' ? 'Verificar Código' : 'Nueva Contraseña'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 'code' ? (
              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div className="text-center mb-4">
                  <Mail className="mx-auto h-12 w-12 text-tlahuacali-red mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Ingresa el código de 6 dígitos que enviamos a tu correo electrónico
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    (Código de prueba: 123456)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Código de verificación"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="pl-10 bg-white text-center text-2xl tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-tlahuacali-red hover:bg-tlahuacali-red/90 text-white"
                >
                  Verificar Código
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  Volver al Login
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="text-center mb-4">
                  <Key className="mx-auto h-12 w-12 text-tlahuacali-red mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Ingresa tu nueva contraseña
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Nueva contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Confirmar contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-tlahuacali-red hover:bg-tlahuacali-red/90 text-white"
                >
                  Cambiar Contraseña
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PasswordRecovery;
