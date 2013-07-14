
mongoose = require('mongoose')
conn = mongoose.createConnection 'localhost', 'api-quest-test'
require('../model')
Quests = conn.model('Quest')

describe '#Quest', ->

  before (done) ->
    quest = new Quests
      title: 'test quest',
      description: 'voila, a new quest!',
      version: 'v1'
    quest.save done

  after (done) ->
    Quests.remove(done)

  it 'should include a short-version', (done) ->
    Quests.findOne title: 'test quest', (err, quest) ->
      throw err if err?
      quest.version.should.equal 'v1'
      done()

