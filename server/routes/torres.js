import express from 'express';
import { prisma } from '../../src/lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

console.log('🏠 Cargando rutas de torres...');

// Función auxiliar para encontrar la imagen del edificio
const findBuildingImage = (buildingId) => {
  try {
    const buildingDir = path.join('public', 'edificios', buildingId);
    console.log(`🔍 Buscando imagen para edificio ${buildingId} en directorio:`, buildingDir);
    
    if (!fs.existsSync(buildingDir)) {
      console.log(`❌ Directorio no existe: ${buildingDir}, usando imagen por defecto`);
      return `/placeholder.svg`;
    }
    
    const files = fs.readdirSync(buildingDir);
    console.log(`📁 Archivos encontrados en ${buildingId}:`, files);
    
    // Buscar archivos de imagen que no sean piso.jpg o perfil.jpg (que son específicos de pisos/residentes)
    const imageFile = files.find(file => {
      const ext = path.extname(file).toLowerCase();
      const name = path.basename(file, ext).toLowerCase();
      const isImage = ['.png', '.jpg', '.jpeg'].includes(ext);
      const isNotSpecific = !name.includes('piso') && !name.includes('perfil') && !name.includes('nivel');
      console.log(`🔍 Evaluando archivo ${file}: ext=${ext}, name=${name}, isImage=${isImage}, isNotSpecific=${isNotSpecific}`);
      return isImage && isNotSpecific;
    });
    
    if (imageFile) {
      const result = `/edificios/${buildingId}/${imageFile}`;
      console.log(`✅ Imagen encontrada para edificio ${buildingId}:`, result);
      return result;
    } else {
      console.log(`❌ No se encontró imagen específica para edificio ${buildingId}, usando placeholder`);
      return `/placeholder.svg`;
    }
  } catch (error) {
    console.error(`❌ Error buscando imagen para edificio ${buildingId}:`, error);
    return `/placeholder.svg`;
  }
};

// Obtener todas las torres o una específica por ID
router.get('/', authMiddleware, async (req, res) => {
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

      console.log(`✅ Torre ${torre.letra} encontrada, mapeando datos...`);

      // Mapear para compatibilidad con estructura anterior pero incluyendo niveles
      const mappedBuilding = {
        id: torre.id_torre,
        name: torre.letra,
        description: torre.descripcion || `Torre ${torre.letra}`,
        image: findBuildingImage(torre.id_torre), // Búsqueda dinámica de imagen
        createdAt: torre.createdAt,
        updatedAt: torre.updatedAt,
        address: `Torre ${torre.letra}`,
        // Mapear niveles como floors
        floors: torre.niveles.map(nivel => ({
          id: nivel.id_nivel,
          name: nivel.nombre,
          number: nivel.numero,
          buildingId: torre.id_torre,
          apartments: nivel.departamentos.map(dept => ({
            id: dept.id_departamento,
            number: dept.nombre,
            residents: dept.companeros.map(companero => ({
              id: companero.id_companero,
              name: companero.nombre,
              lastName: companero.apellidos,
              status: companero.estatus
            }))
          })),
          _count: {
            residents: nivel.departamentos.reduce((total, dept) => total + dept.companeros.length, 0)
          }
        })),
        _count: {
          residents: torre.niveles.reduce((total, nivel) => 
            total + nivel.departamentos.reduce((subTotal, dept) => 
              subTotal + dept.companeros.length, 0), 0)
        }
      };

      return res.json(mappedBuilding);
    }

    // Si no se proporciona ID, obtener todas las torres (comportamiento existente)
    console.log('📋 GET /torres - Obteniendo todas las torres...');
    
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

    console.log(`📊 Torres encontradas en DB: ${torres.length}`);
    torres.forEach((torre, index) => {
      console.log(`  ${index + 1}. Torre ${torre.letra} - Niveles: ${torre.niveles?.length || 0}, Departamentos: ${torre.departamentos?.length || 0}`);
    });

    if (!torres || torres.length === 0) {
      console.log('❌ No se encontraron torres en la base de datos');
      return res.json([]);
    }

    // Mapear para compatibilidad con estructura anterior pero incluyendo niveles
    const mappedBuildings = torres.map(torre => {
      const totalResidents = (torre.niveles || []).reduce((total, nivel) => 
        total + (nivel.departamentos || []).reduce((subTotal, dept) => 
          subTotal + (dept.companeros?.length || 0), 0), 0);
      
      const totalFloors = (torre.niveles || []).length;
      
      const totalApartments = (torre.niveles || []).reduce((total, nivel) => 
        total + (nivel.departamentos || []).length, 0);

      console.log(`🏢 Torre ${torre.letra} - Niveles: ${totalFloors}, Departamentos: ${totalApartments}, Residentes: ${totalResidents}`);

      return {
        id: torre.id_torre,
        name: torre.letra,
        description: torre.descripcion || `Torre ${torre.letra}`,
        image: findBuildingImage(torre.id_torre), // Búsqueda dinámica de imagen
        createdAt: torre.createdAt,
        updatedAt: torre.updatedAt,
        address: `Torre ${torre.letra}`,
        totalFloors: totalFloors,
        totalApartments: totalApartments,
        totalResidents: totalResidents,
        // Mapear niveles como floors
        floors: (torre.niveles || []).map(nivel => {
          const totalApartmentsInFloor = (nivel.departamentos || []).length;
          const totalResidentsInFloor = (nivel.departamentos || []).reduce((total, dept) => total + (dept.companeros?.length || 0), 0);
          
          return {
            id: nivel.id_nivel,
            name: nivel.nombre || `Nivel ${nivel.numero}`,
            number: nivel.numero,
            buildingId: torre.id_torre,
            apartments: (nivel.departamentos || []).map(dept => dept.nombre),
            _count: {
              residents: totalResidentsInFloor,
              apartments: totalApartmentsInFloor
            }
          };
        }),
        _count: {
          residents: totalResidents,
          floors: totalFloors,
          apartments: totalApartments
        }
      };
    });

    console.log(`✅ Enviando ${mappedBuildings.length} torres mapeadas al frontend`);
    mappedBuildings.forEach((building, index) => {
      console.log(`  ${index + 1}. ${building.name} - Imagen: ${building.image || 'Sin imagen'}`);
    });
    
    res.json(mappedBuildings);
  } catch (error) {
    console.error('Error al obtener torres:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nueva torre
router.post('/', async (req, res) => {
  try {
    const { letra, nivel } = req.body;

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    if (!letra) {
      return res.status(400).json({ error: 'La letra de la torre es requerida' });
    }

    const torre = await prisma.torres.create({
      data: {
        letra,
        nivel: nivel || 'Nivel 1'
      }
    });

    res.status(201).json({
      message: 'Torre creada exitosamente',
      torre
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Ya existe una torre con esa letra' });
    }
    console.error('Error al crear torre:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear departamento en una torre
router.post('/:torreId/departamentos', async (req, res) => {
  try {
    const { torreId } = req.params;
    const { no_departamento } = req.body;

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    if (!no_departamento) {
      return res.status(400).json({ error: 'El número de departamento es requerido' });
    }

    // Verificar que la torre existe
    const torre = await prisma.torres.findUnique({
      where: { id_torre: torreId }
    });

    if (!torre) {
      return res.status(404).json({ error: 'Torre no encontrada' });
    }

    const departamento = await prisma.departamentos.create({
      data: {
        no_departamento,
        id_torre: torreId
      },
      include: {
        torre: true
      }
    });

    res.status(201).json({
      message: 'Departamento creado exitosamente',
      departamento
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Ya existe un departamento con ese número en esta torre' });
    }
    console.error('Error al crear departamento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener una torre específica por ID con detalles completos (DEBE IR ANTES de /:torreId/departamentos)
console.log('🔧 Registrando ruta GET /details/:id');
router.get('/details/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 GET /torres/details/${id} - Buscando torre específica`);
    console.log(`🔧 Endpoint /details/:id registrado y funcionando`);

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

    console.log(`✅ Torre ${torre.letra} encontrada, mapeando datos...`);

    // Mapear niveles en la nueva estructura esperada por SeleccionNivel
    const mappedBuilding = {
      id: torre.id_torre,
      name: torre.letra,
      description: torre.descripcion || `Torre Residencial ${torre.letra}`,
      address: `Torre ${torre.letra}`,
      // Mapear niveles (no floors para ser consistente con la nueva estructura)
      niveles: torre.niveles.map(nivel => ({
        id_nivel: nivel.id_nivel,
        numero_nivel: nivel.numero,
        descripcion: nivel.nombre || `Nivel ${nivel.numero}`,
        id_torre: torre.id_torre
      }))
    };

    console.log(`📤 Enviando datos de torre:`, {
      id: mappedBuilding.id,
      name: mappedBuilding.name,
      niveles_count: mappedBuilding.niveles.length
    });

    res.json(mappedBuilding);
  } catch (error) {
    console.error('Error al obtener torre:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener departamentos de una torre
router.get('/:torreId/departamentos', async (req, res) => {
  try {
    const { torreId } = req.params;

    const departamentos = await prisma.departamentos.findMany({
      where: { id_torre: torreId },
      include: {
        torre: true,
        companeros: true
      },
      orderBy: {
        no_departamento: 'asc'
      }
    });

    res.json(departamentos);
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar torre
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que es admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Verificar si tiene compañeros asignados
    const companeros = await prisma.companeros.findMany({
      where: {
        departamento: {
          id_torre: id
        }
      }
    });

    if (companeros.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la torre porque tiene compañeros asignados',
        companeros: companeros.length
      });
    }

    await prisma.torres.delete({
      where: { id_torre: id }
    });

    res.json({
      message: 'Torre eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar torre:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

console.log('✅ Rutas de torres cargadas exitosamente');

export { router as torresRoutes };
