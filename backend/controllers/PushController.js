import webpush from "web-push";
import chaves from "../chaves.json" with { type: "json" };
import User from "../models/User.js";

const SUBJECT = "mailto:gutohsmiranda@gmail.com";

webpush.setVapidDetails(SUBJECT, chaves.publicKey, chaves.privateKey);

export const salvarSubscription = async (req, res) => {
  try {
    const subscription = req.body;

    await User.findByIdAndUpdate(req.usuarioId, { subscription });

    res.status(201).json({ message: "Subscription salva com sucesso" });
  } catch (error) {
    res.status(500).json({ message: `${error.message} - Falha ao salvar subscription` });
  }
};

export const listarSubscriptions = async (req, res) => {
  try {
    const users = await User.find({ "subscription.endpoint": { $exists: true } });
    const subscriptions = users.map((u) => u.subscription);
    res.status(200).json({ subscriptions });
  } catch (error) {
    res.status(500).json({ message: `${error.message} - Falha ao listar subscriptions` });
  }
};