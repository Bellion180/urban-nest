# 🏢 Urban Nest - Sistema de Gestión Residencial

Un sistema completo de gestión para edificios residenciales construido con React, Node.js, Prisma y MySQL.

## ✨ Características

- 🔐 **Autenticación segura** con JWT
- 👥 **Gestión de usuarios** (Admin, Usuario, Residente)
- 🏢 **Administración de edificios** y residentes
- 💰 **Sistema de pagos** y cuotas
- 📱 **Interfaz responsive** con Tailwind CSS
- 🎨 **Componentes UI** con shadcn/ui
- 🐳 **Dockerizado** para fácil desarrollo

## 🚀 Configuración Rápida

### Prerrequisitos

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [Docker](https://www.docker.com/) y Docker Compose
- [Git](https://git-scm.com/)

### 🎯 Instalación en Un Solo Comando

```bash
git clone https://github.com/Lechugin-bot/urban-nest.git
cd urban-nest
npm run setup
```

### 📝 Instalación Paso a Paso

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Lechugin-bot/urban-nest.git
   cd urban-nest
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar la base de datos**
   ```bash
   # Iniciar contenedor MySQL
   npm run docker:up
   
   # Configurar Prisma y poblar datos
   npm run db:setup
   ```

4. **Iniciar la aplicación**
   ```bash
   # Opción 1: Frontend y Backend juntos
   npm run dev:full
   
   # Opción 2: Por separado
   npm run server    # Backend en puerto 3001
   npm run dev       # Frontend en puerto 8080+
   ```

## 👤 Usuarios de Prueba

Una vez configurada la base de datos, puedes usar estas credenciales:

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@urbannest.com | admin123 | Admin |
| user@urbannest.com | user123 | Usuario |
| resident@urbannest.com | resident123 | Residente |

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar frontend (Vite)
npm run server          # Iniciar backend
npm run dev:full        # Iniciar frontend y backend juntos

# Base de datos
npm run docker:up       # Iniciar MySQL en Docker
npm run docker:down     # Detener contenedores Docker
npm run db:setup        # Configurar Prisma + poblar datos
npm run db:seed         # Solo poblar datos de prueba
npm run db:reset        # Resetear y reconfigurar DB
npm run db:studio       # Abrir Prisma Studio

# Configuración completa
npm run setup           # Instalación completa automática

# Construcción
npm run build           # Construir para producción
npm run preview         # Previsualizar build
```

## 🏗️ Arquitectura del Proyecto

```
urban-nest/
├── src/                    # Frontend React
│   ├── components/         # Componentes React
│   ├── pages/             # Páginas de la aplicación
│   ├── contexts/          # Context API (Auth)
│   ├── services/          # API calls
│   └── types/             # TypeScript types
├── server/                # Backend Node.js
│   ├── routes/            # Rutas API
│   ├── middleware/        # Middleware de Express
│   └── index.js          # Servidor principal
├── prisma/               # Base de datos
│   ├── schema.prisma     # Esquema de la DB
│   └── migrations/       # Migraciones
├── docker/               # Configuración Docker
└── seed-users.js         # Script de datos de prueba
```

## 🔗 URLs de la Aplicación

- **Frontend**: http://localhost:8080+ (puerto asignado por Vite)
- **Backend API**: http://localhost:3001
- **Prisma Studio**: http://localhost:5555 (ejecutar `npm run db:studio`)

## 🔐 Autenticación

El sistema utiliza JWT para autenticación. Todos los endpoints de la API requieren autenticación excepto:
- `POST /api/auth/login`
- `GET /api/health`

## 🎯 Uso de la Aplicación

1. **Iniciar sesión** con cualquier usuario de prueba
2. **Navegar** por las diferentes secciones según tu rol
3. **Gestionar** edificios, residentes y pagos (solo Admin)
4. **Ver información** personal y financiera (Residentes)

## 🐛 Solución de Problemas

### Base de datos no conecta
```bash
npm run docker:down
npm run docker:up
npm run db:setup
```

### Puerto ocupado
```bash
# Cambiar puerto en vite.config.ts o server/index.js
# O terminar procesos:
npx kill-port 3001
npx kill-port 8080
```

### Dependencias desactualizadas
```bash
npm update
npm run setup
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Soporte

¿Tienes problemas? Contacta al equipo de desarrollo o crea un issue en GitHub.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.
