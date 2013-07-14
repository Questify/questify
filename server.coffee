
# ### Module dependencies.

express   = require 'express'
http      = require 'http'
nib       = require 'nib'
stylus    = require 'stylus'
app       = module.exports = express()
router    = require './routes'
settings  = require 'settings'


staticCompiler = (str, path) ->
  (stylus str)
    .set('filename', path)
    .use nib()


# ### Site settings
for key, val of settings
  app.set "#{key}", val


# ### Middle-ware

app.use express.favicon()
app.use stylus.middleware
  src: pub = "#{__dirname}/public",
  compile: staticCompiler
app.use express.static pub
app.use app.router


# ### Start listening for requests

http.createServer(app).listen app.get('port'), ->
  console.log "Questify is up and running on port #{app.get 'port'}"

