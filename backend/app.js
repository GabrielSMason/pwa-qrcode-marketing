import "dotenv/config";
import express from "express";
import cors from "cors";
import conectaDataBase from "./config/dbConnect.js";
import routes from "./routes/index.js";

const conexao = await conectaDataBase();

conexao.on("error", (erro) => {
    console.error("Erro de conexão", erro);
});

conexao.once("open", () => {
    console.log("Conexão com banco de dados feita com sucesso");
});

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

routes(app);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});