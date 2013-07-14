
# ### Module dependencies

express   = require 'express'
mongoose  = require 'mongoose'
model     = require './model'
settings  = require 'settings'


app = module.exports = express()



# # Routes

db = settings.database
conn   = mongoose.createConnection db.host, db.collection
Quests = conn.model('Quest')


# ## GET /quest[s]?/
#
# Returns all the quests available

app.get '/', (req, res) ->
  Quests.find (err, quests) ->
    throw err if err
    res.json quests


# ## GET /quest[s]?/:id
#
# Returns quests that match query

app.get '/:query', (req, res) ->
  query = req.param 'query'

  if query.match /^[a-f0-9]{24}$/
    Quests.findById query, (err, quest) ->
      throw err if err?
      res.json quest

