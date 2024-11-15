let express = require('express');

let {authenticateUser}=require('../../../middlewares/jwt.middleware')
let {authenticateAdmin}=require('../../../middlewares/authenticateAdmin')
let {authenticateManager}=require('../../../middlewares/authenticateManager')
let {limiter}=require('../../../middlewares/validator.middleware')


const router = express.Router();
const {AddUserInManagerTeam, SignUp,GetProfile,login ,AddTask,makeManager , totalTask,updateTask,DeleteTask,getAllTaskbyAdmin,submitTask,TrackTaskByTrackingNumber
    ,userAllTask,userSingleTask,taskAssignByManager} = require("../controller/user.controller");
const { wrapAsync } = require("../../../helpers/router.helper");

router.post("/login", limiter,wrapAsync(login));
router.post("/SignUp", wrapAsync(SignUp));
router.get("/GetProfile", limiter,authenticateUser,wrapAsync(GetProfile));
router.post("/AddTask", limiter,authenticateAdmin,wrapAsync(AddTask));
router.get("/makeManager",limiter, authenticateAdmin,wrapAsync(makeManager));

router.get("/userAllTask", authenticateUser,wrapAsync(userAllTask));
router.get("/userSingleTask", authenticateUser,wrapAsync(userSingleTask));
router.get("/totalTask", limiter,authenticateAdmin,wrapAsync(totalTask));
router.get("/taskAssignByManager",authenticateAdmin,wrapAsync(taskAssignByManager));
router.patch("/updateTask",authenticateAdmin,wrapAsync(updateTask));
router.delete("/DeleteTask",authenticateAdmin,wrapAsync(DeleteTask));
router.get("/getAllTaskbyAdmin", limiter,authenticateAdmin,wrapAsync(getAllTaskbyAdmin));
router.get("/TrackTaskByTrackingNumber", limiter,authenticateUser,wrapAsync(TrackTaskByTrackingNumber));
router.post("/submitTask", authenticateUser,wrapAsync(submitTask));
router.get("/AddUserInManagerTeam", authenticateManager,wrapAsync(AddUserInManagerTeam));
//AssignTask userAllTask  submitTask  AddUserInManagerTeam

module.exports = router;
