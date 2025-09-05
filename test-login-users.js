import fetch from 'node-fetch';

async function testLogin() {
  try {
    console.log('🔐 Probando login de usuarios...\n');

    // Test login admin
    console.log('1️⃣ Probando login de administrador:');
    const adminResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@urbannest.com',
        password: 'admin123'
      })
    });

    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('✅ Login administrador exitoso');
      console.log('   Token:', adminData.token?.substring(0, 20) + '...');
      console.log('   Usuario:', adminData.user.name, '- Rol:', adminData.user.role);
    } else {
      const adminError = await adminResponse.text();
      console.log('❌ Error en login administrador:', adminError);
    }

    console.log('\n2️⃣ Probando login de usuario normal:');
    // Test login user
    const userResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@urbannest.com',
        password: 'user123'
      })
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ Login usuario normal exitoso');
      console.log('   Token:', userData.token?.substring(0, 20) + '...');
      console.log('   Usuario:', userData.user.name, '- Rol:', userData.user.role);
    } else {
      const userError = await userResponse.text();
      console.log('❌ Error en login usuario normal:', userError);
    }

    console.log('\n🎉 Pruebas de login completadas');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

testLogin();
