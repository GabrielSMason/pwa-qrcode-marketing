import mongoose from "mongoose";

const sorteioSchema = new mongoose.Schema({
  codigoSorteado: { type: String, required: true },
  data: { type: Date, default: Date.now }
});

const Sorteio = mongoose.model("sorteios", sorteioSchema);

export default Sorteio;
