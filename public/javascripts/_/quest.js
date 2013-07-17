
var qMap = new QuestifyMap ('map')

qMap.addCallback('markeradded', function (marker) {
    console.log ('added')
    console.log(marker)
})

qMap.addCallback('markermoved', function (marker) {
    console.log ('moved')
    console.log(marker)
})


var locations = [
     {id:0, title: 'The old well', coords: [ { latitude: 63.42757, longitude: 10.41273} ] }
    ,{id:1, title: 'The statue', coords: [ {latitude: 63.42707, longitude: 10.40903} ] }
    ,{id:2, title: 'The mound', coords: [ {latitude: 63.42897, longitude: 10.4133} ] }
]
var markers = []
for ( var i in locations) {
    loc = locations[i]
    if (!loc.id) loc.id = parseInt(i+20,10)

    var marker = new QuestifyMarker(loc.coords[0].latitude,loc.coords[0].longitude,loc.title)
    qMap.addMarker(marker)
}
qMap.setBounds()


$('img#addlocation').draggable({
    helper: function() {
        return $('img#addlocation-full').clone().css('margin-left','0px').css('margin-top','-24px').show();
    }
})



