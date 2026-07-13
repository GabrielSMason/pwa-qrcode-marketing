import webpush from "web-push";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import User from "../models/User.js";
import QrCode from "../models/QrCode.js";
import Sorteio from "../models/Sorteio.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const chaves = JSON.parse(readFileSync(join(__dirname, "../chaves.json"), "utf-8"));
webpush.setVapidDetails("mailto:admin@admin.com", chaves.publicKey, chaves.privateKey);

export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find({ role: { $ne: "admin" } }).select("-password -subscription");
    const ids = usuarios.map((u) => u._id);

    const qrCodes = await QrCode.find({ owner: { $in: ids } });

    const resultado = usuarios.map((u) => ({
      _id: u._id,
      nome: u.nome,
      email: u.email,
      qrCodes: qrCodes.filter((q) => String(q.owner) === String(u._id)),
    }));

    res.status(200).json({ usuarios: resultado });
  } catch (error) {
    res.status(500).json({ message: `${error.message} - Falha ao listar usuários` });
  }
};

export const sortearQrCodeAdmin = async (req, res) => {
  try {
    const disponiveis = await QrCode.find({ sorteado: false });
    if (disponiveis.length === 0) {
      return res.status(404).json({ message: "Nenhum QR-Code disponível para sortear" });
    }

    const qrCode = disponiveis[Math.floor(Math.random() * disponiveis.length)];

    qrCode.sorteado = true;
    await qrCode.save();

    const sorteio = await Sorteio.create({ codigoSorteado: qrCode.codigo });

    const dono = await User.findById(qrCode.owner);
    let notificado = false;

    if (dono?.subscription?.endpoint) {
      const payload = JSON.stringify({
        title: "Promoção Biscoitos",
        body: "Parabéns! Você foi sorteado na promoção dos produtos, entre em contato para receber seu prêmio!",
      });
      try {
        await webpush.sendNotification(dono.subscription, payload);
        notificado = true;
      } catch (e) {
        console.error("Erro ao enviar push ao ganhador:", e.message);
      }
    }

    const dataFormatada = new Date(sorteio.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    const payloadNaoSorteado = JSON.stringify({
      title: "Promoção Biscoitos",
      body: `O sorteio do dia ${dataFormatada} aconteceu e você não foi sorteado!`,
    });

    const outrosUsuarios = await User.find({
      _id: { $ne: qrCode.owner },
      "subscription.endpoint": { $exists: true },
      role: { $ne: "admin" },
    });

    for (const usuario of outrosUsuarios) {
      try {
        await webpush.sendNotification(usuario.subscription, payloadNaoSorteado);
      } catch (e) {
        console.error(`Erro ao notificar ${usuario.email}:`, e.message);
      }
    }

    res.status(200).json({
      message: "QR-Code sorteado com sucesso",
      codigo: qrCode.codigo,
      dono: dono?.nome,
      notificado,
    });
  } catch (error) {
    res.status(500).json({ message: `${error.message} - Falha ao sortear` });
  }
};

export const notificarQrCodeAdmin = async (req, res) => {
  try {
    const { codigo } = req.params;
    const qrCode = await QrCode.findOne({ codigo });

    if (!qrCode) {
      return res.status(404).json({ message: "QR-Code não encontrado" });
    }

    qrCode.sorteado = true;
    await qrCode.save();

    const sorteio = await Sorteio.create({ codigoSorteado: qrCode.codigo });

    const dono = await User.findById(qrCode.owner);
    let notificado = false;

    if (dono?.subscription?.endpoint) {
      const payload = JSON.stringify({
        title: "Promoção Biscoitos",
        body: req.body.mensagem || "Parabéns! Você foi sorteado na promoção dos produtos!",
      });
      try {
        await webpush.sendNotification(dono.subscription, payload);
        notificado = true;
      } catch (e) {
        console.error("Erro ao enviar push ao ganhador:", e.message);
      }
    }

    const dataFormatada = new Date(sorteio.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    const payloadNaoSorteado = JSON.stringify({
      title: "Promoção Biscoitos",
      body: `O sorteio do dia ${dataFormatada} aconteceu e você não foi sorteado!`,
    });

    const outrosUsuarios = await User.find({
      _id: { $ne: qrCode.owner },
      "subscription.endpoint": { $exists: true },
      role: { $ne: "admin" },
    });

    for (const usuario of outrosUsuarios) {
      try {
        await webpush.sendNotification(usuario.subscription, payloadNaoSorteado);
      } catch (e) {
        console.error(`Erro ao notificar ${usuario.email}:`, e.message);
      }
    }

    res.status(200).json({
      message: "QR-Code notificado com sucesso",
      codigo: qrCode.codigo,
      dono: dono?.nome,
      notificado,
    });
  } catch (error) {
    res.status(500).json({ message: `${error.message} - Falha ao notificar` });
  }
};
