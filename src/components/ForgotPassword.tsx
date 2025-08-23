import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import EmailSentModal from './EmailSentModal';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu correo electrónico",
        variant: "destructive",
      });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Por favor ingresa un correo electrónico válido",
        variant: "destructive",
      });
      return;
    }

    // Simular envío de correo
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleContinue = () => {
    setIsModalOpen(false);
    navigate('/password-recovery');
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
            <CardTitle className="text-foreground">Recuperar Contraseña</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <Mail className="mx-auto h-12 w-12 text-tlahuacali-red mb-2" />
              <p className="text-sm text-muted-foreground">
                Ingresa tu correo electrónico y te enviaremos un código para recuperar tu contraseña
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-tlahuacali-red hover:bg-tlahuacali-red/90 text-white"
              >
                Enviar Código
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
          </CardContent>
        </Card>
      </div>
      
      <EmailSentModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onContinue={handleContinue}
      />
    </div>
  );
};

export default ForgotPassword;
