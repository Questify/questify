
# ### Module dependencies

read = require('fs').readFileSync
parse = require 'mdconf'


settings = parse(read "#{__dirname}/../../settings.md", 'utf-8').settings


module.exports = settings

