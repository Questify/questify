
# ### Module dependencies.

mongoose = require('mongoose')


# # Location
#

conn = mongoose.connections[0]
Schema = mongoose.Schema
Types = Schema.Types

coordinate = /^[\d]+\.[\d]+$/

Location = new Schema
  'title':
    type: String, min: 3, max: 50, required: true
  'description':
    type: String, min: 15, max: 140
  'coords': [
    altitude:  type: String, match: coordinate
    latitude:  type: String, match: coordinate
    longitude: type: String, match: coordinate
  ]
  'visible':
    type: Boolean, default: false
  'icon':
    type: Types.ObjectId, ref: 'Resource'



# Expose `Location` to the parent mongoose client.

module.exports = conn.model('Location', Location, 'Location')

