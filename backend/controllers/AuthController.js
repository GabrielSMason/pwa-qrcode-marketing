import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const registrar = async (req, res) => {
  try {
    const { nome, email, password } = req.body;

    const jaExiste = await User.findOne({ email });
    if (jaExiste) {
      return res.status(409).json({ message: "Este e-mail já está cadastrado" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const novoUsuario = await User.create({
      nome,
      email,
      password: passwordHash
    });
    res.status(201).json({ message: "Usuário criado com sucesso", user: novoUsuario });
  } catch (erro) {
    res.status(500).json({ message: `${erro.message} - Falha ao cadastrar usuário` });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }
    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) {
      return res.status(401).json({ message: "Senha incorreta" });
    }
    const token = jwt.sign({ id: usuario._id, role: usuario.role }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });
    return res.status(200).json({ message: "Login com sucesso", token, role: usuario.role, nome: usuario.nome });
  } catch (error) {
    res.status(500).json({ message: "Erro na hora de logar." });
  }
};

export default { registrar, login };