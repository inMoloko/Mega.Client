/**
 * Created by Nekrasov on 10.05.2017.
 */
L.Marker.IconShowMarker = L.Marker.extend({
    initialize: function (mapObject, organization, options = {}) {
        this._mapObject = mapObject;
        this._options = options;
        this._organization = organization;
    },


    onAdd: function (map) {

        let icon = this._getIcon(this._mapObject, map.getZoom());

        let self = this;

        if (!self._options.title) {
            self._options.title = self._organization.Name;
        }

        let options = {icon: icon, title: self._options.title};

        if (!self._options.threshold) {
            self._options.threshold = map.getMaxZoom() - 1;
        }

        L.Marker.prototype.initialize.call(this, map.convertPosition(this._mapObject)/*map.unproject([this._mapObject.Longitude, this._mapObject.Latitude], map.getMaxZoom())*/, options);

        L.Marker.prototype.onAdd.call(this, map);

        this._map.on('zoomend', this._zoom, this);

    },

    onRemove: function (map) {
        L.Marker.prototype.onRemove.call(this, map);
        this._map.off('zoomend', this._zoom, this);
    },
    _zoom: function (zm) {
        let self = this;
        let zoom = this._map.getZoom();
        //if (self._lastZoom === zoom)
        //    return;
        this.setIcon(this._getIcon(this._mapObject, zoom));
        self._lastZoom = zoom;
    },

    _getIcon: function (item, zm) {
        let self = this;


        let selected = self._icon ? self._icon.querySelector('._selected') : false;
        let cls = selected ? ' _selected' : '';
        if (zm === self._map.getMaxZoom()) {
            return L.divIcon({
                iconSize: [22, 22],
                className: 'marker__image',
                html: `<img class="marker__image-sq${cls}" src="${self._options.src}" data-map-id="${this._mapObject.MapObjectID}" data-org-id="${this._organization.OrganizationID}"/><div>${self._options.title}</div>`
            });
        }
        else if (zm >= self._options.threshold) {
            return L.divIcon({
                iconSize: [22, 22],
                className: 'marker__image',
                html: `<img class="marker__image-sq${cls}" src="${self._options.src}" data-map-id="${this._mapObject.MapObjectID}" data-org-id="${this._organization.OrganizationID}"/>`
            });
        } else {
            return L.divIcon({
                iconSize: [22, 22],
                className: 'marker__image',
                html: `<svg><circle class="marker__item${cls}" cx="5" cy="5" r="5" data-org-id="${this._organization.OrganizationID}" data-map-id="${this._mapObject.MapObjectID}"/></svg>`
            });
        }
    }
});

L.Marker.iconShowMarker = function (mapObject, organization, options) {
    return new L.Marker.IconShowMarker(mapObject, organization, options);
};