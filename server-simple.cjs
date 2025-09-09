// Servidor simplificado que no se cierra
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient();

// Configurar CORS
const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));
app.use('/edificios', express.static('public/edificios'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Urban Nest API funcionando correctamente', 
    timestamp: new Date().toISOString()
  });
});

// Ruta para obtener detalles de una torre con niveles
app.get('/api/torres/details/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const torre = await prisma.torres.findUnique({
      where: { id_torre: id },
      include: {
        niveles: {
          orderBy: { numero: 'asc' }
        }
      }
    });

    if (!torre) {
      return res.status(404).json({ error: 'Torre no encontrada' });
    }

    // Formatear respuesta
    const response = {
      id: torre.id_torre,
      name: torre.letra || torre.descripcion,
      description: torre.descripcion,
      image: torre.imagen,
      niveles: torre.niveles.map(nivel => ({
        id_nivel: nivel.id_nivel,
        numero_nivel: nivel.numero,
        descripcion: nivel.nombre,
        id_torre: nivel.id_torre,
        imagen: nivel.imagen // Ahora incluye la imagen del piso
      }))
    };

    res.json(response);
  } catch (error) {
    console.error('Error obteniendo detalles de torre:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener todas las torres
app.get('/api/buildings', async (req, res) => {
  try {
    const torres = await prisma.torres.findMany({
      include: {
        niveles: {
          orderBy: { numero: 'asc' }
        }
      }
    });

    const buildings = torres.map(torre => ({
      id: torre.id_torre,
      name: torre.letra || torre.descripcion,
      description: torre.descripcion,
      image: torre.imagen,
      floors: torre.niveles.map(nivel => ({
        id: nivel.id_nivel,
        name: nivel.nombre,
        number: nivel.numero,
        buildingId: torre.id_torre,
        apartments: [], // Por simplicidad
        _count: {
          residents: 0 // Por simplicidad
        }
      }))
    }));

    res.json(buildings);
  } catch (error) {
    console.error('Error obteniendo torres:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Función para mantener el servidor corriendo
function keepServerAlive() {
  setInterval(() => {
    // Ping cada 30 segundos para mantener vivo
    console.log('⏰ Server alive check:', new Date().toISOString());
  }, 30000);
}

// Iniciar servidor
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado a MySQL');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor simplificado corriendo en http://localhost:${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/api/health`);
      keepServerAlive();
    });

    // Prevenir cierre automático
    server.on('close', () => {
      console.log('⚠️ Servidor intentando cerrarse - manteniéndolo vivo');
    });

  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    setTimeout(startServer, 3000); // Reintentar en 3 segundos
  }
}

// Manejo de errores no capturadas
process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
  // No cerrar el proceso, solo registrar el error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  // No cerrar el proceso, solo registrar el error
});

console.log('🔄 Iniciando servidor simplificado...');
startServer();
