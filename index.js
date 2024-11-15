const express = require('express');
const app = express();
require('dotenv').config();

let {getTrackingNumber}=require('./src/app/middlewares/validator.middleware')
const cors = require("cors");

const routes = require("./route");  
const db = require('./src/app/db/mongoose');  
let {authenticateAdmin}=require('./src/app/middlewares/authenticateAdmin')
let {authenticateManager}=require('./src/app/middlewares/authenticateManager')
const {User ,Task ,Manager}= require('./src/app/modules/user/model/user.model');


const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});



const port = process.env.PORT || 5764;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());


app.get('/', (req, res) => {
    return res.status(200).send("Welcome to satya singh");
});


app.get('/AssignTask', authenticateManager, async (req, res) => {
    try {
        const { userId, taskId } = req.query;
        if (!userId || !taskId)  return res.status(400).json({ error: "Missing required parameters: userId or taskId" });
        const taskForAssign = await Task.findById(taskId);
        if (!taskForAssign) return res.status(404).json({ error: "Task not found" });
        const userData = await User.findById(userId);
        if (!userData) return res.status(404).json({ error: "User not found" });
        
        const trackingNumber = await getTrackingNumber();
        const assignedTask = {
            task: taskForAssign._id,
            trackingNumber,
            status: 'Pending',
        };
        io.emit('taskAssigned', {
            taskId: taskForAssign._id,
            userId: userData._id,
            message: `Task "${taskForAssign.title}" has been assigned to you.`,
        });
        userData.assignedTasks.push(assignedTask);
        await userData.save();
        return res.status(200).json({
            msg: "Task assigned successfully",
            trackingNumber,
            taskDetails: taskForAssign,
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});


routes.forEach(route => {
    app.use(route.path, route.handler);
});
app.listen(port, () => {
    console.log(`Server started at port ${port}`);
});
