// Middleware de autenticación temporal - implementar JWT después
export const authMiddleware = (req, res, next) => {
  // Por ahora, permitir todas las requests sin autenticación
  // TODO: Implementar verificación de JWT
  next();
};

export default authMiddleware;
