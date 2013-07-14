#!/bin/env coffee


# ### Module dependencies.

program = require 'commander'
pkg     = require '../package'
apis    = require '../api'



# # Usage: api [-vVq]
#
# -V, --version

program
  .version(pkg.version)
  .option("-v, --verbose", "output curl queries")
  .option("-q, --quiet", "prevent all output")



# ## Api's
#
# Each api has implemented it's own cli.

for api in apis
  program
    .command(api.name)
    .description(api.description)



# Make program actionable by parsing
# arguments passed.

program
  .parse process.argv

