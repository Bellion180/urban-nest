// Script para ver qué torres existen en la base de datos
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001/api';

async function checkTorres() {
  console.log('🔍 Revisando torres en la base de datos...\n');

  try {
    // 1. Hacer login
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@urbannest.com',
        password: 'admin123'
      }),
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;

    // 2. Obtener torres
    const torresResponse = await fetch(`${API_BASE_URL}/torres`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const torres = await torresResponse.json();
    console.log('🏢 Torres en la base de datos:');
    console.log(JSON.stringify(torres, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTorres();
