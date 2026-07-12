import "dotenv/config";
import bcrypt from "bcryptjs";
import conectaDataBase from "./config/dbConnect.js";
import User from "./models/User.js";

const [,, nome, email, password] = process.argv;

if (!nome || !email || !password) {
  console.log('Uso: node cria_admin.js "Nome" email@exemplo.com senha123');
  process.exit(1);
}

await conectaDataBase();

const jaExiste = await User.findOne({ email });
if (jaExiste) {
  console.log(`Usuário com email "${email}" já existe.`);
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 10);
const admin = await User.create({ nome, email, password: passwordHash, role: "admin" });

console.log(`Admin criado com sucesso!`);
console.log(`  Nome:  ${admin.nome}`);
console.log(`  Email: ${admin.email}`);
console.log(`  Role:  ${admin.role}`);
process.exit(0);
