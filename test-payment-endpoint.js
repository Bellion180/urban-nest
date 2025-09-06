// Script para probar el endpoint de pagos
import fetch from 'node-fetch';

async function testPaymentEndpoint() {
  try {
    // Primero, obtener un token de autenticación
    console.log('🔐 Intentando autenticación...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@urbannest.com', // Ajusta según tu usuario admin
        password: 'admin123' // Ajusta según tu contraseña
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Autenticación exitosa');

    // Ahora probar el endpoint de payment
    console.log('💰 Probando endpoint de pago...');
    const paymentResponse = await fetch('http://localhost:3001/api/residents/cmf7i5tbi000cfac8dnipvv5a/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: 100.00,
        paymentDate: new Date().toISOString(),
        description: 'Pago de prueba'
      })
    });

    console.log(`📊 Respuesta del endpoint: ${paymentResponse.status} ${paymentResponse.statusText}`);
    
    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error('❌ Error response:', errorText);
    } else {
      const paymentData = await paymentResponse.json();
      console.log('✅ Pago procesado exitosamente:', paymentData);
    }

  } catch (error) {
    console.error('❌ Error en test:', error);
  }
}

testPaymentEndpoint();
