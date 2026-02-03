// Script de prueba de conexión al backend
// Ejecutar con: node test-connection.js

const API_URL = 'http://192.168.0.3:8001/api/v1';
const BACKEND_URL = 'http://192.168.0.3:8001';

async function testConnection() {
  console.log('🧪 Probando conexión al backend...');
  console.log(`📍 URL: ${API_URL}`);
  console.log(`📍 Backend: ${BACKEND_URL}`);
  
  try {
    // Test 1: Verificar que el servidor responde
    console.log('\n1️⃣ Test: GET /health');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test 2: Intentar login con credenciales de prueba
    console.log('\n2️⃣ Test: POST /auth/login');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Status:', loginResponse.status);
    console.log('Response:', loginData);
    
    if (loginResponse.ok) {
      console.log('✅ Login exitoso!');
    } else {
      console.log('⚠️ Login falló (puede ser normal si no existe el usuario)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 El backend no está corriendo. Inicia el servidor:');
      console.log('   cd Truekealo/backend');
      console.log('   .\\venv\\Scripts\\Activate.ps1');
      console.log('   uvicorn app.main:app --reload --host 0.0.0.0');
    } else if (error.message.includes('fetch')) {
      console.log('\n💡 Problema de conexión. Verifica:');
      console.log('   - Que el backend esté en http://0.0.0.0:8000');
      console.log('   - Que uses Android Emulator (10.0.2.2)');
      console.log('   - Para dispositivo físico, usa tu IP local');
    }
  }
}

testConnection();
