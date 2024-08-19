import mongoose from 'mongoose';

const sentMessageSchema = new mongoose.Schema({
  email: String,
  messageContent: String,
  timestamp: Date,
  checkoutAbandonment: { type: mongoose.Schema.Types.ObjectId, ref: 'CheckoutAbandonment' }
});

const sentMessage = mongoose.model('SentMessage', sentMessageSchema);

export default sentMessage;