# 🐳 Docker Setup para Urban Nest

## Comandos Disponibles

### Gestión del contenedor MySQL

```bash
# Iniciar MySQL en Docker
npm run docker:up

# Detener MySQL
npm run docker:down

# Reiniciar MySQL
npm run docker:restart

# Ver logs de MySQL
npm run docker:logs

# Setup completo (Docker + Prisma)
npm run db:setup
```

### Comandos Docker directos

```bash
# Iniciar contenedor
docker-compose up -d

# Detener contenedor
docker-compose down

# Ver logs
docker-compose logs -f mysql

# Conectarse al contenedor MySQL
docker exec -it urban-nest-mysql mysql -u urban_nest_user -p
```

## Configuración Inicial

1. **Crear archivo .env**:
   ```bash
   cp .env.example .env
   ```

2. **Iniciar MySQL con Docker**:
   ```bash
   npm run docker:up
   ```

3. **Configurar Prisma**:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Iniciar la aplicación**:
   ```bash
   npm run dev:full
   ```

## Estructura del Docker Compose

- **Imagen**: MySQL 8.0
- **Puerto**: 3306 (local) → 3306 (contenedor)
- **Base de datos**: `urban_nest_db`
- **Usuario**: `urban_nest_user`
- **Contraseña**: `urban_nest_password`
- **Contraseña root**: `c`
- **Volumen**: Los datos persisten entre reinicios
- **Red**: `urban-nest-network`

## Verificación

Para verificar que todo funciona:

```bash
# 1. Verificar que el contenedor está corriendo
docker ps

# 2. Probar conexión a MySQL
docker exec -it urban-nest-mysql mysql -u urban_nest_user -p

# 3. Verificar el servidor backend
curl http://localhost:3001/api/health
```

## Solución de Problemas

### Puerto 3306 ocupado
```bash
# Ver qué proceso usa el puerto 3306
netstat -ano | findstr :3306

# Detener otros servicios MySQL
# O cambiar el puerto en docker-compose.yml
```

### Problemas de permisos
```bash
# Limpiar volúmenes y reiniciar
docker-compose down -v
docker-compose up -d
```

### Resetear completamente la base de datos
```bash
# Detener y eliminar todo
docker-compose down -v
docker volume rm urban-nest_mysql_data

# Reiniciar
npm run docker:up
npm run prisma:migrate
```
