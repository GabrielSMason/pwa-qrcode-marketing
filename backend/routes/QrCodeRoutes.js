import express from "express";
import {
  cadastrarQrCode,
  listarQrCodes,
  verificarSorteado,
  marcarViuGanhador,
  verificarNaoSorteado,
  marcarViuNaoSorteado
} from "../controllers/QrCodeController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router
    .post("/qrcode", authMiddleware, cadastrarQrCode)
    .get("/qrcode", authMiddleware, listarQrCodes)
    .get("/qrcode/sorteado", authMiddleware, verificarSorteado)
    .patch("/qrcode/viu-ganhador", authMiddleware, marcarViuGanhador)
    .get("/qrcode/nao-sorteado", authMiddleware, verificarNaoSorteado)
    .patch("/qrcode/viu-nao-sorteado", authMiddleware, marcarViuNaoSorteado);

export default router;