import React, { Component } from "react";
import { Polyline, withLeaflet } from "react-leaflet";
import L from "leaflet";
import "leaflet-polylinedecorator";

let layerAhh = null;

class PolylineDecorator extends Component {
  constructor(props) {
    super(props);
    this.polyRef = React.createRef();
  }

  componentWillUnmount(nextProps) {

      console.log("_______________UNMOUNT")
      const { map } = this.polyRef.current.props.leaflet;
      layerAhh.removeFrom(map);

  }

  componentDidMount() {

      console.log("_______________DIDMOUNT")

    const polyline = this.polyRef.current.leafletElement;
    const { map } = this.polyRef.current.props.leaflet;

    layerAhh = L.polylineDecorator(polyline, {
        patterns: [ {offset: 0, repeat: 50, symbol: L.Symbol.arrowHead({pixelSize: 8, polygon: false, pathOptions: {stroke: true, color: "#333047"}})} ]
    })

    layerAhh.addTo(map);

  }

  render() {
    return <Polyline ref={this.polyRef} {...this.props} color="#403C58" />;
  }
}

export default withLeaflet(PolylineDecorator);
