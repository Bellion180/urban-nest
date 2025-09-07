import React from 'react';
import Header from './Header';

const DashboardTest = () => {
  console.log('DashboardTest renderizado');
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Dashboard Test</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Este es un dashboard de prueba para verificar el funcionamiento
          </p>
        </div>

        <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
          <h3 className="font-bold text-green-800 mb-2">✅ Dashboard Funcionando</h3>
          <p className="text-green-700">
            Si puedes ver este mensaje, significa que el dashboard se está cargando correctamente después del login.
          </p>
        </div>

        <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-4">
          <h3 className="font-bold text-blue-800 mb-2">🔍 Estado de Debug</h3>
          <p className="text-blue-700">
            Timestamp: {new Date().toLocaleString()}
          </p>
          <p className="text-blue-700">
            URL Actual: {window.location.href}
          </p>
        </div>
      </main>
    </div>
  );
};

export default DashboardTest;
