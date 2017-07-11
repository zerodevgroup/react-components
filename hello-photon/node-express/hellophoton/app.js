let express  = require('express')
let bodyParser = require('body-parser')
let cors = require('cors')
let appRoutes = require('./router/app-routes')
let mongoose = require('mongoose')

let deviceRoutes = require('./router/device-routes')
let devicestatusRoutes = require('./router/devicestatus-routes')
let devicetypeRoutes = require('./router/devicetype-routes')
let roleRoutes = require('./router/role-routes')
let userRoutes = require('./router/user-routes')

let app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())

let router = express.Router()

deviceRoutes.getRoutes(app, router)
devicestatusRoutes.getRoutes(app, router)
devicetypeRoutes.getRoutes(app, router)
roleRoutes.getRoutes(app, router)
userRoutes.getRoutes(app, router)

appRoutes.getRoutes(app, router)

mongoose.connect('mongodb://localhost:27017/blah')
mongoose.Promise = Promise

app.use('/api', router)

app.set('port', process.env.PORT || 4000)

// Start server
let server = app.listen(app.get('port'), function() {
  console.log('Express is running on port ' + app.get('port'))
})
