
# ### Module dependencies.

app     = require './config'


# # GET /
#
# The official homepage

app.use '/', require 'home'


# # RESTapi's
#

app.use '/api/v1/', require 'api-v1'

