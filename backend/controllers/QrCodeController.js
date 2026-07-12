import QrCode from "../models/QrCode.js";
import User from "../models/User.js";
import Sorteio from "../models/Sorteio.js";

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
    const sorteado = await QrCode.findOne({ owner: req.usuarioId, sorteado: true, viuTelaGanhador: false });
    res.status(200).json({ ganhou: !!sorteado, qrCode: sorteado || null });
  } catch (error) {
    res.status(500).json({ message: `${error.message} - Falha ao verificar sorteio` });
  }
};

export const verificarNaoSorteado = async (req, res) => {
  try {
    const usuario = await User.findById(req.usuarioId);
    const ganhou = await QrCode.findOne({ owner: req.usuarioId, sorteado: true });
    if (ganhou) return res.status(200).json({ temSorteio: false });

    const filtro = usuario.ultimoSorteioVisto
      ? { data: { $gt: usuario.ultimoSorteioVisto } }
      : {};

    const sorteio = await Sorteio.findOne(filtro).sort({ data: -1 });
    if (!sorteio) return res.status(200).json({ temSorteio: false });

    const dataFormatada = new Date(sorteio.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    res.status(200).json({ temSorteio: true, data: dataFormatada });
  } catch (error) {
    res.status(500).json({ message: `${error.message} - Falha ao verificar sorteio` });
  }
};

export const marcarViuNaoSorteado = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.usuarioId, { ultimoSorteioVisto: new Date() });
    res.status(200).json({ message: "Marcado como visto" });
  } catch (error) {
    res.status(500).json({ message: `${error.message} - Falha ao marcar` });
  }
};

export const marcarViuGanhador = async (req, res) => {
  try {
    await QrCode.updateMany({ owner: req.usuarioId, sorteado: true }, { viuTelaGanhador: true });
    res.status(200).json({ message: "Marcado como visto" });
  } catch (error) {
    res.status(500).json({ message: `${error.message} - Falha ao marcar` });
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