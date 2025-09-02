// Script to add a special user with USER role
import bcrypt from 'bcryptjs';
import { execSync } from 'child_process';
import fs from 'fs';

async function createSpecialUser() {
  try {
    // Generate hashed password
    const password = 'usuario123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create SQL command to insert the user
    const sqlCommand = `
      INSERT INTO users (id, email, password, name, role, createdAt, updatedAt) 
      VALUES (
        'usr_special', 
        'usuario@urbannest.com', 
        '${hashedPassword}', 
        'Usuario Especial', 
        'USER',
        NOW(), 
        NOW()
      )
      ON DUPLICATE KEY UPDATE 
        password = '${hashedPassword}',
        name = 'Usuario Especial',
        updatedAt = NOW();
    `;
    
    // Create a temporary SQL file
    fs.writeFileSync('temp_user.sql', sqlCommand);
    
    console.log('Ejecutando comando SQL para agregar usuario especial...');
    
    // Execute the SQL file using mysql command (assuming MySQL is accessible)
    try {
      execSync('mysql -h localhost -u root -ppassword urban_nest_db < temp_user.sql');
      console.log('✅ Usuario especial agregado correctamente');
    } catch (sqlError) {
      console.error('Error al ejecutar SQL:', sqlError.message);
      
      // Try with Docker if direct approach fails
      try {
        console.log('Intentando con Docker...');
        execSync('docker exec -i urban-nest-mysql mysql -uroot -ppassword urban_nest_db < temp_user.sql');
        console.log('✅ Usuario especial agregado correctamente via Docker');
      } catch (dockerError) {
        console.error('Error con Docker:', dockerError.message);
        throw dockerError;
      }
    }
    
    // Clean up
    fs.unlinkSync('temp_user.sql');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createSpecialUser();
