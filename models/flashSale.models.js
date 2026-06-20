import mongoose, { Schema } from "mongoose";

const productionSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min:[0, 'Stock cannot be negetive']
  },
  
}, {timestamps: true})

const orderSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product'
  },
  userId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },

})

export const Product = mongoose.model('Product', productionSchema);
export const Order = mongoose.model('Order', orderSchema);