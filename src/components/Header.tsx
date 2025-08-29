import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-tlahuacali-red text-white shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">TLAHUACALI</h1>
            <span className="hidden md:block text-xs sm:text-sm opacity-80">
              Sistema de Administración Residencial
            </span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
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

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="text-white hover:bg-white/20"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-3">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4" />
                <span>
                  {currentUser?.username}
                  {isAdmin && <span className="ml-1 text-xs bg-white/20 px-2 py-1 rounded">ADMIN</span>}
                </span>
              </div>
              
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigate('/admin');
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 justify-start"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;