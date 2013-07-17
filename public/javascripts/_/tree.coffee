Tree = (stage) ->
  inst = this
  layers = stage.getLayers()
  drawingFromNode = null
  drawingConnector = null
  @connectorslayer = layers[0]
  @nodelayer = layers[1]
  @nodes = []
  @activenode = null
  @activeconnector = null
  @nodelistener = null
  @connectorlistener = null
  @addNodeListener = (myfunc) ->
    @nodelistener = myfunc

  @addConnectorListener = (myfunc) ->
    @connectorlistener = myfunc

  fill_main = [0, "red", 1, "yellow"]
  fill_highlight = [0, "limegreen", 1, "yellow"]
  fill_drag = [0, "yellow", 1, "white"]
  dotradius = 20
  @createNode = (node) ->
    circle = new Kinetic.Group(
      x: node.x
      y: node.y
      draggable: true
      id: node.eventid
    )
    dot = new Kinetic.Circle(
      x: 0
      y: 0
      radius: dotradius
      fillLinearGradientStartPoint: [-50, -50]
      fillLinearGradientEndPoint: [50, 50]
      fillLinearGradientColorStops: fill_main
      stroke: "black"
      strokeWidth: 2
      name: "dot"
    )
    simpleText = new Kinetic.Text(
      text: "" + node.eventid
      fontStyle: "bold"
      align: "center"
      fontSize: 20
      fontFamily: "Arial"
      fill: "black"
    )
    tw = simpleText.getTextWidth()
    th = simpleText.getTextHeight()
    simpleText.setX -tw / 2
    simpleText.setY -th / 2
  
    circle.on "dblclick", (e) ->
      
      #circle.fire('mouseup')
      drawingFromNode = node
      inst.connectorslayer.add inst.createConnector("blank")
      $("#container").mousemove (e) ->
        inst.drawConnector drawingFromNode, e


    circle.add dot
    circle.add simpleText
    circle.on "dragstart", (e) ->
      dot.setFillLinearGradientColorStops fill_drag

    circle.on "dragend", (e) ->
      @fire "click"
      inst.activateNode this

    circle.on "mouseover", ->
      @setOpacity .8
      inst.nodelayer.draw()
      document.body.style.cursor = "pointer"
      drawingConnector = inst.connectorslayer.get("#lineconnector_blank")
      drawingConnector.hide()  if drawingFromNode is this

    circle.on "mouseout", ->
      @setOpacity 1
      inst.nodelayer.draw()
      document.body.style.cursor = "default"
      inst.connectorslayer.get("#lineconnector_blank").show()

    circle.on "mousedown", ->
      inst.activateNode this

    circle.on "mouseup", (e) ->
      if drawingFromNode
        connector = inst.connectorslayer.get("#lineconnector_blank")[0]
        connector.remove()
        connector = inst.addConnector(node, drawingFromNode)
        inst.activateConnector connector
        drawingFromNode = null

    circle.on "dragmove", (e) ->
      node.x = @attrs.x
      node.y = @attrs.y
      
      # update parent connectors:
      parents = events[node.eventid].parents or []
      children = node.children or []
      i = 0

      while i < parents.length
        _parent = events[parents[i].eventid].node
        inst.drawConnector node, _parent
        i++
      i = 0

      while i < children.length
        child = events[children[i]].node
        inst.drawConnector child, node
        i++
      inst.connectorslayer.draw()

    @nodes.push circle
    circle

  @findNode = (eventid) ->
    for i of @nodes
      node = @nodes[i]
      return node  if node.getId() is eventid
    false

  @activateNode = (node) ->
    inst.deactivateConnector inst.activeconnector
    inst.deactivateNode inst.activenode
    node.get(".dot")[0].setFillLinearGradientColorStops fill_highlight
    inst.activenode = node
    inst.nodelayer.draw()
    @nodelistener inst.activenode  if @nodelistener

  @deactivateNode = (node) ->
    return node.get(".dot")[0].setFillLinearGradientColorStops(fill_main)  unless node
    inst.nodelayer.draw()

  @activateConnector = (connector) ->
    return inst.deactivateNode(inst.activenode)  unless connector
    inst.deactivateConnector inst.activeconnector
    connector.get(".arrow")[0].setFill "#590"
    connector.get(".arrow")[0].setStroke "#590"
    connector.get(".line")[0].setStroke "#590"
    connector.get(".line")[0].setStrokeWidth 6
    connector.get(".line")[0].setDashArray [10, 10]
    inst.activeconnector = connector
    inst.connectorslayer.draw()
    @connectorlistener inst.activeconnector  if @connectorlistener

  @deactivateConnector = (connector) ->
    return connector.get(".arrow")[0].setFill("#000")  unless connector
    connector.get(".arrow")[0].setStroke "#000"
    connector.get(".line")[0].setStroke "#333"
    connector.get(".line")[0].setStrokeWidth 3
    connector.get(".line")[0].setDashArray []
    inst.connectorslayer.draw()

  @addConnector = (nodeA, nodeB) ->
    return false  if nodeA is nodeB
    eventA = events[nodeA.eventid]
    eventA.parents = []  unless eventA.parents
    nodeB.children = []  unless nodeB.children
    
    # already added
    return false  if $.inArray(nodeB, eventA.parents) > -1 and $.inArray(nodeA.eventid, nodeB.children) > -1
    eventA.parents.push nodeB
    nodeB.children.push nodeA.eventid
    connector = inst.createConnector(nodeA.eventid + "_" + nodeB.eventid)
    inst.connectorslayer.add connector
    inst.drawConnector nodeA, nodeB

  @createConnector = (id) ->
    connector = new Kinetic.Group(
      x: 0
      y: 0
      draggable: false
      id: "lineconnector_" + id
    )
    line = new Kinetic.Line(
      points: [0, 0, 0, 0]
      stroke: "#333"
      strokeWidth: 3
      lineCap: "round"
      name: "line"
      detectionType: "pixel"
      shadow:
        color: "#999"
        blur: 2
        offset: [4, 4]
        alpha: 0.5
    )
    arrow = new Kinetic.Polygon(
      points: [0, 0, 0, 0, 0, 0]
      fill: "#000"
      stroke: "black"
      strokeWidth: 3
      name: "arrow"
    )
    connector.add line
    connector.add arrow
    arrow.on "mousedown", (e) ->
      console.log "a"
      inst.activateConnector connector

    arrow.on "mouseover", ->
      connector.setOpacity .8
      inst.connectorslayer.draw()
      document.body.style.cursor = "pointer"

    arrow.on "mouseout", ->
      connector.setOpacity 1
      inst.connectorslayer.draw()
      document.body.style.cursor = "normal"

    connector

  @drawConnector = (nodeA, nodeB) ->
    return  unless nodeA
    x0 = nodeA.x
    y0 = nodeA.y
    id = "#lineconnector_"
    if nodeB.type is "mousemove" # event object instead
      
      # Drawing a new connector
      return id += "blank"  unless drawingFromNode
      x0 = event.layerX
      y0 = event.layerY
      x1 = nodeA.x
      y1 = nodeA.y
    else
      id += nodeA.eventid + "_" + nodeB.eventid
      x1 = nodeB.x
      y1 = nodeB.y
    connector = inst.connectorslayer.get(id)[0]
    connector.setPosition [x0, y0]
    dx = x1 - x0
    dy = y1 - y0
    hyp = Math.sqrt(dx * dx + dy * dy)
    sinx = dy / hyp
    cosx = dx / hyp
    if nodeB?
      _x0 = dotradius * cosx
      _y0 = dotradius * sinx
    else
      _x0 = 0
      _y0 = 0
    alen = 15
    _x1 = (x1 - x0) - dotradius * cosx
    _y1 = (y1 - y0) - dotradius * sinx
    line = connector.get(".line")[0]
    arrow = connector.get(".arrow")[0]
    p0x = _x0
    p0y = _y0
    tx = _x0 + cosx * alen
    ty = _y0 + sinx * alen
    p1x = tx - sinx * alen / 2
    p1y = ty + cosx * alen / 2
    p2x = tx + sinx * alen / 2
    p2y = ty - cosx * alen / 2
    arrow.setPoints [p0x, p0y, p1x, p1y, p2x, p2y]
    line.setPoints [tx, ty, _x1, _y1]
    if hyp < dotradius
      arrow.hide()
      line.hide()
    else
      console.log tx, _x1
      arrow.show()
      line.show()
    inst.connectorslayer.draw()