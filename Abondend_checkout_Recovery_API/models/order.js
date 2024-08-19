import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  email: String,
  orderDetails: String,
  timestamp: Date,
  checkoutAbandonment: { type: mongoose.Schema.Types.ObjectId, ref: 'CheckoutAbandonment' }
});

const order = mongoose.model('Order', orderSchema);

export default order;