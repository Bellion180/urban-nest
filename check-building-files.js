import fs from 'fs';
import path from 'path';

// Verificar si existe el edificio recién creado
async function checkBuildingFiles() {
  const buildingId = 'cmfbyrbgz0006fa9o13kk5nub'; // ID del edificio de la prueba anterior
  
  console.log('🔍 Verificando archivos para edificio:', buildingId);
  
  // Verificar en directorio root de edificios
  const rootPath = path.join('public', 'edificios');
  console.log('📁 Buscando en:', rootPath);
  
  if (fs.existsSync(rootPath)) {
    const files = fs.readdirSync(rootPath);
    console.log('📋 Archivos en /public/edificios/:');
    files.forEach(file => {
      const filePath = path.join(rootPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        console.log(`  📁 ${file}/`);
        // Listar contenido de carpeta
        const subFiles = fs.readdirSync(filePath);
        subFiles.forEach(subFile => {
          console.log(`    📄 ${subFile}`);
        });
      } else {
        console.log(`  📄 ${file}`);
      }
    });
  } else {
    console.log('❌ Directorio /public/edificios no existe');
  }
  
  // Verificar carpeta específica del edificio
  const buildingPath = path.join('public', 'edificios', buildingId);
  console.log('📁 Verificando carpeta del edificio:', buildingPath);
  
  if (fs.existsSync(buildingPath)) {
    console.log('✅ Carpeta del edificio existe');
    const files = fs.readdirSync(buildingPath);
    console.log('📋 Archivos en la carpeta del edificio:');
    files.forEach(file => {
      console.log(`  📄 ${file}`);
    });
  } else {
    console.log('❌ Carpeta del edificio NO existe');
  }
}

checkBuildingFiles();
