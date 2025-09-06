// Script para probar la eliminación de edificios
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

// Token de admin (necesitas reemplazar con uno válido)
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWY2YnFraXkwMDAwZmEwYzZjcjljZHE2IiwiZW1haWwiOiJhZG1pbkB1cmJhbm5lc3QuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzU3MTE2NjE0LCJleHAiOjE3NTcyMDMwMTR9.h7o1dSGbh_Or79gktwlkYQl_4zLRKHs7Bl8sR6wWzE2A';

async function testDeleteBuilding() {
  try {
    console.log('🔍 Obteniendo edificios...');
    
    // Primero obtener la lista de edificios
    const buildingsResponse = await fetch(`${API_BASE}/buildings`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!buildingsResponse.ok) {
      throw new Error(`Error obteniendo edificios: ${buildingsResponse.status}`);
    }
    
    const buildings = await buildingsResponse.json();
    console.log('📊 Edificios encontrados:', buildings.length);
    
    if (buildings.length === 0) {
      console.log('❌ No hay edificios para eliminar');
      return;
    }
    
    // Tomar el primer edificio para eliminarlo
    const buildingToDelete = buildings[0];
    console.log(`🏢 Edificio a eliminar: ${buildingToDelete.name} (ID: ${buildingToDelete.id})`);
    
    // Intentar eliminar el edificio
    console.log('🗑️ Intentando eliminar edificio...');
    const deleteResponse = await fetch(`${API_BASE}/buildings/${buildingToDelete.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error('❌ Error al eliminar edificio:', deleteResponse.status, errorText);
      return;
    }
    
    const result = await deleteResponse.json();
    console.log('✅ Edificio eliminado exitosamente:', result);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testDeleteBuilding();
