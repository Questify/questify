
# ### Module dependencies.

mongoose = require('mongoose')


# # Quest
#
# A quest requires the user to be logged in,
# that title and description are specified
# and that the api-version is included.

conn = mongoose.connections[0]
Schema = mongoose.Schema
Types = Schema.Types

Quest = new Schema
  'title':
    type: String, min: 3, max: 50, required: true
  'description':
    type: String, min: 15, max: 140, required: true
  'version':
    type: String, match: /^v\d$/, required: true
  'author':
    type: Types.ObjectId, ref: 'Player'
  'locations':
    [type: Types.ObjectId, ref: 'Location']
  'areas':
    [type: Types.ObjectId, ref: 'Area']
  'events':
    [type: Types.ObjectId, ref: 'Event']
  'resources':
    [type: Types.ObjectId, ref: 'Resource']

Quest.statics.findByAuthor = (authorId, cb) ->
  this.find author: authorId, (err, quests) ->
    cb err if err?
    cb quests

Quest.statics.findByApiVersion = (version, cb) ->
  this.find version: version, (err, quests) ->
    cb err if err?
    cb quests


# Expose `Quest` to the parent mongoose client.

module.exports = conn.model('Quest', Quest)

