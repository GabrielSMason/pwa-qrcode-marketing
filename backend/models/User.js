import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    subscription: {
        endpoint: { type: String },
        expirationTime: { type: Date, default: null },
    keys: {
        p256dh: { type: String },
        auth: { type: String }
    }
  }
});

const User = mongoose.model("users", userSchema);

export default User;