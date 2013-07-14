
# ### Module dependencies

express   = require 'express'
mongoose  = require 'mongoose'
model     = require './model'
_         = require 'underscore'
settings  = require 'settings'


app = module.exports = express()
app.set 'view engine', 'jade'
app.set 'views', "#{__dirname}/views"
app.use express.bodyParser()
app.use express.methodOverride()
app.use app.router


# # Routes

db = settings.database
conn   = mongoose.createConnection db.host, db.collection
Locations = conn.model('Location')


# ## GET /location[s]?/
#
# Returns all the locations

app.get '/', (req, res) ->
  Locations.find (err, locations) ->
    throw err if err
    res.json locations


# ## POST /location[s]?/
#
# Creates a new location is MongoDb

app.post '/', (req, res) ->
  req.body._id = null
  location = new Locations req.body
  location.save (err) ->
    throw err if err?
    res.json @

edit = (req, res) ->
  res.render 'crud/crud', model: Locations, values: req.location or {}


app.get '/new', edit


app.all '/:query*', (req, res, next) ->
  query = req.param 'query'
  if query.match /^[a-f0-9]{24}$/
    Locations.findById query, (err, location) ->
      throw err if err?
      req.location = location
      next()


app.get '/:query', (req, res) ->
  res.json req.location


app.get '/:query/edit', edit

