import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const autorizacao = req.headers.authorization;
  if (!autorizacao) {
    return res.status(401).json({ message: "Autorização não concedida" });
  }
  const tokenExtraido = autorizacao.split(" ")[1];
  try {
    const payload = jwt.verify(tokenExtraido, process.env.JWT_SECRET);
    req.usuarioId = payload.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: `Token inválido ou expirado: ${error.message}` });
  }
};

export default authMiddleware;