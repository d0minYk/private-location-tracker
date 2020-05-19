import L, { divIcon } from 'leaflet';
import React from 'react';
import { FeatureGroup, Map, Marker, Polygon, Polyline, TileLayer, withLeaflet, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'react-leaflet-markercluster/dist/styles.min.css';
import './leaflet.css'
import PolylineDecorator from "./PolylineDecorator";
import Utilities from './Utilities';

class MapC extends React.Component {

    constructor(props) {
        super(props);
        // this.mapRef = createRef();
        // this.groupRef = createRef();
        this.preventScrollEventFiring = false;
        this.state = {
            zoom: 13,
            center: [51.505, -0.09],
            locations: null,
        }
    }

    shouldComponentUpdate(nextProps, nextState) {

        if (nextProps.mode !== this.props.mode) {
            return true;
        }

        //console.log("SHOULD? ", nextProps.visibleLocations, this.props.visibleLocations)
        if (nextProps.locations && this.props.locations && nextProps.locations.length === this.props.locations.length) {
            // console.log("SHOULD NO");
            return false;
        }

        // if (nextProps.visibleLocations && this.props.visibleLocations && nextProps.visibleLocations.length !== 0 && this.props.visibleLocations.length !== 0 && nextProps.visibleLocations.length !== this.props.visibleLocations.length && nextProps.visibleLocations[0].id === this.props.visibleLocations[0].id) {
        //     console.log("SHOULD NO HERE");
        //     return false;
        // }

        // console.log("SHOULD YES")
        return true;
    }

    // http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
    // https://api.mapbox.com/styles/v1/kinim0d/ck6cirr3z07rh1iq5fjcjeoni/tiles/512/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2luaW0wZCIsImEiOiJjazI5MndrMHkyMzY5M2RtcXNvMnFmbXhqIn0.KBRld5RKPh3qAwDkjE3zTA

    render() {

        let locations = JSON.parse(JSON.stringify(this.props.locations))
        console.log(locations, "===============------------------------")

        let path = locations.map(item => {
            return [parseFloat(item.lat), parseFloat(item.lng)]
        })

        return (
            <div id="map-container" data-data={this.props.mapTest}>
                { (true) &&
                    <Map id="main-map" className="markercluster-map" center={this.state.center} zoom={this.state.zoom} ref={this.props.mapRef} zoomControl={false} maxZoom={19}>
                        <TileLayer
                          attribution="&copy; <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> &copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
                          url="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <FeatureGroup ref={this.props.groupRef}>
                            <MarkerClusterGroup>
                            { (this.props.locations) && (this.props.locations.length !== 0) && (this.props.mode === "path") &&
                                <PolylineDecorator positions={path} />
                             }

                             {/*<Polyline
                                 positions={this.props.locations.map(item => { return [item.lat, item.lng] })}
                                 color="#403C58"
                             />*/}

                            { (this.props.locations) && (this.props.mode === "point") && this.props.locations.map(item => {
                                return (<Marker
                                    position={[item.lat, item.lng]}
                                    onClick={() => { this.props.onMarkerClick(item.id); }}
                                    icon={new divIcon({className: 'marker', html: `<div class="marker-custom"></div>`})
                                    }
                                >
                                <Popup>
                                    <p>{Utilities.formatDate(item.date, "HH:MM DD/MM/YYYY")}</p>
                                    { (item.house || item.street || item.city || item.country) ?
                                        <p style={{ marginBottom: 0 }}>
                                            {(item.house) && item.house + " "}
                                            {(item.street) && item.street + " "}
                                            {(item.city) && item.city + " "}
                                            {(item.country) && item.country + " "}
                                        </p>
                                        :
                                        <p style={{ marginBottom: 0 }}>{item.lat},{item.lng}</p>
                                    }
                                </Popup>
                                </Marker>)
                            }) }
                            </MarkerClusterGroup>
                         </FeatureGroup>
                    </Map>
                }
            </div>
        );
    }

};


export default MapC;
