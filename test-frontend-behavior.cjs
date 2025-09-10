const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testFrontendBehavior() {
    try {
        console.log('🎯 Simulando comportamiento del frontend...');
        
        // Crear archivos temporales
        const testImagePath = path.join(__dirname, 'frontend-test-photo.jpg');
        const testDocPath = path.join(__dirname, 'frontend-test-doc.pdf');
        
        // Crear archivos con contenido realista
        const fakeImageBuffer = Buffer.from([
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01
        ]);
        const fakePdfBuffer = Buffer.from('%PDF-1.4 frontend test pdf');
        
        fs.writeFileSync(testImagePath, fakeImageBuffer);
        fs.writeFileSync(testDocPath, fakePdfBuffer);
        
        // Simular formData del frontend con algunos campos vacíos como en uso real
        const form = new FormData();
        
        // Mapear exactamente como hace el frontend
        form.append('nombre', 'Jorge Frontend'); // nombre del formData.nombre
        form.append('apellidos', ''); // formData.apellido puede estar vacío
        form.append('fecha_nacimiento', ''); // formData.fechaNacimiento puede estar vacío
        form.append('no_personas', ''); // formData.noPersonas puede estar vacío
        form.append('no_des_per', '0'); // formData.noPersonasDiscapacitadas con fallback
        form.append('recibo_apoyo', 'false'); // formData.discapacidad convertido
        form.append('no_apoyo', '0'); // con fallback
        form.append('id_departamento', 'cmfbw9xey0002fafgexj98jy4');
        
        // Agregar archivos como el frontend
        form.append('profilePhoto', fs.createReadStream(testImagePath), {
            filename: 'frontend-photo.jpg',
            contentType: 'image/jpeg'
        });
        
        form.append('documents', fs.createReadStream(testDocPath), {
            filename: 'frontend-doc.pdf',
            contentType: 'application/pdf'
        });
        
        console.log('📋 Enviando datos como frontend (con campos vacíos)...');
        
        // Usar fetch exactamente como el frontend
        const response = await fetch('http://localhost:3001/api/companeros', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWZidzgzMXYwMDAwZmEzZ3c1dTZjMnBuIiwiZW1haWwiOiJhZG1pbkB1cmJhbm5lc3QuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzU3NDY0MjE2LCJleHAiOjE3NTc1NTA2MTZ9.iK4QxRmrfHEqhJVHDX6vkNX26Ii0Sf6LDIhYK4xi-Oo',
                ...form.getHeaders()
            },
            body: form
        });
        
        const result = await response.text();
        
        console.log('📊 Status:', response.status);
        console.log('📋 Response:', result);
        
        // Limpiar
        try {
            fs.unlinkSync(testImagePath);
            fs.unlinkSync(testDocPath);
        } catch (e) {}
        
        if (response.ok) {
            console.log('✅ Funcionó como frontend');
        } else {
            console.log('❌ Error como frontend:', result);
        }
        
    } catch (error) {
        console.error('❌ Error simulando frontend:', error.message);
    }
}

testFrontendBehavior();
