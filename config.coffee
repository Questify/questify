
# ### Module dependencies.

express   = require 'express'
nib       = require 'nib'
stylus    = require 'stylus'


staticCompiler = (str, path) ->
  (stylus str)
    .set('filename', path)
    .use nib()

app = module.exports = express()
app.set 'port', process.env.port || 3000
app.set 'views', "#{__dirname}/views"
app.set 'view engine', 'jade'
app.set 'view options', { pretty: true }

app.use express.favicon()
app.use stylus.middleware
  src: pub = "#{__dirname}/public",
  compile: staticCompiler
app.use express.static pub
app.use app.router

