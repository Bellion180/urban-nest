const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testResidentCreation() {
    try {
        console.log('🧪 Probando creación de residente con archivos mejorado...');
        
        // Crear un archivo de imagen temporal de prueba
        const testImagePath = path.join(__dirname, 'test-photo.jpg');
        const testDocPath = path.join(__dirname, 'test-doc.pdf');
        
        // Crear archivos temporales con contenido más realista
        const fakeImageBuffer = Buffer.from([
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01
        ]); // JPEG header básico
        const fakePdfBuffer = Buffer.from('%PDF-1.4 fake pdf content');
        
        fs.writeFileSync(testImagePath, fakeImageBuffer);
        fs.writeFileSync(testDocPath, fakePdfBuffer);
        
        // Crear FormData correctamente
        const form = new FormData();
        
        // Agregar campos de texto
        form.append('nombre', 'Test User Node');
        form.append('apellidos', 'Test Apellidos Node');
        form.append('fecha_nacimiento', '1990-01-01');
        form.append('no_personas', '2');
        form.append('no_des_per', '0');
        form.append('recibo_apoyo', 'false');
        form.append('no_apoyo', '0');
        form.append('id_departamento', 'cmfbw9xey0002fafgexj98jy4'); // Departamento existente
        
        // Agregar archivos con streams
        form.append('profilePhoto', fs.createReadStream(testImagePath), {
            filename: 'test-photo.jpg',
            contentType: 'image/jpeg'
        });
        
        form.append('documents', fs.createReadStream(testDocPath), {
            filename: 'test-doc.pdf',
            contentType: 'application/pdf'
        });
        
        console.log('📋 FormData creado, enviando request...');
        
        // Enviar request con fetch usando node-fetch
        const response = await fetch('http://localhost:3001/api/companeros', {
            method: 'POST',
            body: form,
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWZidzgzMXYwMDAwZmEzZ3c1dTZjMnBuIiwiZW1haWwiOiJhZG1pbkB1cmJhbm5lc3QuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzU3NDY0MjE2LCJleHAiOjE3NTc1NTA2MTZ9.iK4QxRmrfHEqhJVHDX6vkNX26Ii0Sf6LDIhYK4xi-Oo',
                ...form.getHeaders() // Esto es importante para el Content-Type correcto
            }
        });
        
        const result = await response.text();
        
        console.log('📊 Status:', response.status);
        console.log('📋 Response:', result);
        
        // Limpiar archivos temporales
        try {
            fs.unlinkSync(testImagePath);
            fs.unlinkSync(testDocPath);
        } catch (cleanupError) {
            console.log('⚠️ Error limpiando archivos:', cleanupError.message);
        }
        
        if (response.ok) {
            console.log('✅ Residente creado exitosamente');
            return JSON.parse(result);
        } else {
            console.log('❌ Error:', response.status, result);
            return null;
        }
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
        return null;
    }
}

testResidentCreation();
