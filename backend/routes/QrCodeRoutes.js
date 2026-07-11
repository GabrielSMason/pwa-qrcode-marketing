import express from "express";
import {
  cadastrarQrCode,
  listarQrCodes,
  verificarSorteado,
  sortearQrCode
} from "../controllers/QrCodeController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router
    .post("/qrcode", authMiddleware, cadastrarQrCode)
    .get("/qrcode", authMiddleware, listarQrCodes)
    .get("/qrcode/sorteado", authMiddleware, verificarSorteado)
    .post("/qrcode/:codigo/sortear", sortearQrCode);

export default router;