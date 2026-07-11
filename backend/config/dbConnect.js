import mongoose from "mongoose";

async function conectaDataBase() {
  mongoose.connect("mongodb://localhost:27017/promo-biscoitos");
  return mongoose.connection;
}

export default conectaDataBase;