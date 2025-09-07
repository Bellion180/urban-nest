import express from 'express';
import { prisma } from '../../src/lib/prisma.js';

const router = express.Router();

console.log('🏠 Cargando rutas de torres...');

// Obtener todas las torres o una específica por ID
router.get('/', async (req, res) => {
  try {
    const { id } = req.query;
    console.log(`📋 GET /torres - Query params:`, req.query, 'ID:', id);
    
    if (id) {
      // Si se proporciona un ID, obtener solo esa torre
      console.log(`🔍 GET /torres?id=${id} - Buscando torre específica`);
      
      const torre = await prisma.torres.findUnique({
        where: {
          id_torre: id
        },
        include: {
          niveles: {
            include: {
              departamentos: {
                include: {
                  companeros: true
                }
              }
            },
            orderBy: {
              numero: 'asc'
            }
          },
          departamentos: {
            include: {
              companeros: true,
              nivel: true
            }
          }
        }
      });

      console.log(`🔍 Torre encontrada:`, torre ? 'SÍ' : 'NO');
      
      if (!torre) {
        console.log(`❌ Torre con ID ${id} no encontrada`);
        return res.status(404).json({ error: 'Torre no encontrada' });
      }

      // Mapear la torre específica
      const mappedTorre = {
        id: torre.id_torre,
        name: torre.letra,
        description: torre.descripcion || `Torre ${torre.letra}`,
        image: null,
        createdAt: torre.createdAt,
        updatedAt: torre.updatedAt,
        floors: (torre.niveles || []).map(nivel => ({
          id: nivel.id_nivel,
          name: nivel.nombre,
          number: nivel.numero,
          buildingId: torre.id_torre,
          apartments: (nivel.departamentos || []).map(rel => rel.departamento?.no_departamento || null),
          _count: {
            residents: (nivel.departamentos || []).reduce((total, rel) => total + (rel.departamento?.companeros?.length || 0), 0)
          }
        })),
        _count: {
          residents: (torre.departamentos || []).reduce((total, dept) => total + (dept.companeros?.length || 0), 0)
        }
      };

      console.log(`✅ Torre mapeada:`, mappedTorre);
      return res.json(mappedTorre);
    }

    // Si no se proporciona ID, obtener todas las torres
    console.log('📋 GET /torres - Obteniendo todas las torres');
    
    const torres = await prisma.torres.findMany({
      include: {
        niveles: {
          include: {
            departamentos: {
              include: {
                companeros: true
              }
            }
          },
          orderBy: {
            numero: 'asc'
          }
        },
        departamentos: {
          include: {
            companeros: true,
            nivel: true
          }
        }
      },
      orderBy: {
        letra: 'asc'
      }
    });

    if (!torres || torres.length === 0) {
      return res.json([]);
    }

    // Mapear para compatibilidad con estructura anterior pero incluyendo niveles
    const mappedBuildings = torres.map(torre => ({
      id: torre.id_torre,
      name: torre.letra,
      description: torre.descripcion || `Torre ${torre.letra}`,
      image: null,
      createdAt: torre.createdAt,
      updatedAt: torre.updatedAt,
      // Mapear niveles como floors
      floors: (torre.niveles || []).map(nivel => ({
        id: nivel.id_nivel,
        name: nivel.nombre,
        number: nivel.numero,
        buildingId: torre.id_torre,
        apartments: (nivel.departamentos || []).map(rel => rel.departamento?.no_departamento || null),
        _count: {
          residents: (nivel.departamentos || []).reduce((total, rel) => total + (rel.departamento?.companeros?.length || 0), 0)
        }
      })),
      _count: {
        residents: (torre.departamentos || []).reduce((total, dept) => total + (dept.companeros?.length || 0), 0)
      }
    }));

    res.json(mappedBuildings);
  } catch (error) {
    console.error('Error al obtener torres:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export { router as torresRoutes };

console.log('✅ Rutas de torres cargadas exitosamente');
