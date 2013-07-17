var Tree = function(stage) {

	var inst = this
	
	var layers = stage.getLayers()
	this.connectorslayer = layers[0]
	this.nodelayer = layers[1]

	this.nodes = []
	this.activenode = null
	this.activeconnector = null
	
	var drawingFromNode = null;
	var drawingConnector = null;
	
	this.nodelistener = null
	this.connectorlistener = null

	this.addNodeListener = function(myfunc) {
		this.nodelistener = myfunc
	}
	this.addConnectorListener = function(myfunc) {
		this.connectorlistener = myfunc
	}

	var fill_main       = [ 0, 'red',       1, 'yellow' ]
	var fill_highlight  = [ 0, 'limegreen', 1, 'yellow' ]
	var fill_drag       = [ 0, 'yellow',    1, 'white' ]

	var dotradius = 20

	this.createNode = function(node) {

		var circle = new Kinetic.Group({
			x : node.x,
			y : node.y,
			draggable : true,
			id : node.eventid
		});

		var dot = new Kinetic.Circle({
			x : 0,
			y : 0,
			radius : dotradius,
			fillLinearGradientStartPoint : [-50, -50],
			fillLinearGradientEndPoint   : [ 50,  50],
			fillLinearGradientColorStops : fill_main,
			stroke : "black",
			strokeWidth : 2,
			name : 'dot'
		});

		var simpleText = new Kinetic.Text({
			text : '' + node.eventid,
			fontStyle : 'bold',
			align : 'center',
			fontSize : 20,
			fontFamily : "Arial",
			fill : "black"
		});

		var tw = simpleText.getTextWidth()
		var th = simpleText.getTextHeight()
		simpleText.setX(-tw / 2)
		simpleText.setY(-th / 2)

		/*
		var plus = new Kinetic.Polygon({
			points : [ 0, 0, 4, 0, 4, -4, 8, -4, 8, 0, 12, 0, 12, 4, 8, 4, 8,
					8, 4, 8, 4, 4, 0, 4 ],
			fill : "#00ff00",
			x : 12,
			y : 12,
			stroke : "black",
			strokeWidth : 1,
			name : 'plus'
		})
		*/
		circle.on('dblclick', function(e) {
			//circle.fire('mouseup')
			drawingFromNode = node
			inst.connectorslayer.add(inst.createConnector('blank'))
			$('#container').mousemove(function(e) {
				inst.drawConnector(drawingFromNode, e)
			})
		})


		circle.add(dot)
		circle.add(simpleText)

		circle.on("dragstart", function(e) {
			dot.setFillLinearGradientColorStops (fill_drag)
		})

		circle.on("dragend", function(e) {
			this.fire('click')
			inst.activateNode(this)
		})

		circle.on("mouseover", function() {
			this.setOpacity(.8)
			inst.nodelayer.draw()
			document.body.style.cursor = "pointer";
			var drawingConnector = inst.connectorslayer.get('#lineconnector_blank')
			if (drawingFromNode == this) drawingConnector.hide()
		})

		circle.on("mouseout", function() {
			this.setOpacity(1)
			inst.nodelayer.draw()
			document.body.style.cursor = "default"
			inst.connectorslayer.get('#lineconnector_blank').show()
		})

		circle.on('mousedown', function() {
			inst.activateNode(this)
		})

		circle.on("mouseup", function(e) { 
			if (drawingFromNode) { 
				var connector = inst.connectorslayer.get('#lineconnector_blank')[0]
				connector.remove()
				connector = inst.addConnector(node,	drawingFromNode)
		
				inst.activateConnector(connector)
				drawingFromNode = null
			}

		})

		circle.on("dragmove", function(e) {

			node.x = this.attrs.x;
			node.y = this.attrs.y;
			// update parent connectors:
			var parents = events[node.eventid].parents || []
			var children = node.children || []
			for ( var i = 0; i < parents.length; i++) {
				var _parent = events[parents[i].eventid].node
				inst.drawConnector(node, _parent)
			}

			for ( var i = 0; i < children.length; i++) {
				var child = events[children[i]].node
				inst.drawConnector(child, node)
			}
			inst.connectorslayer.draw()
		})
		this.nodes.push(circle)
		return circle;
	}

	this.findNode = function(eventid) {
		for ( var i in this.nodes) {
			var node = this.nodes[i]
			if (node.getId() == eventid)
				return node
		}
		return false
	}

	this.activateNode = function(node) {
		inst.deactivateConnector(inst.activeconnector)
		inst.deactivateNode(inst.activenode)
		node.get('.dot')[0].setFillLinearGradientColorStops (fill_highlight)
		inst.activenode = node
		inst.nodelayer.draw()
		if (this.nodelistener)
			this.nodelistener(inst.activenode)
	}

	this.deactivateNode = function(node) {
		if (!node) 
			return
		node.get('.dot')[0].setFillLinearGradientColorStops(fill_main)
		inst.nodelayer.draw()
	}

	this.activateConnector = function(connector) {
		if (!connector)
			return

		inst.deactivateNode(inst.activenode)
		inst.deactivateConnector(inst.activeconnector)
		connector.get('.arrow')[0].setFill('#590')
		connector.get('.arrow')[0].setStroke('#590')
		connector.get('.line')[0].setStroke('#590')
		connector.get('.line')[0].setStrokeWidth(6)
		connector.get('.line')[0].setDashArray([ 10, 10 ])

		inst.activeconnector = connector
		inst.connectorslayer.draw()
		if (this.connectorlistener)
			this.connectorlistener(inst.activeconnector)
	}

	this.deactivateConnector = function(connector) {
		if (!connector)
			return

		connector.get('.arrow')[0].setFill('#000')
		connector.get('.arrow')[0].setStroke('#000')
		connector.get('.line')[0].setStroke('#333')
		connector.get('.line')[0].setStrokeWidth(3)
		connector.get('.line')[0].setDashArray([])
		inst.connectorslayer.draw()
	}

	this.addConnector = function(nodeA, nodeB) {

		if (nodeA == nodeB)
			return false
		var eventA = events[nodeA.eventid]
		if (!eventA.parents)
			eventA.parents = []
		if (!nodeB.children)
			nodeB.children = []

		if ($.inArray(nodeB, eventA.parents) > -1
			&& $.inArray(nodeA.eventid, nodeB.children) > -1) {
			// already added
			return false
		}

		eventA.parents.push(nodeB)
		nodeB.children.push(nodeA.eventid)

		var connector = inst.createConnector(nodeA.eventid + '_'
				+ nodeB.eventid)
		inst.connectorslayer.add(connector)
		inst.drawConnector(nodeA, nodeB)
	}

	this.createConnector = function(id) {

		var connector = new Kinetic.Group({
			x : 0,
			y : 0,
			draggable : false,
			id : 'lineconnector_' + id
		});

		var line = new Kinetic.Line({
			points : [ 0, 0, 0, 0 ],
			stroke : '#333',
			strokeWidth : 3,
			lineCap : 'round',
			name : 'line',
			detectionType : 'pixel',
			shadow : {
				color : '#999',
				blur : 2,
				offset : [ 4, 4 ],
				alpha : 0.5
			}
		})

		var arrow = new Kinetic.Polygon({
			points : [ 0, 0, 0, 0, 0, 0 ],
			fill : "#000",
			stroke : "black",
			strokeWidth : 3,
			name : 'arrow'
		});

		connector.add(line)
		connector.add(arrow)

		arrow.on('mousedown', function(e) { console.log ('a')
			inst.activateConnector(connector)
		})

		arrow.on("mouseover", function() {
			connector.setOpacity(.8)
			inst.connectorslayer.draw()
			document.body.style.cursor = "pointer";
		});

		arrow.on("mouseout", function() {
			connector.setOpacity(1)
			inst.connectorslayer.draw()
			document.body.style.cursor = "normal";
		});
		return connector
	}

	this.drawConnector = function(nodeA, nodeB) {

		if (!nodeA)
			return

		var x0 = nodeA.x
		var y0 = nodeA.y

		var id = '#lineconnector_';
		if (nodeB.type == "mousemove") { // event object instead
			if (!drawingFromNode)
				return;

			// Drawing a new connector
			id += "blank"
			var x0 = event.layerX
			var y0 = event.layerY
			var x1 = nodeA.x
			var y1 = nodeA.y
			
		} else {
			id += nodeA.eventid + '_' + nodeB.eventid
			var x1 = nodeB.x
			var y1 = nodeB.y
		}

		var connector = inst.connectorslayer.get(id)[0]
		connector.setPosition([ x0, y0 ])

		var dx = x1 - x0
		var dy = y1 - y0

		var hyp = Math.sqrt(dx * dx + dy * dy)

		var sinx = dy / hyp;
		var cosx = dx / hyp

		if (nodeB != null) {
			var _x0 = dotradius * cosx
			var _y0 = dotradius * sinx
		} else {
			var _x0 = 0
			var _y0 = 0
		}

		var alen = 15;

		var _x1 = (x1 - x0) - dotradius * cosx
		var _y1 = (y1 - y0) - dotradius * sinx

		var line = connector.get('.line')[0]
		var arrow = connector.get('.arrow')[0]

		var p0x = _x0
		var p0y = _y0
		var tx = _x0 + cosx * alen
		var ty = _y0 + sinx * alen
		var p1x = tx - sinx * alen / 2
		var p1y = ty + cosx * alen / 2
		var p2x = tx + sinx * alen / 2
		var p2y = ty - cosx * alen / 2

		arrow.setPoints([ p0x, p0y, p1x, p1y, p2x, p2y ])
		line.setPoints([ tx, ty, _x1, _y1 ])
		if (hyp < dotradius) {
			arrow.hide()
			line.hide()
		} else {
			console.log (tx, _x1)
			arrow.show()
			line.show()
		}
		
		inst.connectorslayer.draw()
	}
}