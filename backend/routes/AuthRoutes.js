import express from "express";
import AuthController from "../controllers/AuthController.js";

const router = express.Router();

router
    .post("/registrar", AuthController.registrar)
    .post("/login", AuthController.login);

export default router;