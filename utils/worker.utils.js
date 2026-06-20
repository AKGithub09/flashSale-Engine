import { Worker } from "bullmq";
import {Product, Order} from "../models/flashSale.models.js";
import {REDIS_URI} from "../config/envConfig.js"


const startWorkOrder = () => {
  const worker = new Worker(
    'order-queue',
    async(job) => {
      const {userId, productId} = job.data;
      console.log(`Order is processing for ${userId}, worker picked up ${job.id}`);

      await Product.findByIdAndUpdate(productId, {
        $inc: {stock: -1}
      });

      const order = new Order({userId, productId, status: 'completed'});
      await order.save();
      console.log(`Job with ${job.id} is completed, saved to mongoDB`)
    },
    {
      connection: {
        url: REDIS_URI || 'redis://127.0.0.1:6379'
      }
    }
  );

  worker.on('failed', (job, err) => {
       console.error(`Job ${job.id} failed. Error Message: ${err.message}`)
    }
  );  
};

export default startWorkOrder;