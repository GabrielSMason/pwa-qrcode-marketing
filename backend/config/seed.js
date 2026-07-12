import bcrypt from "bcryptjs";
import User from "../models/User.js";

export async function seed() {
  const jaExiste = await User.findOne({ email: "admin@admin.com" });
  if (jaExiste) return;

  const passwordHash = await bcrypt.hash("123456", 10);
  await User.create({ nome: "Admin", email: "admin@admin.com", password: passwordHash, role: "admin" });
  console.log("Admin padrão criado: admin@admin.com / 123456");
}
