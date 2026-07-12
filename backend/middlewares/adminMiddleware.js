import jwt from "jsonwebtoken";
import User from "../models/User.js";

const adminMiddleware = async (req, res, next) => {
  const autorizacao = req.headers.authorization;
  if (!autorizacao) {
    return res.status(401).json({ message: "Autorização não concedida" });
  }
  const tokenExtraido = autorizacao.split(" ")[1];
  try {
    const payload = jwt.verify(tokenExtraido, process.env.JWT_SECRET);
    const usuario = await User.findById(payload.id);
    if (!usuario || usuario.role !== "admin") {
      return res.status(403).json({ message: "Acesso restrito a administradores" });
    }
    req.usuarioId = payload.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: `Token inválido ou expirado: ${error.message}` });
  }
};

export default adminMiddleware;
