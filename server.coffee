
# ### Module dependencies.

http    = require 'http'
app     = require './config'
routes  = require './routes'



# ### Start listening for requests

http.createServer(app).listen app.get('port'), ->
  console.log "Questify is up and running on port #{app.get 'port'}"


