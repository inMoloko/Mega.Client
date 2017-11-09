L.Marker.ZoomingMarker = L.Marker.extend({
    initialize: function (mapObject, options = {}) {
        this._mapObject = mapObject;
        this._zoomCache = {};
    },


    onAdd: function (map) {

        let icon = this._getIcon(this._mapObject, map.getZoom());

        let options = {icon: icon};

        L.Marker.prototype.initialize.call(this, map.convertPosition(this._mapObject) /*map.unproject([this._mapObject.Longitude, this._mapObject.Latitude], map.getMaxZoom())*/, options);

        L.Marker.prototype.onAdd.call(this, map);

        this._map.on('zoomend', this._zoom, this);

    },

    onRemove: function (map) {
        L.Marker.prototype.onRemove.call(this, map);
        this._map.off('zoomend', this._zoom, this);
    },
    _zoom: function (zm) {
        this.setIcon(this._getIcon(this._mapObject, this._map.getZoom()));
    },


    _getIcon: function (item, zm) {
        let self = this;
        // let start = this._map.getMinZoom();
        // let origin = [start];
        // while (start < this._map.getMaxZoom()) {
        //     start++;
        //     origin.push(start);
        // }
        // //let origin = [17, 18, 19];
        // let revers = [...origin].reverse();
        // //let zoom = revers[origin.indexOf(Math.round(zm))];
        // let zoom = 17 + (this._map.getMaxZoom() - zm);

        var text = ((item.Params.SignText !== undefined) && (item.Params.SignText !== null) && (item.Params.SignText.length !== 0)) ? item.Params.SignText : item.Name;
        let position = new L.latLng(item.Latitude, item.Longitude);//this._map.unproject([item.Longitude, item.Latitude], zoom);
        let rad = self._map.offsetLng(position, item.Params.SignPointRadius);


        let zoom = self._map.getZoom();

        if(self._zoomCache[zoom]!== undefined){
            let oldValue = self._zoomCache[zoom];
            return L.divIcon({
                iconSize: [oldValue.width, oldValue.height],
                className: 'anchor-icon',
                html: `<span style="font-size:${oldValue.fontSize}px;">${text}</span>`,
                iconAnchor: [oldValue.width / 2, oldValue.height / 2]
            });
        }

        let fontSize = 1;
        let s = document.createElement("span");
        s.innerHTML = text;
        s.style.visibility = "hidden";
        s.style.fontFamily = "Verdana";
        s.style.whiteSpace = "nowrap";
        s.style.fontWeight = "bold";
        s.style.fontSize = fontSize + 'px';

        document.body.appendChild(s);
        let oldRes, res;
        oldRes = res = {width: s.offsetWidth, height: s.offsetHeight, fontSize: fontSize};

        document.body.removeChild(s);

        //let style = parseInt(window.getComputedStyle(s, null).getPropertyValue('font-size'));

        let radius = self._map.latLngToContainerPoint(position).distanceTo(self._map.latLngToContainerPoint(rad));

        let counter = 0;
        while (res.width < 2 * radius && counter<5000) {
            oldRes = {width: res.width, height: res.height, fontSize: fontSize};
            fontSize++;
            s.style.fontSize = fontSize + 'px';

            document.body.appendChild(s);
            res = {width: s.offsetWidth, height: s.offsetHeight};
            document.body.removeChild(s);
            counter++;
        }
        fontSize = fontSize - 1;

        self._zoomCache[zoom] = oldRes;

        let div = L.divIcon({
            iconSize: [oldRes.width, oldRes.height],
            className: 'anchor-icon',
            html: `<span style="font-size:${oldRes.fontSize}px;">${text}</span>`,
            iconAnchor: [oldRes.width / 2, oldRes.height / 2]
        });
        return div;
    }

});

L.Marker.zoomingMarker = function (organization, options) {
    return new L.Marker.ZoomingMarker(organization, options);
};