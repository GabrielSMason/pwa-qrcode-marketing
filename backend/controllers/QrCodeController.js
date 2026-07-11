import QrCode from "../models/QrCode.js";
import User from "../models/User.js";

export const cadastrarQrCode = async (req, res) => {
  try {
    const { codigo } = req.body;

    if (!codigo) {
      return res.status(400).json({ message: "Código do QR-Code é obrigatório" });
    }

    const jaExiste = await QrCode.findOne({ codigo });
    if (jaExiste) {
      return res.status(409).json({ message: "Este QR-Code já foi cadastrado" });
    }

    const novoQrCode = await QrCode.create({
      codigo,
      owner: req.usuarioId
    });

    res.status(201).json({ message: "QR-Code cadastrado com sucesso", qrCode: novoQrCode });
  } catch (error) {
    res.status(500).json({ message: `${error.message} - Falha ao cadastrar QR-Code` });
  }
};

export const listarQrCodes = async (req, res) => {
  try {
    const qrCodes = await QrCode.find({ owner: req.usuarioId });
    res.status(200).json({ qrCodes });
  } catch (error) {
    res.status(500).json({ message: `${error.message} - Falha ao listar QR-Codes` });
  }
};

export const verificarSorteado = async (req, res) => {
  try {
    const sorteado = await QrCode.findOne({ owner: req.usuarioId, sorteado: true });
    res.status(200).json({ ganhou: !!sorteado, qrCode: sorteado || null });
  } catch (error) {
    res.status(500).json({ message: `${error.message} - Falha ao verificar sorteio` });
  }
};

export const sortearQrCode = async (req, res) => {
  try {
    const { codigo } = req.params;

    const qrCode = await QrCode.findOne({ codigo });
    if (!qrCode) {
      return res.status(404).json({ message: "QR-Code não encontrado" });
    }

    qrCode.sorteado = true;
    await qrCode.save();

    const dono = await User.findById(qrCode.owner);

    res.status(200).json({
      message: "QR-Code marcado como sorteado",
      qrCode,
      subscription: dono?.subscription?.endpoint ? dono.subscription : null
    });
  } catch (error) {
    res.status(500).json({ message: `${error.message} - Falha ao sortear QR-Code` });
  }
};