import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  firstMessageInterval: Number,
  secondMessageInterval: Number,
  thirdMessageInterval: Number
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;