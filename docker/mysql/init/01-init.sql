-- Script de inicialización de MySQL para Urban Nest
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor por primera vez

-- Verificar que la base de datos se creó correctamente
USE urban_nest_db;

-- Opcional: Puedes agregar aquí datos iniciales o configuraciones adicionales
-- Por ejemplo:
-- INSERT INTO users (name, email) VALUES ('Admin', 'admin@urbannest.com');

SELECT 'Base de datos urban_nest_db inicializada correctamente' as message;
