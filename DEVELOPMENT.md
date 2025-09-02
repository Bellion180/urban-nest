# 📝 Notas de Desarrollo - Urban Nest

## 🏗️ Arquitectura del Sistema

### Frontend (React + Vite)
- **Puerto**: Dinámico (8080+) asignado por Vite
- **Framework**: React 18 con TypeScript
- **UI**: Tailwind CSS + shadcn/ui components
- **Estado**: Context API para autenticación
- **Routing**: React Router v6

### Backend (Node.js + Express)
- **Puerto**: 3001 (configurable)
- **ORM**: Prisma con MySQL
- **Auth**: JWT tokens
- **Middleware**: CORS, body-parser, auth middleware

### Base de Datos (MySQL + Docker)
- **Puerto**: 3306
- **Usuario**: urban_nest_user
- **Contraseña**: urban_nest_password
- **Base**: urban_nest_db

## 🚀 Comandos de Desarrollo

```bash
# Configuración inicial completa
npm run setup

# Desarrollo separado
npm run server        # Backend en :3001
npm run dev          # Frontend en :8080+

# Desarrollo conjunto
npm run dev:full     # Ambos servidores

# Base de datos
npm run docker:up    # Iniciar MySQL
npm run docker:down  # Detener Docker
npm run db:setup     # Configurar + poblar
npm run db:seed      # Solo poblar datos
npm run db:reset     # Resetear completamente
npm run db:studio    # Prisma Studio en :5555
```

## 🔧 Configuración de Entorno

### Variables de Entorno (.env)
```bash
DATABASE_URL="mysql://urban_nest_user:urban_nest_password@localhost:3306/urban_nest_db"
JWT_SECRET="tu_jwt_secret_super_seguro"
PORT=3001
NODE_ENV=development
```

### Docker Compose
- MySQL 8.0 con persistencia de datos
- Configuración automática de usuario y base de datos
- Puerto expuesto: 3306

## 📊 Estructura de Base de Datos

### Tablas Principales
- **User**: Usuarios del sistema (Admin, User, Resident)
- **Building**: Edificios gestionados
- **Floor**: Pisos de cada edificio
- **Resident**: Información de residentes
- **Payment**: Registros de pagos

### Roles de Usuario
- **ADMIN**: Acceso completo al sistema
- **USER**: Gestión de edificios asignados
- **RESIDENT**: Solo vista de información personal

## 🔐 Sistema de Autenticación

### Flujo de Login
1. Usuario envía credenciales a `/api/auth/login`
2. Backend valida contra base de datos
3. Se genera JWT con información del usuario
4. Frontend almacena token en localStorage
5. Requests posteriores incluyen token en Authorization header

### Rutas Protegidas
- Middleware `authenticateToken` verifica JWT
- Rutas públicas: `/api/auth/login`, `/api/health`
- Todas las demás rutas requieren autenticación

## 🎨 Componentes UI

### shadcn/ui Components
- Button, Card, Input, Dialog, etc.
- Configurados en `components.json`
- Estilos base en Tailwind CSS

### Componentes Personalizados
- **Header**: Navegación principal
- **ProtectedRoute**: Wrapper para rutas autenticadas
- **Dashboard**: Panel principal por rol
- **ModaleDetalles**: Vistas de información detallada

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Componentes Móviles
- Navegación hamburger
- Cards adaptables
- Formularios responsivos

## 🔍 Debugging y Logs

### Backend Logs
```bash
# Ver logs del servidor
node server/index.js

# Logs de base de datos
npx prisma studio
```

### Frontend Debug
```bash
# Consola del navegador
console.log disponible en desarrollo

# React DevTools
Extensión recomendada para debugging
```

## 🚨 Solución de Problemas Comunes

### Error: Base de datos no conecta
```bash
# Verificar Docker
docker ps

# Reiniciar servicios
npm run docker:down
npm run docker:up
npm run db:setup
```

### Error: Puerto ocupado
```bash
# Backend (3001)
npx kill-port 3001

# Frontend (vía Vite)
# Se asigna automáticamente otro puerto
```

### Error: JWT inválido
```bash
# Limpiar localStorage
localStorage.clear()

# Verificar JWT_SECRET en .env
```

### Error: Prisma Client
```bash
# Regenerar cliente
npx prisma generate

# Sincronizar schema
npx prisma db push
```

## 📦 Dependencias Importantes

### Backend
- express: Framework web
- prisma: ORM
- bcryptjs: Hash de contraseñas
- jsonwebtoken: Autenticación JWT
- cors: Cross-origin requests

### Frontend
- react: Librería UI
- react-router-dom: Routing
- axios: HTTP client
- tailwindcss: Estilos CSS
- shadcn/ui: Componentes UI

## 🔄 Flujo de Trabajo Git

### Branches
- **main**: Código estable
- **develop**: Desarrollo activo
- **feature/**: Nuevas características

### Commits
- Usar commits descriptivos
- Formato: `tipo: descripción`
- Ejemplo: `feat: agregar sistema de pagos`

## 📈 Mejoras Futuras

### Funcionalidades Pendientes
- [ ] Sistema de notificaciones
- [ ] Reportes avanzados
- [ ] Integración de pagos
- [ ] App móvil nativa
- [ ] Dashboard analítico

### Optimizaciones Técnicas
- [ ] Cache con Redis
- [ ] Tests automatizados
- [ ] CI/CD pipeline
- [ ] Monitoreo de errores
- [ ] Optimización de imágenes

## 🔗 Enlaces Útiles

- [Prisma Docs](https://www.prisma.io/docs/)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Docs](https://react.dev/)
- [Express Docs](https://expressjs.com/)
