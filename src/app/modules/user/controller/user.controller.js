

const {SignUp,GetProfile ,login ,AddTask,makeManager ,totalTask,updateTask, DeleteTask ,getAllTaskbyAdmin, submitTask,TrackTaskByTrackingNumber,AddUserInManagerTeam
    ,userAllTask ,userSingleTask,taskAssignByManager}=require('../business/user.business')
exports.SignUp = async req => await SignUp(req.body)
exports.login = async req => await login(req.body)
exports.AddTask = async req => await AddTask(req.user,req.body)
// login  AddTask makeManager AssignTask userSingleTask   totalTask
exports.GetProfile = async req => await GetProfile(req.user,req.query)
exports.makeManager = async req => await makeManager(req.user,req.query)

exports.userSingleTask= async req => await userSingleTask(req.user,req.query)
exports.taskAssignByManager= async req => await taskAssignByManager(req.user,req.query)
exports.userAllTask = async req => await userAllTask(req.user)
exports.updateTask = async req => await updateTask(req.user, req.body,req.query)
exports.submitTask = async req => await submitTask(req.user, req.query,req.body)
exports.totalTask= async req => await  totalTask(req.user,req.query)

exports.DeleteTask = async req => await  DeleteTask(req.user,req.query)
exports.AddUserInManagerTeam = async req => await  AddUserInManagerTeam(req.user,req.query)
exports.getAllTaskbyAdmin= async req => await  getAllTaskbyAdmin(req.user,req.query)
exports.TrackTaskByTrackingNumber= async req => await  TrackTaskByTrackingNumber(req.user,req.query)
// userAllTask taskAssignByManager  AddUserInManagerTeam