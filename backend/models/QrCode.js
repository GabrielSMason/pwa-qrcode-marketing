import mongoose from "mongoose";

const qrCodeSchema = new mongoose.Schema({
    codigo: { type: String, required: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    sorteado: { type: Boolean, default: false },
    viuTelaGanhador: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const QrCode = mongoose.model("qrcodes", qrCodeSchema);

export default QrCode;