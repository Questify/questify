
var icon = {
    'src' : '/graphics/flag-full.png'
   ,'width': 96
   ,'height' : 96
}

var GUID = function () {
    var S4 = function () {
        return Math.floor(
                Math.random() * 0x10000 /* 65536 */
            ).toString(16);
    };

    return (
            S4() + S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + S4() + S4()
        );
}


var QuestifyMarker = function (lat, lon, title) {
    this.ref
    this.lat = lat
    this.lon = lon
    this.title = title
    this.guid = GUID()
    return this
}

QuestifyMarker.prototype.setRef = function (ref) {
    this.ref = ref
}

QuestifyMarker.prototype.icon = {
    'src' : '/graphics/flag-full.png'
    ,'width': 96
    ,'height' : 96
}



var QuestifyMap = function QuestifyMap (domelement) {
    var self = this
    var map
    var markerLayer
    var movingMarker

    var markers = {}

    var callbacks = {
        'markeradded'   : []
       ,'markerremoved' : []
       ,'markermoved'   : []
    }

    self.trigger = function (event, marker) {
        for (var i in callbacks[event]) {
            callbacks[event][i](marker)
        }
    }

    self.init = function (domelement) {
        var map = mapbox.map(domelement)

        $('#'+domelement).mousemove(function (e) {
            if (self.movingMarker) {
                MM.cancelEvent(e)
                $(self.movingMarker).trigger('_drag',e)
            }
        })
        $('#'+domelement).mouseup(function (e) {
            if (self.movingMarker) {
                $(self.movingMarker).trigger('stop')
                self.movingMarker = null
            }
        })

        $('#'+domelement).droppable({
            'drop': function (e,ui) {
                if (!$(ui.helper).hasClass('marker')) {
                    $(ui).remove()
                    var loc = self.map.pointLocation({x:e.clientX,y:e.clientY})
                    var marker = new QuestifyMarker(loc.lat,loc.lon,'New location')
                    self.addMarker(marker)
                    self.trigger('markeradded',marker)
                }
            }
        })
        map.smooth(true)
        map.addLayer(mapbox.layer().id('tmcw.map-2f4ad161'));
        markerLayer = mapbox.markers.layer();
        var markeradded = function (layer,marker) {
            var id = marker.data.properties.guid
            var elem = marker.element
            $(elem).attr('data-guid',id)
        }
        mapbox.markers.interaction(markerLayer)
        markerLayer.key(function(f) { return f.properties.guid })
        markerLayer.addCallback('markeradded',markeradded)
        markerLayer.factory(function(m) {

            var elem = mapbox.markers.simplestyle_factory(m);
            $(elem).addClass('marker')
            $(elem).attr('src',icon.src)
            $(elem).attr('data-guid',m.properties.guid)
            $(elem).css('pointer-events','all')
            $(elem).attr('width',icon.width)
            $(elem).attr('height',icon.height)
            $(elem).css('clip','none')
            $(elem).css('left','0px')
            $(elem).css('top','0px')
            $(elem).css('margin-left',-icon.width/2 + 'px')
            $(elem).css('margin-top',-icon.height/2 +'px')

            $(elem).draggable({
                start: function (e) {
                    $(this).hide()
                    $(this).css('top','0px')
                    $(this).css('left','0px')
                    self.movingMarker = this
                },
            })

            $(elem).on('_drag',function(e1,e) {
                $(this).css('top','0px')
                $(this).css('left','0px')
                $(this).show()
                var id = $(this).attr('data-guid')
                var x = e.clientX
                var y = e.clientY
                var loc = self.map.pointLocation({x:x,y:y})
                var myfeatures = self.markerLayer.features()
                var fid = self.findFeature(myfeatures,id)
                myfeatures[fid].geometry.coordinates = [loc.lon, loc.lat]
                self.markerLayer.features(myfeatures);

            })

            $(elem).on('stop',function(e1,e) {
                $(this).css('top','0px')
                $(this).css('left','0px')
                $(this).show()
                var myfeatures = self.markerLayer.features()
                self.markerLayer.features(myfeatures);
                self.map.setExtent(self.markerLayer.extent());
                self.trigger('markermoved',markers[$(this).attr('data-guid')])

            })
            return elem;
        });
        map.addLayer(markerLayer)
        self.markerLayer = markerLayer
        self.map = map
    }

    self.findFeature = function (features, locationid) {
        for (var i = 0; i<features.length; i++) {
            if (features[i].properties.id == locationid) return i
        }
        return false
    }

    self.addMarker = function (questifyMarker) {

        var ref = questifyMarker.ref

        var feature = {
                "geometry": { "type": "Point", "coordinates": [questifyMarker.lon, questifyMarker.lat]},
                "properties": { "id": questifyMarker.guid, "title": questifyMarker.title, 'guid': questifyMarker.guid }
        }

        var f = self.markerLayer.add_feature( feature )
        questifyMarker.feature = f
        markers[questifyMarker.guid] = questifyMarker
        return questifyMarker
    }


    self.setBounds = function () {
        self.map.setExtent(self.markerLayer.extent());
    }

    self.addCallback = function (event, cb) {
        if (!(event == 'markerremoved' || event == 'markeradded' || event == 'markermoved')) return
        callbacks[event].push (cb)
    }
    if (domelement) self.init(domelement)
    return self
}

$('img#addlocation').draggable({
    helper: function() {
        return $('img#addlocation-full').clone().css('margin-left','0px').css('margin-top','-24px').show();
    }
})



