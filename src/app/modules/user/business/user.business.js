const { User, Task, Manager } = require('../model/user.model');
const bcrypt = require('bcrypt');
const rateLimit = require("express-rate-limit");
const jwt = require('jsonwebtoken');
const db = require('../../../db/mongoose');  
const nodemailer = require('nodemailer');
const { isValidEmail, isValidPassword } = require('../../../middlewares/validator.middleware');
require('dotenv').config();

const sendRegisterEmail = async (email) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'satya.21754@knit.ac.in',
        pass: 'Satya@123'
      }
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Email for registration',
      text: 'You have successfully registered.'
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Registration email sent to:', email);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const SignUp = async (body) => {
    const { username, email, password } = body;
    if (!isValidEmail(email))  throw ("Invalid email format.");
    if (!isValidPassword(password)) throw ("Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.");
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) throw ("Username or email already exists.");
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        username,
        email,
        password: hashedPassword
    });
    await newUser.save();
    const token = jwt.sign(
        { userId: newUser._id, username: newUser.username, email: newUser.email },
        process.env.JWT_SECERET,  
        { expiresIn: '1h' }
    );
    await sendRegisterEmail(email);
    return { message: "User registered successfully!", token };
};





const login = async (data) => {
    const { usernameOrEmail, password } = data;  
    if (!usernameOrEmail || !password)  throw ('Username/email and password are required.');
    const user = await User.findOne({
        $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    });
    if (!user) throw ('User not found.');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw ('Invalid password.');
    const token = jwt.sign(
        { userId: user._id, username: user.username, email: user.email },
        'satyaSingh',  
        { expiresIn: '1h' }  
    );
    return { 
        message: 'Login successful!', 
        token:token 
    };
}





const logOut=async()=>{
    
}

const GetProfile = async (user, query) => {
    const { id } = query;
 
    const userProfile = await User.findById(id).select("-password");
        if (!userProfile) throw ("User not found");
        return userProfile;
};

const AddTask = async (user, body) => {
    const { _id } = user;
    const taskData = {
        ...body,
        createdBy: _id 
    };
    const task = new Task(taskData);  
    await task.save();
    return {
        msg: "success",
        data: task
    };
};






const makeManager=async(user,query)=>{
    const {userId}=query;
  const userData = await User.findById(userId); 
    if (!userData) throw ("User not found");
    userData.roles = 2;
    await userData.save();

    const manager = new Manager({
        user: userData._id,
        team: [], 
        tasksManaged: [], 
    });
    await manager.save(); 
    return { msg: "User promoted to Manager successfully", data: userData };

}

const updateTask = async (user, body, query) => {
    const { taskId } = query;
    const { title, description } = body;
    const task = await Task.findById(taskId);
    if (!task) throw ("Task not found");
    task.title = title;
    task.description = description;
    await task.save();
    return {
        msg: "Task updated successfully",
        data: task
    };
};


const DeleteTask = async (user, query) => {
    const { taskId } = query;
    const task = await Task.findById(taskId);
    if (!task)  throw ("Task not found");
    await Task.findByIdAndDelete(taskId);
    return {
        msg: "Task deleted successfully"
    };
};

const getAllTaskbyAdmin = async (user) => {
    const tasks = await Task.find();
    return {
        msg: "Tasks retrieved successfully",
        data: tasks
    };
};


const userAllTask = async (user,query) => {
    const { _id } = user;
    const userData = await User.findById(_id).populate('assignedTasks');
    if (!userData) {
        throw new Error('User not found');
    }
    return {
        msg: "User's tasks retrieved successfully",
        data: userData.assignedTasks
    };
};

const submitTask = async (user, query, body) => {
        const { _id } = user;
        const { taskId } = query;
        const { answer } = body;
        if (!taskId)  throw ("Task ID is required");
        if (!answer ) throw ("Answer cannot be empty");
        const userData = await User.findById(_id);
        if (!userData) throw ("User not found");
        const assignedTask = userData.assignedTasks.find(task => task.task.toString() === taskId);
        if (!assignedTask) throw ("Task not assigned to this user");
        assignedTask.taskanswer = answer;
        assignedTask.status = 'Completed';
        assignedTask.submissionDate = new Date();
        await userData.save();
        return {
            message: "Task submitted successfully",
            taskId,
            status: assignedTask.status,
            submissionDate: assignedTask.submissionDate,
        };
};

const TrackTaskByTrackingNumber = async (user, query) => {

        const { trackingNumber } = query;
        console.log("000000000000000000000",trackingNumber)
        if (!trackingNumber || trackingNumber.trim() === "")  throw ("Tracking number is required");
        const userData = await User.findById(user._id).populate({
            path: "assignedTasks.task",
            select: "title description dueDate status", 
        });
        if (!userData) throw ("User not found");
        const assignedTask = userData.assignedTasks.find(
            task => task.trackingNumber === trackingNumber
        );
        if (!assignedTask)  throw ("Task with this tracking number not found")
        return {
            message: "Task found",
            taskDetails: {
                trackingNumber: assignedTask.trackingNumber,
                taskId: assignedTask.task._id,
                title: assignedTask.task.title,
                description: assignedTask.task.description,
                dueDate: assignedTask.task.dueDate,
                status: assignedTask.status,
                submissionDate: assignedTask.submissionDate,
                taskAnswer: assignedTask.taskanswer,
            },
        };
   
};



const userSingleTask = async (user, query) => {
    const { _id } = user;
    const { Id } = query;
    const userData = await User.findById(_id).populate('assignedTasks');
    if (!userData)   throw ('User not found');
    const task = userData.assignedTasks.find(task => task._id.toString() === Id);
    if (!task)   throw ('Task not found for this user');
    return {
        msg: "User's task retrieved successfully",
        data: task
    };
};

const taskAssignByManager = async (user, query) => {
    const { _id } = user;
    const { userId, taskId } = query;
    const userManager = await User.findById(_id);
    if (!userManager || userManager.roles !== 2) {
        throw new Error("You don't have access");
    }
    const managerData = await Manager.findOne({ user: _id });
    if (!managerData || !managerData.team.includes(userId)) {
        throw new Error("User is not part of your team");
    }
    const taskForAssign = await Task.findById(taskId);
    const userData = await User.findById(userId);
    if (!taskForAssign) {
        throw new Error("Task not found");
    }
    if (!userData) {
        throw new Error("User not found");
    }
    taskForAssign.assignedTo.push(userId);
    userData.assignedTasks.push(taskId);  
    await taskForAssign.save();
    await userData.save();

    return {
        msg: "Task assigned successfully",
        data: taskForAssign
    };
};

const totalTask = async (user,query) => {
    const { key } = query;
    console.log("---------------->",key)
    const searchQuery = key
        ? {
            $or: [
                { title: { $regex: key.trim(), $options: 'i' } }, 
                { description: { $regex: key.trim(), $options: 'i' } }, 
                { priority: { $regex: key.trim(), $options: 'i' } }
            ]
        }
        : {}; 
    const tasks = await Task.find(searchQuery).populate({
        path: 'assignedTo',
        select: 'username',
    });
    return {
        msg: "Tasks retrieved successfully",
        total: tasks.length,
        data: tasks,
    };
};


const AddUserInManagerTeam = async (user, query) => {
    const { userId } = query;
        const manager = await Manager.findOne({ user: user._id });
        if (!manager)  throw ('Manager not found');
        const userToAdd = await User.findById(userId);
        if (!userToAdd) throw ('User not found');
        if (manager.team.includes(userToAdd._id))  throw ('User is already in the manager\'s team');
        manager.team.push(userToAdd._id);
        await manager.save();
        return { 
             message: 'User added to manager\'s team successfully',
             user: userToAdd 
            };
};


module.exports = {TrackTaskByTrackingNumber, totalTask,SignUp ,submitTask , getAllTaskbyAdmin,updateTask,login ,GetProfile,AddTask,makeManager ,AddUserInManagerTeam,userAllTask,userSingleTask,taskAssignByManager, DeleteTask };
