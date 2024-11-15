
const user_route=require('./src/app/modules/user/router/router')
module.exports = [
    {
      path: "/api/user",
      handler: user_route
    }
  ]