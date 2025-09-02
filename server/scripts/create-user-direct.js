import { exec } from 'child_process';
import bcrypt from 'bcryptjs';

// Hashear la contraseña
const password = 'usuario123';
bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error al hashear la contraseña:', err);
    process.exit(1);
  }

  // Escapar comillas para SQL
  const hashedPassword = hash.replace(/'/g, "''");
  
  // SQL para insertar el usuario
  const sql = `
    INSERT INTO users (id, email, password, name, role, createdAt, updatedAt) 
    VALUES (
      CONCAT('clidusr', LOWER(HEX(RANDOM_BYTES(4)))), 
      'usuario@urbannest.com', 
      '${hashedPassword}', 
      'Usuario Especial', 
      'USER',
      NOW(), 
      NOW()
    )
    ON DUPLICATE KEY UPDATE 
      password = '${hashedPassword}',
      role = 'USER',
      updatedAt = NOW();
  `;
  
  // Comando para ejecutar la consulta SQL directamente con MySQL
  const command = `mysql -u root -ppassword -h localhost urban_nest_db -e "${sql}"`;
  
  // Ejecutar el comando
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al ejecutar el comando: ${error.message}`);
      process.exit(1);
    }
    if (stderr) {
      console.error(`Error de MySQL: ${stderr}`);
      process.exit(1);
    }
    console.log('Usuario especial creado exitosamente');
  });
});
