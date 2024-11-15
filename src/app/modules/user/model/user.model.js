const mongoose = require('mongoose');

const assignedTaskSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task', 
    },
    trackingNumber: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Submitted', 'Completed'], 
        default: 'Pending',
    },
    submissionDate: {
        type: Date, 
    },
    taskanswer: {
        type: String, 
        maxlength: 500,
        default: '',
    },
}, {
    timestamps: true, 
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: /.+\@.+\..+/  
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    roles: {
        type: Number,
        default: 5,  
        enum: [1, 2, 5], // Define possible roles: 1 - Admin, 2 - Moderator, 5 - User
    },
    profilePicture: {
        type: String,  
        default: ''
    },
    bio: {
        type: String,
        maxlength: 500,
        default: ''
    },
    assignedTasks: [assignedTaskSchema], 
}, {
    timestamps: true  
});


const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100,
    },
    description: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 500,
    },
    dueDate: {
        type: Date,
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    }
}, {
    timestamps: true  
});



const managerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  
        required: true
    },
    team: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  
    }],
    tasksManaged: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
}, {
    timestamps: true  
});


const Manager = mongoose.model('Manager', managerSchema);
const Task = mongoose.model('Task', taskSchema);
const User = mongoose.model('User', userSchema);
module.exports = { User ,Task ,Manager};
