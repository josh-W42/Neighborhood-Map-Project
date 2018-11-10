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
    new Promise((resolve) => {
      this.setCurrentLocation(map, resolve)
    })
    .then(() => {
      this.setState({
        map: map
      });
      const {google} = this.props;
      const options = {
        location: map.center,
        radius: '1000',
        types: ['restaurant', 'cafe', 'food']
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
    });
  }

  setCurrentLocation(map, callback) {
    // returns an object with lat lng props

    let options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    function error(error) {
      console.warn(`ERROR(${error.code}): ${error.message}`);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        let cord = position.coords;
        let location = {
          lat: cord.latitude,
          lng: cord.longitude
        };
        map.setCenter(location);
        callback();
      }, error, options);
    } else {
      console.log('Geolocation Unavalible, using default location');
      callback();
    }
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
