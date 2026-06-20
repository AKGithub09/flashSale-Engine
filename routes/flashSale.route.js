import express from 'express';
import {createProduct, createOrder} from '../controllers/flashSale.controller.js';



const flashSaleRouter = express.Router();

flashSaleRouter.post('/products', createProduct);
flashSaleRouter.post('/orders', createOrder)


export default flashSaleRouter;