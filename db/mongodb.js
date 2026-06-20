import mongoose from "mongoose";
import { MONGO_URI } from "../config/envConfig.js";


const connectDb = async () => {
  try{
    const connect = await mongoose.connect(MONGO_URI);
    console.log('MongoDb connected');
  }catch(err){
    console.error("MongoDb connection error", err)
    process.exit(1);
  }
}

export default connectDb;