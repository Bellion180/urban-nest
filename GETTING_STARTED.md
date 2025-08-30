# 🏢 Urban Nest - Guía de Inicio Rápido

## 📋 Requisitos Previos

1. **Node.js** (versión 16 o superior)
2. **MySQL** (una de estas opciones):
   - MySQL Server local
   - XAMPP
   - Docker

## 🚀 Configuración Inicial

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Base de Datos

#### Opción A: XAMPP (Más fácil)
1. Descarga e instala XAMPP
2. Inicia Apache y MySQL desde el panel de control
3. Ve a http://localhost/phpmyadmin
4. Crea una base de datos llamada `urban_nest_db`

#### Opción B: Docker (Recomendado)
```bash
docker run --name urban-nest-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=urban_nest_db \
  -e MYSQL_USER=urban_nest_user \
  -e MYSQL_PASSWORD=urban_nest_password \
  -p 3306:3306 -d mysql:8.0
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
# Para XAMPP
DATABASE_URL="mysql://root:@localhost:3306/urban_nest_db"

# Para Docker
DATABASE_URL="mysql://urban_nest_user:urban_nest_password@localhost:3306/urban_nest_db"

# Configuración del servidor
JWT_SECRET="tu_jwt_secret_super_seguro_aqui"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760
```

### 4. Configurar Base de Datos
```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init
```

## 🏃‍♂️ Ejecutar la Aplicación

### Ejecutar Frontend y Backend juntos
```bash
npm run dev:full
```

### O ejecutar por separado

#### Frontend (Puerto 5173)
```bash
npm run dev
```

#### Backend (Puerto 3001)
```bash
npm run server
```

## 👤 Usuario de Prueba

### Crear Usuario Admin
Una vez que el backend esté corriendo, puedes crear un usuario admin desde el frontend o usar esta consulta SQL:

```sql
INSERT INTO User (email, password, nombre, apellido, role) 
VALUES ('admin@urban-nest.com', '$2b$10$hashedPassword', 'Admin', 'Principal', 'ADMIN');
```

### Credenciales de Prueba
- **Email:** admin@urban-nest.com
- **Contraseña:** admin123

## 🛠️ Comandos Útiles

```bash
# Ver la base de datos en el navegador
npx prisma studio

# Reiniciar la base de datos
npx prisma migrate reset

# Ver logs del servidor
npm run server

# Construir para producción
npm run build
```

## 🏗️ Estructura del Proyecto

```
urban-nest/
├── server/              # Backend Express.js
│   ├── routes/         # Rutas de la API
│   ├── middleware/     # Middlewares
│   └── index.js        # Servidor principal
├── src/                # Frontend React
│   ├── components/     # Componentes React
│   ├── services/       # Servicios de API
│   ├── contexts/       # Contextos React
│   └── pages/          # Páginas
├── prisma/             # Esquemas de DB
├── .env                # Variables backend
├── .env.local          # Variables frontend
└── package.json        # Dependencias
```

## 🌐 URLs de la Aplicación

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api
- **Prisma Studio:** http://localhost:5555
- **Health Check:** http://localhost:3001/api/health

## 🔧 Solución de Problemas

### Error de conexión a MySQL
- Verifica que MySQL esté corriendo en el puerto 3306
- Revisa las credenciales en el archivo `.env`
- Asegúrate de que la base de datos `urban_nest_db` existe

### Error "Cannot reach database server"
```bash
# Verificar estado de MySQL
# Para Docker:
docker ps

# Para XAMPP:
# Ve al panel de control y verifica que MySQL esté verde
```

### Error "JWT must be provided"
- Asegúrate de tener el `JWT_SECRET` en tu archivo `.env`
- Verifica que el backend esté corriendo

## 📱 Funcionalidades Disponibles

✅ **Autenticación** - Login/logout con JWT
✅ **Gestión de Residentes** - CRUD completo con fotos
✅ **Gestión de Edificios** - Administración de edificios, pisos y apartamentos
✅ **Sistema de Pagos** - Registro y seguimiento de pagos
✅ **Panel Administrativo** - Dashboard para admins
✅ **Interfaz Responsiva** - Optimizada para móviles y desktop

## 🆘 Soporte

Si tienes problemas:
1. Verifica que todas las dependencias estén instaladas
2. Asegúrate de que MySQL esté corriendo
3. Revisa los logs del servidor y del frontend
4. Verifica las variables de entorno
