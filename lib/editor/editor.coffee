
# ### Module dependencies

express   = require 'express'


# Configure instance

app = module.exports = express()
app.set 'view engine', 'jade'
app.set 'views', "#{__dirname}/views"

# Middleware

app.use express.bodyParser()
app.use express.methodOverride()
app.use app.router


app.get '/', (req, res) ->
  res.render('editor')

