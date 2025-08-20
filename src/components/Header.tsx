import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-tlahuacali-red text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">TLAHUACALI</h1>
          <span className="text-sm opacity-80">Sistema de Administración Residencial</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="text-sm">
              {currentUser?.username} 
              {isAdmin && <span className="ml-1 text-xs bg-white/20 px-2 py-1 rounded">ADMIN</span>}
            </span>
          </div>
          
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin')}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <Settings className="h-4 w-4 mr-1" />
              Admin
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Salir
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;