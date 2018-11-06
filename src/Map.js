import React, { Component } from 'react';
import {Map, Marker, InfoWindow} from 'google-maps-react';
import {searchNearby} from './utils/GoogleApiHelpers.js';
import SideUI from './SideUI.js';

class MapContainer extends Component {

  state = {
    places: [],
    map: {},

    infoWindowOpen: false,
    activeMarker: {}
  }

  onMarkerClick() {
    console.log(this);
  }

  onReady(mapProps, map) {
    this.setState({
      map: map
    });
    const {google} = this.props;
    const options = {
      location: map.center,
      radius: '1000',
      types: ['restaurant']
    }
    searchNearby(google, map, options)
    .then((results) => {
      this.setState({
        places: results
      });
    }).catch((response, status) => {
      console.log(status);
      console.log(response);
    });
  }

  render() {

    return (
      <div>
        <SideUI
          google={this.props.google}
          places={this.state.places}
          map={this.state.map}
          onMapUpdate={ (places) => this.setState({ places: places }) }
          />
        <Map
          onReady={this.onReady.bind(this)}
          google={this.props.google}
          zoom={16}
          initialCenter={{
            lat: 34.069064,
            lng: -118.445050
          }}
          >
          {console.log(this.state.places)}
          {
            this.state.places.map( (place) => (
              <Marker
                key={place.id}
                onClick={() => this.onMarkerClick()}
                animation={this.props.google.maps.Animation.DROP}
                position={{
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                }}
                name={place.name}
              />
            ))
          }
          <InfoWindow
            marker={this.state.activeMarker}
            visible={this.state.infoWindowOpen}
          />
        </Map>
      </div>
    );
  }
}

export default MapContainer
