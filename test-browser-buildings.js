// Test directo del buildingService desde el navegador
console.log('🧪 Probando buildingService desde el navegador...');

// Importar el buildingService
import { buildingService } from './src/services/api.ts';

async function testBuildingService() {
  try {
    console.log('📡 Llamando buildingService.getAll()...');
    const buildings = await buildingService.getAll();
    
    console.log('✅ Datos recibidos:', buildings);
    console.log('📊 Total edificios:', buildings.length);
    
    buildings.forEach((building, index) => {
      console.log(`\n🏢 Edificio ${index + 1}:`);
      console.log('   name:', building.name);
      console.log('   id:', building.id);
      console.log('   floors (tipo):', typeof building.floors);
      console.log('   floors (array?):', Array.isArray(building.floors));
      console.log('   floors (length):', building.floors?.length);
      console.log('   floors (raw):', building.floors);
      
      if (building.floors && building.floors.length > 0) {
        building.floors.forEach((floor, floorIndex) => {
          console.log(`     Piso ${floorIndex + 1}:`, floor);
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar test
testBuildingService();
