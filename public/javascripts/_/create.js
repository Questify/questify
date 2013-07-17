
var connectordrawing = false

var data = [
 {id:1, title:'blah1'},
 {id:2, title:'blah4', parents: [ {eventid: 5 } ]},
 {id:3, title:'blah3'},
 {id:4, title:'blah5'},
 {id:5, title:'blah2', parents: [ {eventid: 7}, {eventid: 8}] },
 {id:6, title:'blah1'},
 {id:7, title:'blah4', parents: [ {eventid: 6 } ]},
 {id:8, title:'blah3'},
 {id:9, title:'blah2', parents: [ {eventid: 1}, {eventid: 2}] },
]

var events = []

for ( var i in data) {
	var event = data[i]
	events[event.id] = event
	var node = {};
	var level = 0;
	node.x = 50 + Math.random() * 300
	node.y = 50 + Math.random() * 300
	node.eventid = event.id
	event.node = node
}

function orderTree() {
	for ( var i in events) {
		var event = events[i]
		pevent = event
		var level = 0;
		while (true) {
			if (pevent.parents) {
				var pid = pevent.parents[0].eventid
				level++;
				pevent = events[pid]
			} else
				break;
		}
		events[i].node.y = 50 + level * 100;
	}
}

var activeevent = null

orderTree()

var nodelayer		 = new Kinetic.Layer({name: 'nodes'});
var connectorslayer  = new Kinetic.Layer({name: 'connectors'});

window.onload = function() {

	var stage = new Kinetic.Stage({
		container : "container",
		width : $("#container").width(),
		height : $("#container").height()
	});
	
	stage.add(connectorslayer)
	stage.add(nodelayer)
	
	var tree = new Tree(stage);
	tree.addNodeListener(function(node) {
		$('tr#event_' + node.eventid).addClass('selected')
	})

	var createConnectors = function(node) {

		var event = events[node.eventid];
		if (!event.parents)
			return

		var lines = []

		for ( var j in event.parents) {

			var _parent = event.parents[j]
			var parentnode = events[_parent.eventid].node
			parentnode.children = parentnode.children || []
			parentnode.children.push(node.eventid)

			var connector = tree.createConnector(node.eventid + '_'	+ parentnode.eventid)
			lines.push(connector)
		}
		return lines
	}

	$('tr.event').on('click', function(e) {
		var eventid = $(this).attr('data-id')
		tree.activateNode(tree.findNode(eventid))
		$('#event_' + activeevent).removeClass('highlight')
		$(this).addClass('highlight')
		activeevent = eventid
	})

	for ( var i in events) {
		var eventhtml = '<tr class="event" id="event_' + events[i].id
				+ '" data-id="' + events[i].id + '"><td>' + events[i].id
				+ '</td><td>' + events[i].title + '</td></tr>'
		$('.eventlist').append(eventhtml)
		var node = events[i].node
		var circle = tree.createNode(node)
		var connectors = createConnectors(node)
		for ( var j in connectors) {
			connectorslayer.add(connectors[j])
		}
		nodelayer.add(circle);
		circle.fire('dragmove')
	}
	connectorslayer.draw()
	nodelayer.draw();
	buildMenu()
}

function buildMenu() {

	$('#event_add').on('click', function(e) {
		var node = {
			eventid : events.length,
			x : 10,
			y : 10,
			children : []
		}
		var event = {
			id : events.length,
			title : '',
			node : node
		}
		events.push(event)
		nodelayer.add(tree.createNode(event.node))
		nodelayer.draw()
	})

	$('#event_delete').on('click', function(e) {
		var event = addEvent()
		nodelayer.add(tree.createNode(event.node))
		nodelayer.draw()
	})
}


