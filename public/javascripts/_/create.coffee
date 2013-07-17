orderTree = ->
  for i of events
    event = events[i]
    pevent = event
    level = 0
    loop
      if pevent.parents
        pid = pevent.parents[0].eventid
        level++
        pevent = events[pid]
      else
        break
    events[i].node.y = 50 + level * 100
buildMenu = ->
  $("#event_add").on "click", (e) ->
    node =
      eventid: events.length
      x: 10
      y: 10
      children: []

    event =
      id: events.length
      title: ""
      node: node

    events.push event
    nodelayer.add tree.createNode(event.node)
    nodelayer.draw()

  $("#event_delete").on "click", (e) ->
    event = addEvent()
    nodelayer.add tree.createNode(event.node)
    nodelayer.draw()

connectordrawing = false
data = [
  id: 1
  title: "blah1"
,
  id: 2
  title: "blah4"
  parents: [eventid: 5]
,
  id: 3
  title: "blah3"
,
  id: 4
  title: "blah5"
,
  id: 5
  title: "blah2"
  parents: [
    eventid: 7
  ,
    eventid: 8
  ]
,
  id: 6
  title: "blah1"
,
  id: 7
  title: "blah4"
  parents: [eventid: 6]
,
  id: 8
  title: "blah3"
,
  id: 9
  title: "blah2"
  parents: [
    eventid: 1
  ,
    eventid: 2
  ]
]
events = []
for i of data
  event = data[i]
  events[event.id] = event
  node = {}
  level = 0
  node.x = 50 + Math.random() * 300
  node.y = 50 + Math.random() * 300
  node.eventid = event.id
  event.node = node
activeevent = null
orderTree()
nodelayer = new Kinetic.Layer(name: "nodes")
connectorslayer = new Kinetic.Layer(name: "connectors")
window.onload = ->
  stage = new Kinetic.Stage(
    container: "container"
    width: $("#container").width()
    height: $("#container").height()
  )
  stage.add connectorslayer
  stage.add nodelayer
  tree = new Tree(stage)
  tree.addNodeListener (node) ->
    $("tr#event_" + node.eventid).addClass "selected"

  createConnectors = (node) ->
    event = events[node.eventid]
    return  unless event.parents
    lines = []
    for j of event.parents
      _parent = event.parents[j]
      parentnode = events[_parent.eventid].node
      parentnode.children = parentnode.children or []
      parentnode.children.push node.eventid
      connector = tree.createConnector(node.eventid + "_" + parentnode.eventid)
      lines.push connector
    lines

  $("tr.event").on "click", (e) ->
    eventid = $(this).attr("data-id")
    tree.activateNode tree.findNode(eventid)
    $("#event_" + activeevent).removeClass "highlight"
    $(this).addClass "highlight"
    activeevent = eventid

  for i of events
    eventhtml = "<tr class=\"event\" id=\"event_" + events[i].id + "\" data-id=\"" + events[i].id + "\"><td>" + events[i].id + "</td><td>" + events[i].title + "</td></tr>"
    $(".eventlist").append eventhtml
    node = events[i].node
    circle = tree.createNode(node)
    connectors = createConnectors(node)
    for j of connectors
      connectorslayer.add connectors[j]
    nodelayer.add circle
    circle.fire "dragmove"
  connectorslayer.draw()
  nodelayer.draw()
  buildMenu()