import mongoose from "mongoose";
import { Product } from "../models/flashSale.models.js";
import { Queue } from 'bullmq'
import redis from "../db/redis.js";
import {REDIS_URI} from "../config/envConfig.js"


const orderQueue = new Queue('order-queue', 
  {
    connection: {
      url: REDIS_URI || 'redis://127.0.0.1:6379'
    } 
  });



const createProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try{

    const {name, price, stock} = req.body;
    const product = new Product({name, price, stock});
    await product.save({session});

    //redis data
    await redis.setex(`stock:${product._id}`, 3600, stock)
    console.log(`Product created in DB & Redis Cache: ${product.name}`);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({success: true,product});
    console.log(`Product created ${product.name}`)

  }catch(err){
    res.status(400).json({success: false, error: err.message})
    await session.abortTransaction();
    session.endSession();
  }
};


const createOrder = async (req, res) => {
  
  const {userId, productId} = req.body;
  const redisStockKey = `stock:${productId}`;

  try{
    //waits if the stock is decremented
    const remainingRedisStock = await redis.decr(redisStockKey);
    //if the stock is < 0
    if(remainingRedisStock < 0){
      await redis.incr(redisStockKey);
      return res.status(400).send({
        success: false,
        error: 'Product out of stock, will notify when the stock comes up'
      })
    }

    const job = await orderQueue.add('processOrder', {userId, productId});
    return res.status(201).json(
      {
        success: true,
        message: 'Order request accepted, processing in queue',
        orderId: job.id,
        remainingStock: remainingRedisStock,
      }
    );

  }catch(err){
    console.error('Order engine failed',err);
    return res.status(500).json(
      {
        success:false, 
        error: err.message
      }
    );
  }
}

export {createProduct, createOrder};