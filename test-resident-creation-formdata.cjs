const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testResidentCreation() {
    try {
        console.log('🧪 Probando creación de residente con archivos...');
        
        // Crear un archivo de imagen temporal de prueba
        const testImagePath = 'test-photo.jpg';
        const testDocPath = 'test-doc.pdf';
        
        // Crear archivos temporales simples
        fs.writeFileSync(testImagePath, Buffer.from('fake image data'));
        fs.writeFileSync(testDocPath, Buffer.from('fake pdf data'));
        
        // Crear FormData como lo haría el frontend
        const form = new FormData();
        form.append('nombre', 'Test User');
        form.append('apellidos', 'Test Apellidos');
        form.append('fecha_nacimiento', '1990-01-01');
        form.append('no_personas', '2');
        form.append('no_des_per', '0');
        form.append('recibo_apoyo', 'false');
        form.append('no_apoyo', '0');
        form.append('id_departamento', 'cmfbw9xey0002fafgexj98jy4');
        
        // Agregar archivos
        form.append('profilePhoto', fs.createReadStream(testImagePath), 'test-photo.jpg');
        form.append('documents', fs.createReadStream(testDocPath), 'test-doc.pdf');
        
        // Enviar request
        const response = await fetch('http://localhost:3001/api/companeros', {
            method: 'POST',
            body: form,
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWZidzgzMXYwMDAwZmEzZ3c1dTZjMnBuIiwiZW1haWwiOiJhZG1pbkB1cmJhbm5lc3QuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzU3NDY0MjE2LCJleHAiOjE3NTc1NTA2MTZ9.iK4QxRmrfHEqhJVHDX6vkNX26Ii0Sf6LDIhYK4xi-Oo'
            }
        });
        
        const result = await response.text();
        
        console.log('📊 Status:', response.status);
        console.log('📋 Response:', result);
        
        // Limpiar archivos temporales
        fs.unlinkSync(testImagePath);
        fs.unlinkSync(testDocPath);
        
        if (response.ok) {
            console.log('✅ Residente creado exitosamente');
        } else {
            console.log('❌ Error:', response.status, result);
        }
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
    }
}

testResidentCreation();
