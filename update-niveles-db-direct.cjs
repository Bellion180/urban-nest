// Script para agregar el campo imagen a la tabla niveles y actualizar referencias
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function updateDatabase() {
  console.log('🔄 Actualizando base de datos para imágenes de pisos...\n');

  let connection;
  try {
    // Conectar a MySQL
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456789',
      database: 'urban_nest_db'
    });

    console.log('✅ Conectado a MySQL');

    // Verificar si el campo imagen ya existe
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'urban_nest_db' 
      AND TABLE_NAME = 'niveles' 
      AND COLUMN_NAME = 'imagen'
    `);

    if (columns.length === 0) {
      console.log('📝 Agregando campo "imagen" a la tabla niveles...');
      await connection.execute('ALTER TABLE niveles ADD COLUMN imagen VARCHAR(255) NULL');
      console.log('✅ Campo "imagen" agregado exitosamente');
    } else {
      console.log('✅ Campo "imagen" ya existe en la tabla niveles');
    }

    // Obtener todas las torres y niveles
    const [torres] = await connection.execute('SELECT id_torre, letra FROM torres');
    
    for (const torre of torres) {
      console.log(`🏢 Procesando torre: ${torre.letra} (${torre.id_torre})`);
      
      // Obtener niveles de esta torre
      const [niveles] = await connection.execute(
        'SELECT id_nivel, nombre, numero FROM niveles WHERE id_torre = ?',
        [torre.id_torre]
      );
      
      for (const nivel of niveles) {
        // Verificar si existe la imagen física
        const imagePath = path.join('public', 'edificios', torre.id_torre, 'pisos', nivel.numero.toString(), 'piso.jpg');
        
        if (fs.existsSync(imagePath)) {
          const imageReference = `/edificios/${torre.id_torre}/pisos/${nivel.numero}/piso.jpg`;
          
          // Actualizar la base de datos
          await connection.execute(
            'UPDATE niveles SET imagen = ? WHERE id_nivel = ?',
            [imageReference, nivel.id_nivel]
          );
          
          console.log(`  ✅ Nivel ${nivel.numero}: Imagen actualizada -> ${imageReference}`);
        } else {
          console.log(`  ❌ Nivel ${nivel.numero}: Sin imagen física encontrada`);
          
          // Limpiar referencia si no existe el archivo
          await connection.execute(
            'UPDATE niveles SET imagen = NULL WHERE id_nivel = ?',
            [nivel.id_nivel]
          );
        }
      }
      
      console.log('');
    }
    
    // Mostrar resumen
    const [totalResult] = await connection.execute('SELECT COUNT(*) as total FROM niveles');
    const [conImagenResult] = await connection.execute('SELECT COUNT(*) as count FROM niveles WHERE imagen IS NOT NULL');
    
    const total = totalResult[0].total;
    const conImagen = conImagenResult[0].count;
    
    console.log('🎉 ¡Actualización completada!');
    console.log(`📊 Resumen:`);
    console.log(`   Total de niveles: ${total}`);
    console.log(`   Niveles con imagen: ${conImagen}`);
    console.log(`   Niveles sin imagen: ${total - conImagen}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

updateDatabase();
