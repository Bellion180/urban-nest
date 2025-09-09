import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function createAdminUser() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'c',
    database: 'urban_nest_db'
  });

  try {
    console.log('🔍 Verificando usuarios existentes...');
    
    // Verificar si ya existe un usuario admin
    const [existingAdmins] = await connection.execute(`
      SELECT id, email, role 
      FROM users 
      WHERE role = 'ADMIN'
    `);

    if (existingAdmins.length > 0) {
      console.log('✅ Usuarios administradores existentes:');
      existingAdmins.forEach(admin => {
        console.log(`  - ${admin.email} (ID: ${admin.id})`);
      });
      
      console.log('\n¿Deseas crear otro usuario admin? Continuando...');
    }

    // Crear usuario administrador
    console.log('🔧 Creando nuevo usuario administrador...');
    
    const adminEmail = 'admin@urbannest.com';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Generar un ID único (simulando cuid)
    const adminId = 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Verificar si el email ya existe
    const [existingUser] = await connection.execute(`
      SELECT id FROM users WHERE email = ?
    `, [adminEmail]);

    if (existingUser.length > 0) {
      console.log('⚠️ Ya existe un usuario con el email:', adminEmail);
      console.log('✅ Puedes usar estas credenciales para iniciar sesión:');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
      return;
    }

    // Insertar nuevo usuario admin
    await connection.execute(`
      INSERT INTO users (id, email, password, name, role, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `, [adminId, adminEmail, hashedPassword, 'Administrador Principal', 'ADMIN']);

    console.log('✅ Usuario administrador creado exitosamente!');
    console.log('\n📋 Credenciales del administrador:');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`👤 Nombre: Administrador Principal`);
    console.log(`🔰 Rol: ADMIN`);
    console.log(`🆔 ID: ${adminId}`);
    
    console.log('\n🎯 Ahora puedes iniciar sesión en la aplicación con estas credenciales.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔍 Detalles del error:', error);
  } finally {
    await connection.end();
  }
}

createAdminUser();
