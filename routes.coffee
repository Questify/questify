
# ### Module dependencies.

app     = require './server'


# # GET /
#
# The official homepage

app.use '/', require 'home'
app.use '/editor', require 'editor'


# # RESTapi's
#

app.use '/api/v1/', require 'api-v1'

