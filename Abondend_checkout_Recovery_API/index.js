import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cron from "node-cron";
import cors from "cors";

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

const intervals = {
    firstMessageInterval: 30 * 60 * 1000,
    secondMessageInterval: 24 * 60 * 60 * 1000,
    thirdMessageInterval: 3 * 24 * 60 * 60 * 1000
};

// Endpoints to get and update schedule intervals
// Before
// app.get('/config/intervals', (req, res) => {
//     res.json(intervals);
// });

// After
app.get('/config/intervals', async (req, res) => {
    const schedule = await Schedule.findOne({});
    res.json(schedule || {});
});

app.post('/config/intervals', async (req, res) => {
    const { firstMessageInterval, secondMessageInterval, thirdMessageInterval } = req.body;
    let schedule = await Schedule.findOne({});
    if (!schedule) {
        schedule = new Schedule({ firstMessageInterval, secondMessageInterval, thirdMessageInterval });
    } else {
        schedule.firstMessageInterval = firstMessageInterval;
        schedule.secondMessageInterval = secondMessageInterval;
        schedule.thirdMessageInterval = thirdMessageInterval;
    }
    await schedule.save();
    res.status(200).json(schedule);
});

// webhook for checkout abandonment
// Before
// app.post('/webhook/checkout-abandonment', async (req, res) => {
//     const checkoutAbandonment = new CheckoutAbandonment(req.body);
//     await checkoutAbandonment.save();
//     console.log(`Checkout abandonment created: ${checkoutAbandonment._id}`);
//     res.status(201).send(`Checkout abandonment created: ${checkoutAbandonment._id}`);
// });

// after
app.post('/webhook/checkout-abandonment', async (req, res) => {
    const checkoutAbandonment = new CheckoutAbandonment({
        ...req.body,
        timestamp: new Date()
    });
    await checkoutAbandonment.save();
    console.log(`Checkout abandonment created: ${checkoutAbandonment._id}`);
    res.status(201).send(`Checkout abandonment created: ${checkoutAbandonment._id}`);
});

// webhook for order placed
// Before
// app.post('/webhook/order-placed', async (req, res) => {
//     const order = new Order(req.body);
//     await order.save();
//     console.log(`Order created: ${order._id}`);
//     res.status(201).send(`Order created: ${order._id}`);
// });

// After
app.post('/webhook/order-placed', async (req, res) => {
    const order = new Order({
        ...req.body,
        timestamp: new Date()
    });
    await order.save();
    await CheckoutAbandonment.updateOne(
        { email: req.body.email },
        { order: order._id }
    );
    console.log(`Order created: ${order._id}`);
    res.status(201).send(`Order created: ${order._id}`);
});


// Cron jobs to send reminders
const sendReminder = async (interval, messageContent, messageIndex) => {
    const schedule = await Schedule.findOne({});
    const checkoutAbandonments = await CheckoutAbandonment.find({
        sentMessages: { $size: messageIndex },
        order: { $exists: false }
    });

    checkoutAbandonments.forEach(async (checkoutAbandonment) => {
        const timeElapsed = Date.now() - new Date(checkoutAbandonment.timestamp).getTime();
        if (timeElapsed >= interval) {
            const sentMessage = new SentMessage({
                email: checkoutAbandonment.email,
                messageContent,
                timestamp: new Date(),
                checkoutAbandonment: checkoutAbandonment._id
            });
            await sentMessage.save();
            checkoutAbandonment.sentMessages.push(sentMessage._id);
            await checkoutAbandonment.save();
            console.log(`Message sent to ${checkoutAbandonment.email}!`);
        }
    });
};


// Schedule cron jobs for each interval
// Before
// cron.schedule('*/30 * * * *', async () => {
//     const checkoutAbandonments = await CheckoutAbandonment.find({ sentMessages: { $size: 0 } });
//     checkoutAbandonments.forEach(async (checkoutAbandonment) => {
//       const messageContent = `Reminder: Complete Your Purchase`;
//       const sentMessage = new SentMessage({ email: checkoutAbandonment.email, messageContent, checkoutAbandonment: checkoutAbandonment._id });
//       await sentMessage.save();
//       console.log(`Message sent to ${checkoutAbandonment.email}!`);
//     });
// });
// cron.schedule('0 0 * * *', async () => {
//     const checkoutAbandonments = await CheckoutAbandonment.find({ sentMessages: { $size: 1 } });
//     checkoutAbandonments.forEach(async (checkoutAbandonment) => {
//       const messageContent = `Second Reminder: Complete Your Purchase`;
//       const sentMessage = new SentMessage({ email: checkoutAbandonment.email, messageContent, checkoutAbandonment: checkoutAbandonment._id });
//       await sentMessage.save();
//       console.log(`Message sent to ${checkoutAbandonment.email}!`);
//     });
// });
// cron.schedule('0 0 * * *', async () => {
//     const checkoutAbandonments = await CheckoutAbandonment.find({ sentMessages: { $size: 2 } });
//     checkoutAbandonments.forEach(async (checkoutAbandonment) => {
//       const messageContent = `Third Reminder: Complete Your Purchase`;
//       const sentMessage = new SentMessage({ email: checkoutAbandonment.email, messageContent, checkoutAbandonment: checkoutAbandonment._id });
//       await sentMessage.save();
//       console.log(`Message sent to ${checkoutAbandonment.email}!`);
//     });
// });

// After
cron.schedule('*/30 * * * *', async () => {
    const schedule = await Schedule.findOne({});
    await sendReminder(schedule.firstMessageInterval, 'Reminder: Complete Your Purchase', 0);
});

cron.schedule('0 0 * * *', async () => {
    const schedule = await Schedule.findOne({});
    await sendReminder(schedule.secondMessageInterval, 'Second Reminder: Complete Your Purchase', 1);
});

cron.schedule('0 0 * * *', async () => {
    const schedule = await Schedule.findOne({});
    await sendReminder(schedule.thirdMessageInterval, 'Third Reminder: Complete Your Purchase', 2);
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



