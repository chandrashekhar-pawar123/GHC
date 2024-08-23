import express from "express";
import mongoose from "mongoose";
// import bodyParser from "body-parser";
import dotenv from "dotenv";
import cron from "node-cron";
import cors from "cors";
import Bull  from "bull";

import CheckoutAbandonment from './models/checkoutAbandonment.js';
import SentMessage from './models/sentMessage.js';
import Order from './models/order.js';

import Schedule from './models/schedule.js';

const app = express();

app.use(express.json());

app.use(cors());

dotenv.config(); //for database connection
const PORT = process.env.PORT || 5000;
const MONGOURL = process.env.MONGO_URL; //for database connection

mongoose.connect(MONGOURL).then(() => {
    console.log("Database connected successfully.");

})
.catch((error) => console.log(error));

const queue = new Bull('reminders');


app.post('/webhook/checkout-abandonment', async (req, res) => {
    const checkoutAbandonment = new CheckoutAbandonment({
        ...req.body,
        timestamp: new Date()
    });
    await checkoutAbandonment.save();
    console.log(`Checkout abandonment created: ${checkoutAbandonment._id}`);
    res.status(201).send(`Checkout abandonment created: ${checkoutAbandonment._id}`);

    // Schedule messages based on predefined intervals
  const intervals = [30 * 60 * 1000, 24 * 60 * 60 * 1000, 3 * 24 * 60 * 60 * 1000];
  const messages = [
    "Reminder: Complete Your Purchase - 30 minutes",
    "Reminder: Complete Your Purchase - 1 day",
    "Reminder: Complete Your Purchase - 3 days"
  ];

  intervals.forEach((interval, index) => {
    const scheduledTime = new Date(Date.now() + interval);
    const scheduledMessage = new ScheduledMessage({
      email: checkoutAbandonment.email,
      messageContent: messages[index],
      scheduledTime
    });
    scheduledMessage.save();
    queue.add({
      email: checkoutAbandonment.email,
      messageContent: messages[index],
      scheduledTime
    }, { delay: interval });
  });
});


// app.get('/config/intervals', async (req, res) => {
//     const schedule = await Schedule.findOne({});
//     res.json(schedule || {});
// });

// app.post('/config/intervals', async (req, res) => {
//     const { firstMessageInterval, secondMessageInterval, thirdMessageInterval } = req.body;
//     let schedule = await Schedule.findOne({});
//     if (!schedule) {
//         schedule = new Schedule({ firstMessageInterval, secondMessageInterval, thirdMessageInterval });
//     } else {
//         schedule.firstMessageInterval = firstMessageInterval;
//         schedule.secondMessageInterval = secondMessageInterval;
//         schedule.thirdMessageInterval = thirdMessageInterval;
//     }
//     await schedule.save();
//     res.status(200).json(schedule);
// });


app.post('/webhook/order-placed', async (req, res) => {
    const order = new Order({
        ...req.body,
        timestamp: new Date()
    });
    await order.save();
    await CheckoutAbandonment.updateOne(
        { email: req.body.email, order: {$exists: false} },
        { order: order._id }
    );
    res.status(201).send(`Order created: ${order._id}`);
});


// Cron jobs to send reminders
// const sendReminder = async (interval, messageContent, messageIndex) => {
//     const schedule = await Schedule.findOne({});
//     const checkoutAbandonments = await CheckoutAbandonment.find({
//         sentMessages: { $size: messageIndex },
//         order: { $exists: false }
//     });

//     checkoutAbandonments.forEach(async (checkoutAbandonment) => {
//         const timeElapsed = Date.now() - new Date(checkoutAbandonment.timestamp).getTime();
//         if (timeElapsed >= interval) {
//             const sentMessage = new SentMessage({
//                 email: checkoutAbandonment.email,
//                 messageContent,
//                 timestamp: new Date(),
//                 checkoutAbandonment: checkoutAbandonment._id
//             });
//             await sentMessage.save();
//             checkoutAbandonment.sentMessages.push(sentMessage._id);
//             await checkoutAbandonment.save();
//             console.log(`Message sent to ${checkoutAbandonment.email}!`);
//         }
//     });
// };

queue.process(async (job) => {
    const { email, messageContent, ScheduledTime} = job.data;

  const checkoutAbandonments = await CheckoutAbandonment.find({
    email,
    order: { $exists: false }
  });

  if (checkoutAbandonments.length > 0) {
    const consolidatedMessage = `${messageContent}\n\nYou have ${checkoutAbandonments.length} items waiting in your cart!`;

    const sentMessage = new SentMessage({
      email,
      messageContent: consolidatedMessage,
      timestamp: new Date(),
    });
    
    await sentMessage.save();

    checkoutAbandonments.forEach(async (abandonment) => {
      abandonment.sentMessages.push(sentMessage._id);
      await abandonment.save();
    });

    // Update ScheduledMessage status to 'sent'
    await ScheduledMessage.updateOne(
        { email, scheduledTime },
        { status: 'sent', sentAt: new Date() }
      );

    console.log(`Consolidated message sent to ${email}`);
  }
});


// Schedule cron jobs for each interval
cron.schedule('*/30 * * * *', async () => {
    const schedule = await Schedule.findOne({});
    if (schedule) {
        const usersWithAbandonments = await CheckoutAbandonment.aggregate([
          { $match: { order: { $exists: false }, sentMessages: { $size: 0 } } },
          { $group: { _id: "$email", count: { $sum: 1 } } }
        ]);
    
        usersWithAbandonments.forEach(user => {
          queue.add({
            email: user._id,
            messageContent: 'Reminder: Complete Your Purchase',
          });
        });
      }
});

cron.schedule('0 0 * * *', async () => {
    const schedule = await Schedule.findOne({});
    if (schedule) {
        const usersWithAbandonments = await CheckoutAbandonment.aggregate([
          { $match: { order: { $exists: false }, sentMessages: { $size: 0 } } },
          { $group: { _id: "$email", count: { $sum: 1 } } }
        ]);
    
        usersWithAbandonments.forEach(user => {
          queue.add({
            email: user._id,
            messageContent: 'Reminder: Complete Your Purchase',
          });
        });
      }
});

cron.schedule('0 0 * * *', async () => {
    const schedule = await Schedule.findOne({});
    if (schedule) {
        const usersWithAbandonments = await CheckoutAbandonment.aggregate([
          { $match: { order: { $exists: false }, sentMessages: { $size: 0 } } },
          { $group: { _id: "$email", count: { $sum: 1 } } }
        ]);
    
        usersWithAbandonments.forEach(user => {
          queue.add({
            email: user._id,
            messageContent: 'Reminder: Complete Your Purchase',
          });
        });
      }
});




// app.post('/api/save-user', async(req, res) => {
//     const {email, phone} = req.body;
//     const user = new User({email, phone});
//     await user.save();
//     res.status(201).send('User information saved.')
// })



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



