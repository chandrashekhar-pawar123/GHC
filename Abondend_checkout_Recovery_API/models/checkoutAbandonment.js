import mongoose from 'mongoose';

const checkoutAbandonmentSchema = new mongoose.Schema({
  email: String,
  cartContents: String,
  timestamp: Date,
  sentMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SentMessage' }],
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
});

const CheckoutAbandonment = mongoose.model('CheckoutAbandonment', checkoutAbandonmentSchema);

export default CheckoutAbandonment;