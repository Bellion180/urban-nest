import React, { useState, useEffect } from 'react';
import { buildingService } from '@/services/api';

const TestBuildingData = () => {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('TestComponent: Obteniendo datos...');
        const data = await buildingService.getAll();
        console.log('TestComponent: Datos recibidos:', data);
        
        // Log más detallado
        console.log('TestComponent: JSON completo:', JSON.stringify(data, null, 2));
        
        setBuildings(data);
      } catch (error) {
        console.error('TestComponent: Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4">Cargando datos de prueba...</div>;
  }

  return (
    <div className="p-4 bg-red-100 border-2 border-red-500 m-4 rounded">
      <h3 className="text-xl font-bold mb-4 text-red-800">🧪 TEST DE DATOS DE EDIFICIOS</h3>
      <p className="text-sm text-red-600 mb-4">Total edificios encontrados: {buildings.length}</p>
      
      {buildings.map((building, index) => (
        <div key={building.id} className="mb-4 p-3 bg-white rounded border-2">
          <h4 className="font-semibold text-lg">Edificio {index + 1}: {building.name}</h4>
          <p className="text-sm text-gray-600">ID: {building.id}</p>
          <p className="text-sm text-gray-600">Descripción: {building.description}</p>
          
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-300 rounded">
            <strong className="text-yellow-800">Floors/Niveles:</strong>
            {building.floors && building.floors.length > 0 ? (
              <div>
                <p className="text-green-600 font-semibold">✅ SÍ tiene floors ({building.floors.length})</p>
                <ul className="ml-4 list-disc">
                  {building.floors.map((floor: any, floorIndex: number) => (
                    <li key={floor.id} className="text-sm">
                      <strong>Nivel {floor.number}:</strong> {floor.name} 
                      <br />
                      &nbsp;&nbsp;→ {floor.apartments?.length || 0} apartamentos: {floor.apartments?.join(', ') || 'ninguno'}
                      <br />
                      &nbsp;&nbsp;→ Residentes: {floor._count?.residents || 0}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <span className="text-red-500 font-semibold">❌ Sin niveles definidos o floors es null/undefined</span>
            )}
          </div>
          
          <div className="mt-2 text-sm bg-blue-50 p-2 rounded">
            <strong>Total Residentes del Edificio:</strong> {building.totalResidents || building._count?.residents || 0}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestBuildingData;
