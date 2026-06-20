import { app } from "./app.js";
import { PORT } from "./config/envConfig.js";
import connectDb from "./db/mongodb.js";
import startWorkOrder from "./utils/worker.utils.js";

const server = async () => {
  try{
    await connectDb();
    console.log('Database connected');

    startWorkOrder();
    console.log('Worker started');


    app.listen(PORT, () => {
      console.log(`server is running on ${PORT}`)
    }
)
    
  }catch(err){
    console.error('Database disconnected', err);
    process.exit(1);
  }
    
}

server();