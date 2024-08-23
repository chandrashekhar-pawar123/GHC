import mongoose from 'mongoose';

const sentMessageSchema = new mongoose.Schema({
  email: { type: String, required: true },
  messageContent: { type: String, required: true },
  scheduledTime: { type: Date, required: true },
  status: { type: String, default: 'pending' }, // Status can be 'pending', 'sent', or 'canceled'
  sentAt: { type: Date }
});

const sentMessage = mongoose.model('SentMessage', sentMessageSchema);

export default sentMessage;



