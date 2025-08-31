# Urban Nest - Configuración de Base de Datos

## Instalación de MySQL

### Opción 1: MySQL Server Local
1. Descarga MySQL Server desde: https://dev.mysql.com/downloads/mysql/
2. Instala MySQL con configuración por defecto (puerto 3306)
3. Crear la base de datos:
   ```sql
   CREATE DATABASE urban_nest_db;
   CREATE USER 'urban_nest_user'@'localhost' IDENTIFIED BY 'urban_nest_password';
   GRANT ALL PRIVILEGES ON urban_nest_db.* TO 'urban_nest_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Opción 2: XAMPP (Más fácil para desarrollo)
1. Descarga XAMPP desde: https://www.apachefriends.org/download.html
2. Instala XAMPP
3. Inicia Apache y MySQL desde el panel de control de XAMPP
4. Ve a http://localhost/phpmyadmin
5. Crea una nueva base de datos llamada "urban_nest_db"

### Opción 3: Docker (Recomendado)

**Usando Docker Compose (Recomendado)**:
```bash
# Iniciar MySQL en Docker
npm run docker:up

# Verificar que el contenedor está corriendo
docker ps
```

**Comando manual de Docker**:
```bash
# Crear contenedor MySQL
docker run --name urban-nest-mysql -e MYSQL_ROOT_PASSWORD=c -e MYSQL_DATABASE=urban_nest_db -e MYSQL_USER=urban_nest_user -e MYSQL_PASSWORD=urban_nest_password -p 3306:3306 -d mysql:8.0

# Verificar que el contenedor está corriendo
docker ps
```

## Configuración de Variables de Entorno

Actualiza el archivo `.env` con los datos correctos de tu base de datos:

```env
# Si usas instalación local o XAMPP
DATABASE_URL="mysql://root:tu_password@localhost:3306/urban_nest_db"

# Si usas Docker
DATABASE_URL="mysql://urban_nest_user:urban_nest_password@localhost:3306/urban_nest_db"
```

## Comandos para ejecutar después de tener MySQL corriendo

```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init

# Opcional: Ver la base de datos con Prisma Studio
npx prisma studio

# Iniciar el servidor backend
npm run server
```

## Comandos de desarrollo

Agrega estos scripts a tu package.json:

```json
{
  "scripts": {
    "dev": "vite",
    "server": "node server/index.js",
    "dev:full": "concurrently \"npm run server\" \"npm run dev\"",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

## Verificación

1. Asegúrate de que MySQL esté corriendo en el puerto 3306
2. Verifica que puedes conectarte a la base de datos
3. Ejecuta las migraciones de Prisma
4. Inicia el servidor backend
5. Inicia el frontend en modo desarrollo

## Estructura final

```
urban-nest/
├── server/          # Backend Express.js
├── src/             # Frontend React
├── prisma/          # Esquemas y migraciones de DB
├── .env             # Variables de entorno
└── package.json     # Dependencias
```
